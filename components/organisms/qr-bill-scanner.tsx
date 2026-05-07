"use client";

import Link from "next/link";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitScannedQrBill } from "@/app/actions/bank";
import { Button } from "@/components/atoms/button";
import { parseSwissQrBill } from "@/lib/qr-bill";

type UiState =
  | "requesting"
  | "scanning"
  | "denied"
  | "unsupported"
  | "invalid"
  | "submitting";

type BarcodeDetectorLike = {
  detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

function createNativeQrDetector(): BarcodeDetectorLike | null {
  if (typeof globalThis === "undefined" || !("BarcodeDetector" in globalThis)) {
    return null;
  }
  const Ctor = (globalThis as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  try {
    return new Ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

type QrEnginePromise = ReturnType<(typeof import("qr-scanner"))["default"]["createQrEngine"]>;
type QrEngine = Awaited<QrEnginePromise>;

export function QrBillScanner() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const enginePromiseRef = useRef<QrEnginePromise | null>(null);
  const [uiState, setUiState] = useState<UiState>("requesting");
  const [scanSession, setScanSession] = useState(0);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() => setUiState("unsupported"));
      return;
    }

    queueMicrotask(() => setUiState("requesting"));

    let destroyed = false;
    let lastDecodeAttempt = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const detector = typeof window !== "undefined" ? createNativeQrDetector() : null;

    async function getQrEngine(): Promise<QrEngine> {
      if (!enginePromiseRef.current) {
        const mod = await import("qr-scanner");
        mod.default.WORKER_PATH = "/qr-scanner-worker.min.js";
        enginePromiseRef.current = mod.default.createQrEngine();
      }
      return enginePromiseRef.current;
    }

    async function tick() {
      if (destroyed || !videoRef.current) return;
      const videoEl = videoRef.current;

      const now = performance.now();
      if (now - lastDecodeAttempt < 100) {
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
        return;
      }
      lastDecodeAttempt = now;

      if (videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
        return;
      }

      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      if (!ctx || canvas.width === 0 || canvas.height === 0) {
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
        return;
      }

      ctx.drawImage(videoEl, 0, 0);

      try {
        let raw: string | null = null;
        if (detector) {
          const results = await detector.detect(canvas);
          raw = results[0]?.rawValue ?? null;
        } else {
          const QrScanner = (await import("qr-scanner")).default;
          QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";
          try {
            const result = await QrScanner.scanImage(canvas, {
              qrEngine: await getQrEngine(),
            });
            raw = typeof result === "string" ? result : result.data;
          } catch {
            // No QR in frame (e.g. qr-scanner's NO_QR_CODE_FOUND)
          }
        }

        if (raw) {
          const draft = parseSwissQrBill(raw);
          if (draft) {
            destroyed = true;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
            setUiState("submitting");
            void (async () => {
              try {
                await submitScannedQrBill(raw);
              } catch (e) {
                const digest =
                  e && typeof e === "object" && "digest" in e
                    ? String((e as { digest?: unknown }).digest)
                    : "";
                if (digest.startsWith("NEXT_REDIRECT")) {
                  const parts = digest.split(";");
                  const target = parts.length >= 3 ? parts[2] : "/make-payment";
                  router.push(target);
                  return;
                }
                unstable_rethrow(e);
                setUiState("invalid");
              }
            })();
            return;
          }
        }
      } catch {
        // ignore single-frame decode errors
      }

      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    }

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (destroyed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setUiState("scanning");
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      } catch {
        if (!destroyed) setUiState("denied");
      }
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      video.srcObject = null;
    };
  }, [scanSession, router]);

  return (
    <div className="space-y-4">
      <div
        className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-card-border bg-black/80"
        aria-live="polite"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          aria-label={t("bankScanQr.videoLabel")}
        />
        {(uiState === "requesting" || uiState === "scanning" || uiState === "submitting") && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-center text-sm text-white">
            {uiState === "requesting" && t("bankScanQr.states.requesting")}
            {uiState === "scanning" && t("bankScanQr.states.scanning")}
            {uiState === "submitting" && t("bankScanQr.states.submitting")}
          </div>
        )}
      </div>

      {uiState === "denied" && (
        <p className="text-sm text-muted-foreground">{t("bankScanQr.states.permissionDenied")}</p>
      )}
      {uiState === "unsupported" && (
        <p className="text-sm text-muted-foreground">{t("bankScanQr.states.notSupported")}</p>
      )}
      {uiState === "invalid" && (
        <p className="text-sm text-destructive">{t("bankScanQr.states.invalidQr")}</p>
      )}

      {(uiState === "denied" || uiState === "unsupported" || uiState === "invalid") && (
        <div className="flex flex-wrap gap-3">
          <Link href="/make-payment" className="inline-flex">
            <Button variant="secondary">{t("bankScanQr.actions.manualEntry")}</Button>
          </Link>
          {(uiState === "invalid" || uiState === "denied") && (
            <Button type="button" onClick={() => setScanSession((s) => s + 1)}>
              {t("bankScanQr.actions.tryAgain")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

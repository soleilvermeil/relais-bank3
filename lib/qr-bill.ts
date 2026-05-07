import { emptyPaymentDraft, type PaymentDraft } from "@/lib/bank-types";

function lineAt(lines: string[], index0: number): string {
  return lines[index0] ?? "";
}

/** Normalize payload: LF-separated lines, strip trailing CR per line. */
function splitLines(payload: string): string[] {
  const normalized = payload.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.split("\n");
}

function normalizeIban(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

function normalizeCountry(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 2).toLowerCase();
}

function mapCreditorAddress(
  addressType: string,
  streetOrLine1: string,
  houseOrLine2: string,
  postalCode: string,
  city: string,
): Pick<
  PaymentDraft,
  | "beneficiaryAddress1"
  | "beneficiaryAddress2"
  | "beneficiaryPostalCode"
  | "beneficiaryCity"
> {
  if (addressType === "S") {
    return {
      beneficiaryAddress1: streetOrLine1.trim(),
      beneficiaryAddress2: houseOrLine2.trim(),
      beneficiaryPostalCode: postalCode.trim(),
      beneficiaryCity: city.trim(),
    };
  }
  return {
    beneficiaryAddress1: streetOrLine1.trim(),
    beneficiaryAddress2: houseOrLine2.trim(),
    beneficiaryPostalCode: "",
    beneficiaryCity: "",
  };
}

function mapDebtorAddress(
  addressType: string,
  streetOrLine1: string,
  houseOrLine2: string,
  postalCode: string,
  city: string,
): Pick<
  PaymentDraft,
  "debtorAddress1" | "debtorAddress2" | "debtorPostalCode" | "debtorCity"
> {
  if (addressType === "S") {
    return {
      debtorAddress1: streetOrLine1.trim(),
      debtorAddress2: houseOrLine2.trim(),
      debtorPostalCode: postalCode.trim(),
      debtorCity: city.trim(),
    };
  }
  return {
    debtorAddress1: streetOrLine1.trim(),
    debtorAddress2: houseOrLine2.trim(),
    debtorPostalCode: "",
    debtorCity: "",
  };
}

/**
 * Parses Swiss QR-bill (SPC) payload per Swiss Payment Standards.
 * @see https://www.paymentstandards.ch/
 */
export function parseSwissQrBill(payload: string): PaymentDraft | null {
  if (payload.length > 997) {
    return null;
  }

  const lines = splitLines(payload);

  if (lines.length < 31) {
    return null;
  }

  if (lineAt(lines, 0) !== "SPC") {
    return null;
  }

  const version = lineAt(lines, 1);
  if (version !== "0200" && version !== "0201") {
    return null;
  }

  if (lineAt(lines, 2) !== "1") {
    return null;
  }

  if (lineAt(lines, 30) !== "EPD") {
    return null;
  }

  const creditorAddrType = lineAt(lines, 4);
  const creditorBlock = mapCreditorAddress(
    creditorAddrType,
    lineAt(lines, 6),
    lineAt(lines, 7),
    lineAt(lines, 8),
    lineAt(lines, 9),
  );

  const debtorAddrType = lineAt(lines, 20);
  const debtorName = lineAt(lines, 21).trim();
  const debtorCountry = normalizeCountry(lineAt(lines, 26));
  const debtorLines = mapDebtorAddress(
    debtorAddrType,
    lineAt(lines, 22),
    lineAt(lines, 23),
    lineAt(lines, 24),
    lineAt(lines, 25),
  );

  const refType = lineAt(lines, 27).trim().toUpperCase();
  const refNumber = lineAt(lines, 28).trim();
  let rfReference = "";
  if (refType === "QRR" || refType === "SCOR") {
    rfReference = refNumber;
  }

  const draft = emptyPaymentDraft();
  return {
    ...draft,
    beneficiaryIban: normalizeIban(lineAt(lines, 3)),
    beneficiaryName: lineAt(lines, 5).trim(),
    ...creditorBlock,
    beneficiaryCountry: normalizeCountry(lineAt(lines, 10)),
    amount: lineAt(lines, 18).trim(),
    debtorName,
    debtorCountry: debtorCountry || "",
    ...debtorLines,
    rfReference,
    communicationToBeneficiary: lineAt(lines, 29).trim(),
  };
}

import { Pool } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SCHEMA_PATH = join(process.cwd(), "lib", "db", "schema.sql");

declare global {
  var __relaisBankPool: Pool | undefined;
  var __relaisBankSchemaPromise: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!globalThis.__relaisBankPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    globalThis.__relaisBankPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return globalThis.__relaisBankPool;
}

/** Convert "@name" placeholders + params object into ($1,$2,...) + array; duplicate names reuse the same bind slot. */
function bindNamed(
  sql: string,
  params: Record<string, unknown> | undefined,
): { text: string; values: unknown[] } {
  if (!params) return { text: sql, values: [] };
  const order: string[] = [];
  const text = sql.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name: string) => {
    let i = order.indexOf(name);
    if (i === -1) {
      order.push(name);
      i = order.length - 1;
    }
    return `$${i + 1}`;
  });
  return { text, values: order.map((n) => params[n]) };
}

function splitSqlStatements(schema: string): string[] {
  return schema
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function ensureSchema(): Promise<void> {
  if (!globalThis.__relaisBankSchemaPromise) {
    globalThis.__relaisBankSchemaPromise = (async () => {
      const schema = readFileSync(SCHEMA_PATH, "utf-8");
      const pool = getPool();
      for (const stmt of splitSqlStatements(schema)) {
        await pool.query(stmt);
      }
    })();
  }
  return globalThis.__relaisBankSchemaPromise;
}

export async function dbAll<T>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
  await ensureSchema();
  const { text, values } = bindNamed(sql, params);
  const res = await getPool().query(text, values);
  return res.rows as T[];
}

export async function dbGet<T>(sql: string, params?: Record<string, unknown>): Promise<T | null> {
  const rows = await dbAll<T>(sql, params);
  return rows[0] ?? null;
}

export async function dbRun(sql: string, params?: Record<string, unknown>): Promise<void> {
  await dbAll(sql, params);
}

/** Insert returning the new primary key (SQL must end with RETURNING id). */
export async function dbInsert(sql: string, params?: Record<string, unknown>): Promise<number> {
  const row = await dbGet<{ id: number | string }>(sql, params);
  if (!row) throw new Error("Insert did not return id");
  return Number(row.id);
}

export type Tx = {
  all<T>(sql: string, params?: Record<string, unknown>): Promise<T[]>;
  get<T>(sql: string, params?: Record<string, unknown>): Promise<T | null>;
  run(sql: string, params?: Record<string, unknown>): Promise<void>;
  insert(sql: string, params?: Record<string, unknown>): Promise<number>;
};

export async function dbTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const tx: Tx = {
      all: async <R>(sql: string, params?: Record<string, unknown>) => {
        const { text, values } = bindNamed(sql, params);
        const r = await client.query(text, values);
        return r.rows as R[];
      },
      get: async <R>(sql: string, params?: Record<string, unknown>) => {
        const rows = await tx.all<R>(sql, params);
        return rows[0] ?? null;
      },
      run: async (sql, params) => {
        await tx.all(sql, params);
      },
      insert: async (sql, params) => {
        const row = await tx.get<{ id: number | string }>(sql, params);
        if (!row) throw new Error("Insert did not return id");
        return Number(row.id);
      },
    };
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  if (globalThis.__relaisBankPool) {
    await globalThis.__relaisBankPool.end();
    globalThis.__relaisBankPool = undefined;
    globalThis.__relaisBankSchemaPromise = undefined;
  }
}

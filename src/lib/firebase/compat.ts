/**
 * Firestore-backed compatibility shim that mimics the small subset of the
 * Supabase JS client used by the app: from(t).select/insert/update/delete,
 * .eq/.neq/.order/.limit/.single/.maybeSingle, count queries, basic relational
 * "joins" like `*, profiles(full_name)`, and a stub functions.invoke().
 *
 * This lets the existing pages keep their query syntax while running entirely
 * on Firebase Firestore underneath — no Supabase calls are made.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "./config";

type Result<T> = { data: T; error: { message: string } | null; count?: number | null };

interface Filter {
  field: string;
  op: WhereFilterOp;
  value: unknown;
}

const ts = (v: unknown): string => {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  const maybe = v as { toDate?: () => Date };
  if (typeof maybe.toDate === "function") return maybe.toDate().toISOString();
  return new Date().toISOString();
};

const normalizeDoc = (id: string, data: DocumentData) => {
  const out: DocumentData = { id };
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof (v as { toDate?: () => Date }).toDate === "function") {
      out[k] = ts(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

/**
 * Map of "join table" -> function returning the foreign key field on the
 * parent document. Extend here as new join patterns appear.
 */
const JOIN_FK: Record<string, (table: string) => string> = {
  profiles: (table) => {
    if (table === "startups") return "founder_id";
    if (table === "messages") return "sender_id";
    if (table === "hiring_requests") return "requester_id";
    return "user_id";
  },
  startups: () => "startup_id",
};

interface ParsedSelect {
  joins: { table: string; fields: string[] }[];
}

const parseSelect = (sel: string): ParsedSelect => {
  const joins: { table: string; fields: string[] }[] = [];
  const re = /(\w+)\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sel))) {
    joins.push({
      table: m[1],
      fields: m[2].split(",").map((f) => f.trim()).filter(Boolean),
    });
  }
  return { joins };
};

async function attachJoins(
  table: string,
  rows: DocumentData[],
  joins: { table: string; fields: string[] }[]
) {
  for (const j of joins) {
    const fkFn = JOIN_FK[j.table];
    if (!fkFn) continue;
    const fk = fkFn(table);
    const ids = Array.from(new Set(rows.map((r) => r[fk]).filter(Boolean)));
    const map = new Map<string, DocumentData>();
    await Promise.all(
      ids.map(async (id) => {
        const snap = await getDoc(doc(db, j.table, String(id)));
        if (snap.exists()) map.set(String(id), normalizeDoc(snap.id, snap.data()));
      })
    );
    for (const r of rows) {
      const linked = map.get(String(r[fk]));
      if (!linked) {
        r[j.table] = null;
        continue;
      }
      if (j.fields.length && !j.fields.includes("*")) {
        const picked: DocumentData = {};
        for (const f of j.fields) picked[f] = linked[f] ?? null;
        r[j.table] = picked;
      } else {
        r[j.table] = linked;
      }
    }
  }
}

class QueryBuilder<T = DocumentData> implements PromiseLike<Result<T[] | T | null>> {
  private filters: Filter[] = [];
  private orderField: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private payload: DocumentData | DocumentData[] | null = null;
  private selectStr = "*";
  private countMode = false;
  private headOnly = false;
  private singleMode: "none" | "single" | "maybe" = "none";
  private returnSelected = false;

  constructor(private table: string) {}

  select(cols = "*", opts?: { count?: "exact"; head?: boolean }): this {
    this.selectStr = cols;
    if (opts?.count === "exact") this.countMode = true;
    if (opts?.head) this.headOnly = true;
    if (this.mode !== "select" && this.mode !== "insert" && this.mode !== "update") {
      this.mode = "select";
    }
    if (this.mode === "insert" || this.mode === "update") this.returnSelected = true;
    return this;
  }

  insert(payload: DocumentData | DocumentData[]): this {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: DocumentData): this {
    this.mode = "update";
    this.payload = payload;
    return this;
  }
  delete(): this {
    this.mode = "delete";
    return this;
  }

  eq(field: string, value: unknown) { this.filters.push({ field, op: "==", value }); return this; }
  neq(field: string, value: unknown) { this.filters.push({ field, op: "!=", value }); return this; }
  gt(field: string, value: unknown) { this.filters.push({ field, op: ">", value }); return this; }
  lt(field: string, value: unknown) { this.filters.push({ field, op: "<", value }); return this; }
  in(field: string, values: unknown[]) { this.filters.push({ field, op: "in", value: values }); return this; }

  order(field: string, opts?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  single() { this.singleMode = "single"; return this; }
  maybeSingle() { this.singleMode = "maybe"; return this; }

  private buildConstraints(): QueryConstraint[] {
    const cs: QueryConstraint[] = [];
    for (const f of this.filters) cs.push(where(f.field, f.op, f.value as never));
    if (this.orderField) cs.push(orderBy(this.orderField, this.orderAsc ? "asc" : "desc"));
    if (this.limitN) cs.push(fbLimit(this.limitN));
    return cs;
  }

  private async run(): Promise<Result<unknown>> {
    try {
      if (this.mode === "select") {
        const ref = collection(db, this.table);
        if (this.countMode && this.headOnly) {
          const snap = await getCountFromServer(query(ref, ...this.buildConstraints().filter((c) => true)));
          return { data: null, error: null, count: snap.data().count };
        }
        const q = query(ref, ...this.buildConstraints());
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => normalizeDoc(d.id, d.data()));
        const parsed = parseSelect(this.selectStr);
        if (parsed.joins.length) await attachJoins(this.table, rows, parsed.joins);
        if (this.singleMode === "single") {
          if (rows.length === 0) return { data: null, error: { message: "No rows" } };
          return { data: rows[0], error: null };
        }
        if (this.singleMode === "maybe") {
          return { data: rows[0] ?? null, error: null };
        }
        return { data: rows, error: null, count: this.countMode ? rows.length : undefined };
      }

      if (this.mode === "insert") {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload!];
        const created: DocumentData[] = [];
        for (const item of items) {
          const ref = await addDoc(collection(db, this.table), {
            ...item,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
          const snap = await getDoc(ref);
          created.push(normalizeDoc(snap.id, snap.data() ?? {}));
        }
        if (this.singleMode !== "none") {
          return { data: created[0] ?? null, error: null };
        }
        return { data: this.returnSelected ? created : null, error: null };
      }

      if (this.mode === "update") {
        // Apply filters by reading matching docs then updating each
        const q = query(collection(db, this.table), ...this.buildConstraints());
        const snap = await getDocs(q);
        const updated: DocumentData[] = [];
        for (const d of snap.docs) {
          await updateDoc(d.ref, {
            ...(this.payload as DocumentData),
            updated_at: serverTimestamp(),
          });
          const fresh = await getDoc(d.ref);
          updated.push(normalizeDoc(fresh.id, fresh.data() ?? {}));
        }
        if (this.singleMode !== "none") return { data: updated[0] ?? null, error: null };
        return { data: this.returnSelected ? updated : null, error: null };
      }

      if (this.mode === "delete") {
        const q = query(collection(db, this.table), ...this.buildConstraints());
        const snap = await getDocs(q);
        for (const d of snap.docs) await deleteDoc(d.ref);
        return { data: null, error: null };
      }

      return { data: null, error: { message: "Unknown mode" } };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[firestore-compat] ${this.table} ${this.mode} failed:`, message);
      return { data: null, error: { message } };
    }
  }

  then<TResult1 = Result<unknown>, TResult2 = never>(
    onfulfilled?: ((value: Result<unknown>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled as never, onrejected as never) as PromiseLike<
      TResult1 | TResult2
    >;
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  functions: {
    async invoke(name: string, _opts?: { body?: unknown }) {
      const endpoint = import.meta.env.VITE_AI_SUGGESTIONS_ENDPOINT as string | undefined;
      if (!endpoint) {
        return {
          data: { error: `Cloud Function "${name}" endpoint not configured. Set VITE_AI_SUGGESTIONS_ENDPOINT.` },
          error: null,
        };
      }
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, ..._opts?.body as object }),
        });
        const data = await res.json();
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e instanceof Error ? e.message : "Function call failed" } };
      }
    },
  },
};

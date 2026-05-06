/**
 * Generic Firestore CRUD helpers used across the app.
 * Keeps query syntax in one place and provides typed async error handling.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type OrderByDirection,
  type QueryConstraint,
  type Unsubscribe,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "./config";

export type WhereClause = [string, WhereFilterOp, unknown];
export type OrderByClause = [string, OrderByDirection?];

export interface QueryOptions {
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
}

export interface WithId {
  id: string;
}

function buildConstraints(opts?: QueryOptions): QueryConstraint[] {
  const cs: QueryConstraint[] = [];
  opts?.where?.forEach(([f, op, v]) => cs.push(where(f, op, v)));
  opts?.orderBy?.forEach(([f, dir]) => cs.push(orderBy(f, dir ?? "asc")));
  if (opts?.limit) cs.push(fbLimit(opts.limit));
  return cs;
}

/** Read all docs in a collection (with optional filters). */
export async function listDocs<T extends DocumentData>(
  path: string,
  opts?: QueryOptions
): Promise<(T & WithId)[]> {
  const ref = collection(db, path);
  const q = query(ref, ...buildConstraints(opts));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

/** Read a single doc by id. */
export async function getDocById<T extends DocumentData>(
  path: string,
  id: string
): Promise<(T & WithId) | null> {
  const snap = await getDoc(doc(db, path, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as T) }) : null;
}

/** Create a doc with auto id; returns the new id. */
export async function createDoc<T extends DocumentData>(
  path: string,
  data: T
): Promise<string> {
  const ref = await addDoc(collection(db, path), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

/** Create or overwrite a doc at a known id. */
export async function setDocById<T extends DocumentData>(
  path: string,
  id: string,
  data: T,
  merge = true
): Promise<void> {
  await setDoc(
    doc(db, path, id),
    { ...data, updated_at: serverTimestamp() },
    { merge }
  );
}

export async function updateDocById<T extends DocumentData>(
  path: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await updateDoc(doc(db, path, id), {
    ...data,
    updated_at: serverTimestamp(),
  } as DocumentData);
}

export async function deleteDocById(path: string, id: string): Promise<void> {
  await deleteDoc(doc(db, path, id));
}

/** Subscribe to a collection query. Returns an unsubscribe function. */
export function subscribeCollection<T extends DocumentData>(
  path: string,
  opts: QueryOptions | undefined,
  cb: (docs: (T & WithId)[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(collection(db, path), ...buildConstraints(opts));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))),
    (err) => onError?.(err)
  );
}

/** Counts via getDocs (Firestore has count() but it's billed; this is fine for small collections). */
export async function countDocs(path: string, opts?: QueryOptions): Promise<number> {
  const q = query(collection(db, path), ...buildConstraints(opts));
  const snap = await getDocs(q);
  return snap.size;
}

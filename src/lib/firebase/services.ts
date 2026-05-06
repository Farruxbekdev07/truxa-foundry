/**
 * Domain helpers for startups, profiles, products, orders, hiring, pitch
 * decks/videos, notifications, and chat — all backed by Firestore.
 *
 * Note on relational data:
 * Firestore has no joins, so we denormalize on read. For each startup we look
 * up the founder's profile by id; for each product we look up its startup name.
 * Keep this in mind when scaling — for large lists, store the joined fields
 * directly on the document at write time.
 */
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  createDoc,
  deleteDocById,
  getDocById,
  listDocs,
  updateDocById,
  type WithId,
} from "./firestore";
import type { Profile, Role } from "./auth-service";

/* ------------------------------ Startups ------------------------------ */

export interface Startup {
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  target_market?: string | null;
  problem?: string | null;
  solution?: string | null;
  team_info?: string | null;
  looking_for_team: boolean;
  looking_for_mentorship: boolean;
  looking_for_funding: boolean;
  rating: number;
  founder_id: string;
}

export interface StartupWithFounder extends Startup, WithId {
  profiles?: { full_name: string; avatar_url: string | null; role: string };
}

async function attachFounders(
  startups: (Startup & WithId)[]
): Promise<StartupWithFounder[]> {
  const ids = Array.from(new Set(startups.map((s) => s.founder_id)));
  const profileMap = new Map<string, Profile>();
  await Promise.all(
    ids.map(async (id) => {
      const p = await getDocById<Omit<Profile, "id">>("profiles", id);
      if (p) profileMap.set(id, { ...p, id });
    })
  );
  return startups.map((s) => {
    const p = profileMap.get(s.founder_id);
    return {
      ...s,
      profiles: p
        ? { full_name: p.full_name, avatar_url: p.avatar_url, role: p.role }
        : undefined,
    };
  });
}

export async function listStartupsForRole(
  role: Role | undefined,
  userId: string | undefined,
  limit?: number
): Promise<StartupWithFounder[]> {
  const filters: [string, "==", unknown][] = [];
  if (role === "founder" && userId) filters.push(["founder_id", "==", userId]);
  else if (role === "developer") filters.push(["looking_for_team", "==", true]);
  else if (role === "mentor") filters.push(["looking_for_mentorship", "==", true]);
  else if (role === "investor") filters.push(["looking_for_funding", "==", true]);

  const docs = await listDocs<Startup>("startups", {
    where: filters,
    orderBy: [["created_at", "desc"]],
    limit,
  });
  return attachFounders(docs);
}

export async function getStartup(id: string): Promise<StartupWithFounder | null> {
  const s = await getDocById<Startup>("startups", id);
  if (!s) return null;
  const [withFounder] = await attachFounders([s]);
  return withFounder;
}

export async function getStartupForFounder(
  founderId: string
): Promise<(Startup & WithId) | null> {
  const docs = await listDocs<Startup>("startups", {
    where: [["founder_id", "==", founderId]],
    limit: 1,
  });
  return docs[0] ?? null;
}

export async function createStartup(data: Startup): Promise<string> {
  // Enforce one-startup-per-founder at the application layer.
  const existing = await getStartupForFounder(data.founder_id);
  if (existing) throw new Error("unique constraint: one startup per founder");
  return createDoc("startups", data);
}

export async function updateStartup(id: string, patch: Partial<Startup>) {
  return updateDocById("startups", id, patch);
}

export async function deleteStartup(id: string) {
  return deleteDocById("startups", id);
}

/* ------------------------------ Products ------------------------------ */

export interface Product {
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  startup_id: string;
  active: boolean;
}

export interface ProductWithStartup extends Product, WithId {
  startups?: { name: string };
}

export async function listActiveProducts(): Promise<ProductWithStartup[]> {
  const products = await listDocs<Product>("products", {
    where: [["active", "==", true]],
    orderBy: [["created_at", "desc"]],
  });
  const startupIds = Array.from(new Set(products.map((p) => p.startup_id)));
  const map = new Map<string, string>();
  await Promise.all(
    startupIds.map(async (id) => {
      const s = await getDocById<Startup>("startups", id);
      if (s) map.set(id, s.name);
    })
  );
  return products.map((p) => ({
    ...p,
    startups: map.has(p.startup_id) ? { name: map.get(p.startup_id)! } : undefined,
  }));
}

/* ------------------------------ Orders ------------------------------ */

export interface Order {
  customer_id: string;
  product_id: string;
  startup_id: string;
  quantity: number;
  total_amount: number;
  status: string;
}

export const createOrder = (o: Order) => createDoc("orders", o);
export const listAllOrders = () => listDocs<Order>("orders");

/* ----------------------------- Profiles ------------------------------ */

export async function listProfiles(
  excludeId: string | undefined,
  roleFilter?: Role | "all"
): Promise<(Profile & WithId)[]> {
  const filters: [string, "==", unknown][] = [];
  if (roleFilter && roleFilter !== "all") filters.push(["role", "==", roleFilter]);
  const all = await listDocs<Omit<Profile, "id">>("profiles", {
    where: filters,
    orderBy: [["full_name", "asc"]],
  });
  return all
    .map((p) => ({ ...p, id: p.id }))
    .filter((p) => p.id !== excludeId) as (Profile & WithId)[];
}

/* ------------------------- Hiring requests --------------------------- */

export interface HiringRequest {
  requester_id: string;
  target_id: string;
  type: string;
  message: string;
  status: string;
  startup_id?: string | null;
}

export const createHiringRequest = (h: Omit<HiringRequest, "status">) =>
  createDoc("hiring_requests", { ...h, status: "pending" });

/* ---------------------------- Pitch decks ---------------------------- */

export interface Slide {
  id: string;
  type: string;
  title: string;
  content: string;
  subtitle?: string;
  bullets?: string[];
  imageUrl?: string;
  layout?: string;
}

export interface PitchDeckDoc {
  startup_id: string;
  title: string;
  slides: Slide[];
}

export const getPitchDeck = (id: string) => getDocById<PitchDeckDoc>("pitch_decks", id);
export const createPitchDeck = (d: PitchDeckDoc) => createDoc("pitch_decks", d);
export const updatePitchDeck = (id: string, d: Partial<PitchDeckDoc>) =>
  updateDocById("pitch_decks", id, d);

/* --------------------------- Pitch videos --------------------------- */

export interface PitchVideoDoc {
  startup_id: string;
  title: string;
  video_url: string | null;
  script: string | null;
  thumbnail_url?: string | null;
}

export const getPitchVideo = (id: string) =>
  getDocById<PitchVideoDoc>("pitch_videos", id);
export const createPitchVideo = (d: PitchVideoDoc) => createDoc("pitch_videos", d);
export const updatePitchVideo = (id: string, d: Partial<PitchVideoDoc>) =>
  updateDocById("pitch_videos", id, d);

/* --------------------------- Notifications -------------------------- */

export interface Notification {
  type: string;
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  data: unknown;
}

export const updateNotification = (id: string, patch: Partial<Notification>) =>
  updateDocById("notifications", id, patch);

export async function markAllNotificationsRead(userId: string) {
  const snap = await getDocs(
    query(collection(db, "notifications"), where("user_id", "==", userId), where("read", "==", false))
  );
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

/* ------------------------------ Chat -------------------------------- */

export interface Conversation {
  type: "direct" | "group";
  name: string | null;
  participants: string[];
}

export interface Message {
  conversation_id: string;
  sender_id: string;
  content: string;
}

/**
 * Find an existing direct conversation between two users (if any).
 */
export async function findDirectConversation(
  userA: string,
  userB: string
): Promise<(Conversation & WithId) | null> {
  const snap = await getDocs(
    query(
      collection(db, "conversations"),
      where("type", "==", "direct"),
      where("participants", "array-contains", userA)
    )
  );
  for (const d of snap.docs) {
    const data = d.data() as Conversation;
    if (data.participants.includes(userB)) {
      return { id: d.id, ...data };
    }
  }
  return null;
}

export async function createConversation(c: Conversation): Promise<string> {
  return createDoc("conversations", c);
}

export const sendChatMessage = (m: Message) => createDoc("messages", m);

export async function touchConversation(id: string) {
  await updateDocById("conversations", id, {} as Partial<Conversation>);
}

export async function listConversationsForUser(userId: string) {
  return listDocs<Conversation>("conversations", {
    where: [["participants", "array-contains", userId]],
    orderBy: [["updated_at", "desc"]],
  });
}

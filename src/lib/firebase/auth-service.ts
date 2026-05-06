/**
 * Thin wrapper around Firebase Auth + Firestore "profiles" collection.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";
import { getDocById, setDocById, updateDocById } from "./firestore";

export type Role = "founder" | "investor" | "mentor" | "developer" | "customer";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  bio: string | null;
  avatar_url: string | null;
}

export async function signUpWithProfile(
  email: string,
  password: string,
  fullName: string,
  role: Role
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDocById<Omit<Profile, "id">>("profiles", cred.user.uid, {
    full_name: fullName,
    role,
    bio: null,
    avatar_url: null,
  });
  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function fetchProfile(uid: string): Promise<Profile | null> {
  const data = await getDocById<Omit<Profile, "id">>("profiles", uid);
  return data ? { ...data, id: uid } : null;
}

export async function updateProfile(uid: string, patch: Partial<Profile>): Promise<void> {
  await updateDocById("profiles", uid, patch);
}

export const subscribeAuth = (cb: (u: User | null) => void) =>
  onAuthStateChanged(auth, cb);

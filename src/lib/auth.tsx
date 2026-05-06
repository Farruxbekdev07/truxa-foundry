import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  fetchProfile,
  signInWithEmail,
  signOutUser,
  signUpWithProfile,
  subscribeAuth,
  type Profile,
  type Role,
} from "./firebase/auth-service";

/** App-level user: Firebase user + `id` alias for `uid` to match prior Supabase shape. */
export type AppUser = FirebaseUser & { id: string };

const wrap = (u: FirebaseUser | null): AppUser | null =>
  u ? Object.assign(u, { id: u.uid }) : null;

interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAuth(async (u) => {
      setUser(wrap(u));
      if (u) {
        try {
          const p = await fetchProfile(u.uid);
          setProfile(p);
        } catch (e) {
          console.error("Failed to load profile", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp: AuthContextType["signUp"] = async (
    email,
    password,
    fullName,
    role
  ) => {
    try {
      const u = await signUpWithProfile(email, password, fullName, role as Role);
      const p = await fetchProfile(u.uid);
      setProfile(p);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    try {
      await signInWithEmail(email, password);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    await signOutUser();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

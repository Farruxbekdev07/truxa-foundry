import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  markAllNotificationsRead,
  updateNotification,
} from "@/lib/firebase/services";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  data: unknown;
  created_at: string;
}

const toIso = (v: unknown): string => {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate().toISOString();
  return new Date().toISOString();
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("user_id", "==", user.id),
      orderBy("created_at", "desc"),
      fbLimit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data() as Omit<Notification, "id" | "created_at"> & { created_at?: unknown };
          return { id: d.id, ...data, created_at: toIso(data.created_at) } as Notification;
        });
        setNotifications(docs);
        setUnreadCount(docs.filter((n) => !n.read).length);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateNotification(id, { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: () => {} };
}

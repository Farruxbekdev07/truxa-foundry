import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  createConversation,
  findDirectConversation,
  getStartup,
  listConversationsForUser,
  sendChatMessage,
  touchConversation,
} from "@/lib/firebase/services";
import { fetchProfile } from "@/lib/firebase/auth-service";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { full_name: string; avatar_url: string | null };
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
    profiles: { full_name: string; avatar_url: string | null };
  }[];
}

const ts = (v: unknown): string => {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate().toISOString();
  return new Date().toISOString();
};

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages([]);
      setLoading(false);
      return;
    }
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!activeConversation) return;
    const q = query(
      collection(db, "messages"),
      where("conversation_id", "==", activeConversation.id),
      orderBy("created_at", "asc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }));
      const senderIds = Array.from(new Set(docs.map((m) => m.sender_id)));
      const profiles = await Promise.all(senderIds.map((id) => fetchProfile(id)));
      const map = new Map(profiles.filter(Boolean).map((p) => [p!.id, p!]));
      setMessages(
        docs.map((m) => ({
          ...m,
          sender: map.get(m.sender_id)
            ? {
                full_name: map.get(m.sender_id)!.full_name,
                avatar_url: map.get(m.sender_id)!.avatar_url,
              }
            : undefined,
        }))
      );
    });
    return () => unsub();
  }, [activeConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const convs = await listConversationsForUser(user.id);
      const enriched = await Promise.all(
        convs.map(async (c) => {
          const participants = await Promise.all(
            (c.participants || []).map(async (uid: string) => {
              const p = await fetchProfile(uid);
              return {
                user_id: uid,
                profiles: p
                  ? { full_name: p.full_name, avatar_url: p.avatar_url }
                  : { full_name: "", avatar_url: null },
              };
            })
          );
          return { ...c, participants } as Conversation;
        })
      );
      setConversations(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !activeConversation) return;
    try {
      await sendChatMessage({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content,
      });
      await touchConversation(activeConversation.id);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const startConversation = useCallback(
    async (targetUserId: string, type: "direct" | "group" = "direct", name?: string) => {
      if (!user) return null;
      try {
        if (type === "direct") {
          const existing = await findDirectConversation(user.id, targetUserId);
          if (existing) {
            const found = conversations.find((c) => c.id === existing.id);
            if (found) {
              setActiveConversation(found);
              return found;
            }
          }
        }
        const id = await createConversation({
          type,
          name: name ?? null,
          participants: [user.id, targetUserId],
        });
        await fetchConversations();
        return { id, type, name: name ?? null } as unknown as Conversation;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [user, conversations]
  );

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversation,
    sendMessage,
    startConversation,
    refetch: fetchConversations,
  };
}

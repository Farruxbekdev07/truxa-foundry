import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    };
  }[];
  last_message?: Message;
}

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

    fetchMessages(activeConversation.id);

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          // Fetch sender info
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, sender: profile || undefined },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data: participantData } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participantData?.length) {
      setLoading(false);
      return;
    }

    const conversationIds = participantData.map((p) => p.conversation_id);

    const { data: conversationsData } = await supabase
      .from("conversations")
      .select("*")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsData) {
      // Fetch participants for each conversation
      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);

          const participantsWithProfiles = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", p.user_id)
                .single();
              return { user_id: p.user_id, profiles: profile || { full_name: "", avatar_url: null } };
            })
          );

          return {
            ...conv,
            type: conv.type as "direct" | "group",
            participants: participantsWithProfiles,
          } as Conversation;
        })

      setConversations(enrichedConversations);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      // Fetch sender profiles
      const senderIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      setMessages(
        data.map((m) => ({
          ...m,
          sender: profileMap.get(m.sender_id),
        }))
      );
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !activeConversation) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
    });

    if (!error) {
      // Update conversation updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id);
    }
  };

  const startConversation = useCallback(
    async (targetUserId: string, type: "direct" | "group" = "direct", name?: string) => {
      if (!user) return null;

      // Check if direct conversation already exists
      if (type === "direct") {
        const { data: existingParticipations } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id);

        if (existingParticipations) {
          for (const p of existingParticipations) {
            const { data: otherParticipant } = await supabase
              .from("conversation_participants")
              .select("user_id, conversations(type)")
              .eq("conversation_id", p.conversation_id)
              .eq("user_id", targetUserId)
              .single();

            if (otherParticipant && (otherParticipant.conversations as { type: string })?.type === "direct") {
              const existing = conversations.find((c) => c.id === p.conversation_id);
              if (existing) {
                setActiveConversation(existing);
                return existing;
              }
            }
          }
        }
      }

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({ type, name })
        .select()
        .single();

      if (convError || !newConversation) return null;

      // Add participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: newConversation.id, user_id: user.id },
        { conversation_id: newConversation.id, user_id: targetUserId },
      ]);

      await fetchConversations();
      return newConversation as Conversation;
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

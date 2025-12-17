import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
} from "@mui/material";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Participant {
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  participants?: Participant[];
}

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ conversation, messages, onSendMessage }: ChatWindowProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getConversationTitle = () => {
    if (!conversation) return "";
    if (conversation.name) return conversation.name;
    if (conversation.type === "direct" && conversation.participants) {
      const otherParticipant = conversation.participants.find(
        (p) => p.user_id !== user?.id
      );
      return otherParticipant?.profiles?.full_name || "Unknown";
    }
    return "Group Chat";
  };

  if (!conversation) {
    return (
      <Box className="h-full flex flex-col items-center justify-center p-6 text-center bg-secondary/30">
        <Box className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 text-muted-foreground" />
        </Box>
        <Typography variant="h6" className="font-medium mb-2">
          Select a conversation
        </Typography>
        <Typography variant="body2" className="text-muted-foreground max-w-sm">
          Choose a conversation from the sidebar or start a new one to begin chatting.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="h-full flex flex-col">
      {/* Header */}
      <Box className="p-4 border-b border-border">
        <Typography variant="h6" className="font-semibold">
          {getConversationTitle()}
        </Typography>
        {conversation.type === "group" && conversation.participants && (
          <Typography variant="caption" className="text-muted-foreground">
            {conversation.participants.length} members
          </Typography>
        )}
      </Box>

      {/* Messages */}
      <Box className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          return (
            <Box
              key={message.id}
              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar
                src={message.sender?.avatar_url || undefined}
                className="w-8 h-8"
              >
                {message.sender?.full_name?.charAt(0) || "?"}
              </Avatar>
              <Box className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                <Box className="flex items-center gap-2 mb-1">
                  <Typography variant="caption" className="font-medium">
                    {isOwn ? "You" : message.sender?.full_name || "Unknown"}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  className={`p-3 rounded-2xl ${
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary rounded-bl-sm"
                  }`}
                >
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box className="p-4 border-t border-border">
        <Box className="flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
          />
          <IconButton
            onClick={handleSend}
            disabled={!newMessage.trim()}
            color="primary"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

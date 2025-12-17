import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import { MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

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
  updated_at: string;
  participants?: Participant[];
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}

export function ChatSidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  loading,
}: ChatSidebarProps) {
  const { user } = useAuth();

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    if (conversation.type === "direct" && conversation.participants) {
      const otherParticipant = conversation.participants.find(
        (p) => p.user_id !== user?.id
      );
      return otherParticipant?.profiles?.full_name || "Unknown";
    }
    return "Group Chat";
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === "direct" && conversation.participants) {
      const otherParticipant = conversation.participants.find(
        (p) => p.user_id !== user?.id
      );
      return otherParticipant?.profiles?.avatar_url;
    }
    return null;
  };

  if (loading) {
    return (
      <Box className="h-full flex items-center justify-center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </Box>
        <Typography variant="h6" className="font-medium mb-2">
          No conversations yet
        </Typography>
        <Typography variant="body2" className="text-muted-foreground">
          Start a conversation by messaging someone from the platform.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="h-full flex flex-col">
      <Box className="p-4 border-b border-border">
        <Typography variant="h6" className="font-semibold">
          Messages
        </Typography>
      </Box>
      <List className="flex-1 overflow-auto">
        {conversations.map((conversation) => (
          <ListItemButton
            key={conversation.id}
            selected={activeConversation?.id === conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="py-3"
          >
            <ListItemAvatar>
              {conversation.type === "group" ? (
                <Avatar className="bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </Avatar>
              ) : (
                <Avatar src={getConversationAvatar(conversation) || undefined}>
                  {getConversationName(conversation).charAt(0)}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box className="flex items-center gap-2">
                  <Typography variant="body2" className="font-medium truncate">
                    {getConversationName(conversation)}
                  </Typography>
                  {conversation.type === "group" && (
                    <Chip label="Group" size="small" className="h-5 text-xs" />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" className="text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.updated_at), {
                    addSuffix: true,
                  })}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

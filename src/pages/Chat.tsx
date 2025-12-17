import { Box, Paper, useMediaQuery, useTheme, Drawer, IconButton } from "@mui/material";
import { useState } from "react";
import { Menu } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";

export default function Chat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversation,
    sendMessage,
  } = useChat();

  const handleSelectConversation = (conversation: typeof activeConversation) => {
    setActiveConversation(conversation);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <Box className="h-[calc(100vh-64px)] lg:h-screen flex">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <IconButton
            onClick={() => setSidebarOpen(true)}
            className="absolute top-2 left-2 z-10"
          >
            <Menu className="w-5 h-5" />
          </IconButton>
        )}

        {/* Sidebar */}
        {isMobile ? (
          <Drawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            PaperProps={{ sx: { width: 320 } }}
          >
            <ChatSidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </Drawer>
        ) : (
          <Paper
            elevation={0}
            className="w-80 border-r border-border flex-shrink-0"
          >
            <ChatSidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </Paper>
        )}

        {/* Chat Window */}
        <Box className="flex-1">
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onSendMessage={sendMessage}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}

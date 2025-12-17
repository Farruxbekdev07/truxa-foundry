import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Bell,
  MessageSquare,
  Briefcase,
  UserPlus,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return MessageSquare;
    case "hiring":
      return UserPlus;
    case "startup":
      return Briefcase;
    case "payment":
      return DollarSign;
    default:
      return Bell;
  }
};

export default function Notifications() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  if (loading) {
    return (
      <DashboardLayout>
        <Box className="min-h-screen flex items-center justify-center">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <Box className="flex items-center justify-between mb-6">
          <Box>
            <Typography variant="h4" className="font-bold mb-1">
              Notifications
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Stay updated with your latest activity
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} startIcon={<CheckCircle className="w-4 h-4" />}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Paper elevation={0} className="rounded-xl border border-border">
          {notifications.length === 0 ? (
            <Box className="p-12 text-center">
              <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </Box>
              <Typography variant="h6" className="font-medium mb-2">
                No notifications yet
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                You'll see notifications here when something happens.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <ListItemButton
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`py-4 ${
                      index !== notifications.length - 1
                        ? "border-b border-border"
                        : ""
                    } ${!notification.read ? "bg-primary/5" : ""}`}
                  >
                    <ListItemIcon>
                      <Box
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.read
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box className="flex items-center gap-2">
                          <Typography variant="body2" className="font-medium">
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              className="h-5 text-xs"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box className="mt-1">
                          <Typography variant="body2" className="text-muted-foreground">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

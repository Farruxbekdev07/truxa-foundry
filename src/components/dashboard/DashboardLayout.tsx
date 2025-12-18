import { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Code,
  LogOut,
  LayoutDashboard,
  Briefcase,
  User,
  Menu,
  X,
  MessageSquare,
  Bell,
  BarChart3,
  Users,
  ShoppingBag,
} from "lucide-react";
import { roleColors } from "@/theme/muiTheme";

const DRAWER_WIDTH = 256;

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const baseNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Startups", href: "/startups" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const roleNavItems: Record<string, typeof baseNavItems> = {
    founder: [
      { icon: Users, label: "Find Talent", href: "/team" },
      { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    ],
    investor: [
      { icon: Users, label: "Find Talent", href: "/team" },
    ],
    mentor: [
      { icon: Users, label: "Find Talent", href: "/team" },
    ],
    developer: [],
    customer: [
      { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    ],
  };

  const navItems = [
    ...baseNavItems,
    ...(profile?.role ? roleNavItems[profile.role] || [] : []),
  ];

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "founder":
        return Rocket;
      case "investor":
        return TrendingUp;
      case "mentor":
        return GraduationCap;
      case "developer":
        return Code;
      default:
        return User;
    }
  };

  const getRoleColor = () => {
    if (!profile?.role) return roleColors.founder;
    return (
      roleColors[profile.role as keyof typeof roleColors] || roleColors.founder
    );
  };

  const RoleIcon = getRoleIcon();

  const drawer = (
    <Box className="h-full flex flex-col p-6">
      <Box
        component={Link}
        to="/"
        className="flex items-center gap-2 mb-8 no-underline text-inherit"
      >
        <Box className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </Box>
        <Typography variant="h6" className="font-bold">
          StartupHub
        </Typography>
      </Box>

      <List className="flex-1 space-y-1">
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={Link}
            to={item.href}
            selected={location.pathname === item.href}
            className="rounded-lg mb-1"
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon className="min-w-0 mr-3">
              <item.icon className="w-5 h-5" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider className="my-4" />

      {profile && (
        <Box className="flex items-center gap-3 mb-4">
          <Box
            className="w-10 h-10 rounded-full flex items-center justify-center"
            sx={{ backgroundColor: `${getRoleColor()}20` }}
          >
            <RoleIcon className="w-5 h-5" style={{ color: getRoleColor() }} />
          </Box>
          <Box className="flex-1 min-w-0">
            <Typography variant="body2" className="font-medium truncate">
              {profile.full_name}
            </Typography>
            <Typography
              variant="caption"
              className="text-muted-foreground capitalize"
            >
              {profile.role}
            </Typography>
          </Box>
        </Box>
      )}

      <Button
        onClick={() => setLogoutDialogOpen(true)}
        startIcon={<LogOut className="w-5 h-5" />}
        color="inherit"
        className="justify-start text-muted-foreground hover:text-destructive"
      >
        Sign Out
      </Button>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Header */}
      <AppBar
        position="fixed"
        sx={{
          display: { lg: "none" },
          bgcolor: "background.paper",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            className="mr-2"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </IconButton>
          <Box
            component={Link}
            to="/"
            className="flex items-center gap-2 no-underline text-inherit"
          >
            <Box className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </Box>
            <Typography variant="h6" className="font-bold text-foreground">
              StartupHub
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ml: { lg: `${DRAWER_WIDTH}px` },
          pt: { xs: "64px", lg: 0 },
        }}
      >
        {children}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? You will need to sign in again to
            access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSignOut} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Container,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Zap, Menu as MenuIcon, X, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { roleColors } from '@/theme/muiTheme';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'For Teams', href: '/#roles' },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    await signOut();
    setLogoutDialogOpen(false);
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = () => {
    if (!profile?.role) return roleColors.founder;
    return roleColors[profile.role as keyof typeof roleColors] || roleColors.founder;
  };

  const drawer = (
    <Box className="w-64 pt-4">
      <List>
        {navLinks.map((link) => (
          <ListItemButton
            key={link.label}
            component={Link}
            to={link.href}
            onClick={handleDrawerToggle}
          >
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider className="my-4" />
      <Box className="px-4 space-y-2">
        {user && profile ? (
          <>
            <Button
              component={Link}
              to="/dashboard"
              variant="outlined"
              fullWidth
              startIcon={<LayoutDashboard className="w-4 h-4" />}
              onClick={handleDrawerToggle}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/profile"
              variant="outlined"
              fullWidth
              startIcon={<User className="w-4 h-4" />}
              onClick={handleDrawerToggle}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<LogOut className="w-4 h-4" />}
              onClick={() => {
                handleDrawerToggle();
                setLogoutDialogOpen(true);
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              component={Link}
              to="/auth?mode=login"
              variant="outlined"
              fullWidth
              onClick={handleDrawerToggle}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              fullWidth
              onClick={handleDrawerToggle}
            >
              Start Free
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)', bgcolor: 'rgba(255,255,255,0.9)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters className="h-16">
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              className="flex items-center gap-2.5 no-underline text-inherit"
            >
              <Box className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </Box>
              <span className="text-xl font-bold text-foreground tracking-tight">Truxa Foundry</span>
            </Box>

            {/* Desktop Navigation */}
            <Box className="hidden md:flex items-center gap-8 ml-12">
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  component={Link}
                  to={link.href}
                  color="inherit"
                  className="text-muted-foreground hover:text-foreground font-medium"
                  sx={{ textTransform: 'none' }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box className="flex-grow" />

            {/* Desktop CTA or Avatar */}
            <Box className="hidden md:flex items-center gap-3">
              {user && profile ? (
                <>
                  <IconButton onClick={handleAvatarClick} size="small">
                    <Avatar
                      src={profile.avatar_url || undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: getRoleColor(),
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(profile.full_name)}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          minWidth: 180,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        },
                      },
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/dashboard"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <LayoutDashboard className="w-4 h-4" />
                      </ListItemIcon>
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <User className="w-4 h-4" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                      <ListItemIcon>
                        <LogOut className="w-4 h-4 text-red-500" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    component={Link} 
                    to="/auth?mode=login" 
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    component={Link} 
                    to="/auth" 
                    variant="contained"
                    sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                  >
                    Start Free
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile Menu Button */}
            <IconButton className="md:hidden" onClick={handleDrawerToggle} edge="end">
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className="md:hidden"
      >
        {drawer}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? You will need to sign in again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
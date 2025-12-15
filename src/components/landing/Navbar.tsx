import { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import { Rocket, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'For You', href: '/#roles' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
          Get Started
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="transparent">
        <Container maxWidth="lg">
          <Toolbar disableGutters className="h-16">
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              className="flex items-center gap-2 no-underline text-inherit"
            >
              <Box className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </Box>
              <span className="text-xl font-bold text-foreground">StartupHub</span>
            </Box>

            {/* Desktop Navigation */}
            <Box className="hidden md:flex items-center gap-8 ml-12">
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  component={Link}
                  to={link.href}
                  color="inherit"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box className="flex-grow" />

            {/* Desktop CTA */}
            <Box className="hidden md:flex items-center gap-3">
              <Button
                component={Link}
                to="/auth?mode=login"
                color="inherit"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/auth"
                variant="contained"
              >
                Get Started
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              className="md:hidden"
              onClick={handleDrawerToggle}
              edge="end"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
    </>
  );
}

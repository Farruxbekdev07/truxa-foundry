import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Container,
  Grid,
  Stack,
} from '@mui/material';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Code,
  LogOut,
  Plus,
  Users,
  LayoutDashboard,
  Briefcase,
  User,
} from 'lucide-react';
import { roleColors } from '@/theme/muiTheme';

interface Startup {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  looking_for_team: boolean;
  looking_for_mentorship: boolean;
  looking_for_funding: boolean;
  rating: number;
  founder_id: string;
  profiles?: {
    full_name: string;
  };
}

const DRAWER_WIDTH = 256;

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Startups', href: '/dashboard' },
  { icon: Users, label: 'Network', href: '/dashboard' },
];

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStartups();
    }
  }, [user, profile]);

  const fetchStartups = async () => {
    setLoadingStartups(true);
    let query = supabase.from('startups').select('*, profiles(full_name)');

    if (profile?.role === 'founder') {
      query = query.eq('founder_id', user?.id);
    } else if (profile?.role === 'developer') {
      query = query.eq('looking_for_team', true);
    } else if (profile?.role === 'mentor') {
      query = query.eq('looking_for_mentorship', true);
    } else if (profile?.role === 'investor') {
      query = query.eq('looking_for_funding', true);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setStartups((data as Startup[]) || []);
    setLoadingStartups(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'founder':
        return Rocket;
      case 'investor':
        return TrendingUp;
      case 'mentor':
        return GraduationCap;
      case 'developer':
        return Code;
      default:
        return User;
    }
  };

  const getRoleColor = () => {
    return roleColors[profile.role as keyof typeof roleColors] || roleColors.founder;
  };

  const getDashboardTitle = () => {
    switch (profile.role) {
      case 'founder':
        return 'Your Startups';
      case 'investor':
        return 'Investment Opportunities';
      case 'mentor':
        return 'Startups Seeking Guidance';
      case 'developer':
        return 'Startups Hiring';
      default:
        return 'Dashboard';
    }
  };

  const RoleIcon = getRoleIcon();

  const drawer = (
    <Box className="h-full flex flex-col p-6">
      <Box component={Link} to="/" className="flex items-center gap-2 mb-8 no-underline text-inherit">
        <Box className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </Box>
        <Typography variant="h6" className="font-bold">
          StartupHub
        </Typography>
      </Box>

      <List className="flex-1 space-y-1">
        {navItems.map((item, index) => (
          <ListItemButton
            key={item.label}
            component={Link}
            to={item.href}
            selected={index === 0}
            className="rounded-lg mb-1"
          >
            <ListItemIcon className="min-w-0 mr-3">
              <item.icon className="w-5 h-5" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider className="my-4" />

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
          <Typography variant="caption" className="text-muted-foreground capitalize">
            {profile.role}
          </Typography>
        </Box>
      </Box>

      <Button
        onClick={handleSignOut}
        startIcon={<LogOut className="w-5 h-5" />}
        color="inherit"
        className="justify-start text-muted-foreground hover:text-destructive"
      >
        Sign Out
      </Button>
    </Box>
  );

  const stats = [
    { label: 'Total Startups', value: startups.length, icon: Rocket },
    { label: 'Looking for Team', value: startups.filter((s) => s.looking_for_team).length, icon: Users },
    { label: 'Seeking Funding', value: startups.filter((s) => s.looking_for_funding).length, icon: TrendingUp },
    { label: 'Need Mentorship', value: startups.filter((s) => s.looking_for_mentorship).length, icon: GraduationCap },
  ];

  return (
    <Box className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Header */}
      <AppBar
        position="fixed"
        sx={{
          display: { lg: 'none' },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <Box component={Link} to="/" className="flex items-center gap-2 no-underline text-inherit">
            <Box className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </Box>
            <Typography variant="h6" className="font-bold text-foreground">
              StartupHub
            </Typography>
          </Box>
          <Box className="flex-grow" />
          <IconButton onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ml: { lg: `${DRAWER_WIDTH}px` },
          pt: { xs: '64px', lg: 0 },
          p: { xs: 3, lg: 5 },
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          className="mb-8"
        >
          <Box>
            <Typography variant="h4" className="font-bold mb-1">
              Welcome back, {profile.full_name.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" className="text-muted-foreground">
              Here's what's happening in the ecosystem today.
            </Typography>
          </Box>
          {profile.role === 'founder' && (
            <Button variant="contained" startIcon={<Plus className="w-5 h-5" />}>
              Add Startup
            </Button>
          )}
        </Stack>

        {/* Stats */}
        <Grid container spacing={2} className="mb-8">
          {stats.map((stat) => (
            <Grid size={{ xs: 6, lg: 3 }} key={stat.label}>
              <Paper elevation={0} className="p-5 rounded-xl border border-border">
                <stat.icon className="w-5 h-5 text-primary mb-3" />
                <Typography variant="h4" className="font-bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Content */}
        <Paper elevation={0} className="rounded-xl border border-border">
          <Box className="p-6 border-b border-border">
            <Typography variant="h6" className="font-semibold">
              {getDashboardTitle()}
            </Typography>
          </Box>

          {loadingStartups ? (
            <Box className="p-12 text-center">
              <CircularProgress />
            </Box>
          ) : startups.length === 0 ? (
            <Box className="p-12 text-center">
              <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </Box>
              <Typography variant="h6" className="font-medium mb-2">
                No startups yet
              </Typography>
              <Typography variant="body2" className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {profile.role === 'founder'
                  ? 'Create your first startup to get started and connect with investors and mentors.'
                  : 'Check back later for new opportunities in the ecosystem.'}
              </Typography>
              {profile.role === 'founder' && (
                <Button variant="contained" startIcon={<Plus className="w-5 h-5" />}>
                  Create Startup
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {startups.map((startup, index) => (
                <Box
                  key={startup.id}
                  className={`p-6 hover:bg-secondary/50 transition-colors ${
                    index !== startups.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box className="flex-1 min-w-0">
                      <Typography variant="h6" className="font-semibold mb-1">
                        {startup.name}
                      </Typography>
                      {startup.description && (
                        <Typography
                          variant="body2"
                          className="text-muted-foreground mb-3 line-clamp-2"
                        >
                          {startup.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {startup.industry && (
                          <Chip label={startup.industry} size="small" variant="outlined" />
                        )}
                        {startup.stage && (
                          <Chip
                            label={startup.stage}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {startup.looking_for_team && (
                          <Chip
                            label="Hiring"
                            size="small"
                            sx={{
                              backgroundColor: `${roleColors.developer}20`,
                              color: roleColors.developer,
                            }}
                          />
                        )}
                        {startup.looking_for_funding && (
                          <Chip
                            label="Seeking Funding"
                            size="small"
                            sx={{
                              backgroundColor: `${roleColors.investor}20`,
                              color: roleColors.investor,
                            }}
                          />
                        )}
                        {startup.looking_for_mentorship && (
                          <Chip
                            label="Needs Mentorship"
                            size="small"
                            sx={{
                              backgroundColor: `${roleColors.mentor}20`,
                              color: roleColors.mentor,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                    <Box className="text-right">
                      <Typography variant="body2" className="font-medium">
                        Rating
                      </Typography>
                      <Typography variant="h5" className="font-bold text-primary">
                        {startup.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

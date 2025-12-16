import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Code,
  Plus,
  Users,
  Briefcase,
  Search,
  Eye,
} from 'lucide-react';
import { roleColors } from '@/theme/muiTheme';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CreateStartupDialog } from '@/components/dashboard/CreateStartupDialog';

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

export default function Startups() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !filterIndustry || startup.industry === filterIndustry;
    const matchesStage = !filterStage || startup.stage === filterStage;
    return matchesSearch && matchesIndustry && matchesStage;
  });

  const industries = [...new Set(startups.map((s) => s.industry).filter(Boolean))];
  const stages = [...new Set(startups.map((s) => s.stage).filter(Boolean))];

  const getTitle = () => {
    switch (profile?.role) {
      case 'founder':
        return 'My Startups';
      case 'investor':
        return 'Investment Opportunities';
      case 'mentor':
        return 'Startups Seeking Mentorship';
      case 'developer':
        return 'Startups Hiring';
      default:
        return 'Startups';
    }
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          className="mb-6"
        >
          <Typography variant="h4" className="font-bold">
            {getTitle()}
          </Typography>
          {profile.role === 'founder' && (
            <Button
              variant="contained"
              startIcon={<Plus className="w-5 h-5" />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Startup
            </Button>
          )}
        </Stack>

        {/* Filters */}
        <Paper elevation={0} className="rounded-xl border border-border p-4 mb-6">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={filterIndustry}
                  label="Industry"
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <MenuItem value="">All Industries</MenuItem>
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry!}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={filterStage}
                  label="Stage"
                  onChange={(e) => setFilterStage(e.target.value)}
                >
                  <MenuItem value="">All Stages</MenuItem>
                  {stages.map((stage) => (
                    <MenuItem key={stage} value={stage!}>
                      {stage}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Startups List */}
        <Paper elevation={0} className="rounded-xl border border-border">
          {loadingStartups ? (
            <Box className="p-12 text-center">
              <CircularProgress />
            </Box>
          ) : filteredStartups.length === 0 ? (
            <Box className="p-12 text-center">
              <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </Box>
              <Typography variant="h6" className="font-medium mb-2">
                No startups found
              </Typography>
              <Typography variant="body2" className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {profile.role === 'founder'
                  ? 'Create your first startup to get started and connect with investors and mentors.'
                  : 'Check back later for new opportunities in the ecosystem.'}
              </Typography>
              {profile.role === 'founder' && (
                <Button
                  variant="contained"
                  startIcon={<Plus className="w-5 h-5" />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Startup
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {filteredStartups.map((startup, index) => (
                <Box
                  key={startup.id}
                  className={`p-6 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    index !== filteredStartups.length - 1 ? 'border-b border-border' : ''
                  }`}
                  onClick={() => navigate(`/startups/${startup.id}`)}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box className="flex-1 min-w-0">
                      <Stack direction="row" alignItems="center" spacing={2} className="mb-2">
                        <Typography variant="h6" className="font-semibold">
                          {startup.name}
                        </Typography>
                        {startup.profiles?.full_name && profile.role !== 'founder' && (
                          <Typography variant="caption" className="text-muted-foreground">
                            by {startup.profiles.full_name}
                          </Typography>
                        )}
                      </Stack>
                      {startup.description && (
                        <Typography variant="body2" className="text-muted-foreground mb-3 line-clamp-2">
                          {startup.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {startup.industry && <Chip label={startup.industry} size="small" variant="outlined" />}
                        {startup.stage && (
                          <Chip label={startup.stage} size="small" color="primary" variant="outlined" />
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
                    <Stack alignItems="flex-end" spacing={1}>
                      <Box className="text-right">
                        <Typography variant="body2" className="font-medium">
                          Rating
                        </Typography>
                        <Typography variant="h5" className="font-bold text-primary">
                          {startup.rating?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>
                      <Button size="small" startIcon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      <CreateStartupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchStartups();
        }}
      />
    </DashboardLayout>
  );
}

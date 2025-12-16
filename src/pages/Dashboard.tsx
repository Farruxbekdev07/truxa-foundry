import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Plus,
  Users,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { roleColors } from "@/theme/muiTheme";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateStartupDialog } from "@/components/dashboard/CreateStartupDialog";

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

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStartups();
    }
  }, [user, profile]);

  const fetchStartups = async () => {
    setLoadingStartups(true);
    let query = supabase.from("startups").select("*, profiles(full_name)");

    if (profile?.role === "founder") {
      query = query.eq("founder_id", user?.id);
    } else if (profile?.role === "developer") {
      query = query.eq("looking_for_team", true);
    } else if (profile?.role === "mentor") {
      query = query.eq("looking_for_mentorship", true);
    } else if (profile?.role === "investor") {
      query = query.eq("looking_for_funding", true);
    }

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(5);
    setStartups((data as Startup[]) || []);
    setLoadingStartups(false);
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  const getDashboardTitle = () => {
    switch (profile.role) {
      case "founder":
        return "Your Startups";
      case "investor":
        return "Investment Opportunities";
      case "mentor":
        return "Startups Seeking Guidance";
      case "developer":
        return "Startups Hiring";
      default:
        return "Dashboard";
    }
  };

  const stats = [
    { label: "Total Startups", value: startups.length, icon: Rocket },
    {
      label: "Looking for Team",
      value: startups.filter((s) => s.looking_for_team).length,
      icon: Users,
    },
    {
      label: "Seeking Funding",
      value: startups.filter((s) => s.looking_for_funding).length,
      icon: TrendingUp,
    },
    {
      label: "Need Mentorship",
      value: startups.filter((s) => s.looking_for_mentorship).length,
      icon: GraduationCap,
    },
  ];

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          className="mb-8"
        >
          <Box>
            <Typography variant="h4" className="font-bold mb-1">
              Welcome back, {profile.full_name.split(" ")[0]}!
            </Typography>
            <Typography variant="body1" className="text-muted-foreground">
              Here's what's happening in the ecosystem today.
            </Typography>
          </Box>
          {profile.role === "founder" && (
            <Button
              variant="contained"
              startIcon={<Plus className="w-5 h-5" />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Startup
            </Button>
          )}
        </Stack>

        {/* Stats */}
        <Grid container spacing={2} className="mb-8">
          {stats.map((stat) => (
            <Grid size={{ xs: 6, lg: 3 }} key={stat.label}>
              <Paper
                elevation={0}
                className="p-5 rounded-xl border border-border"
              >
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

        {/* Recent Startups */}
        <Paper elevation={0} className="rounded-xl border border-border">
          <Box className="p-6 border-b border-border flex items-center justify-between">
            <Typography variant="h6" className="font-semibold">
              {getDashboardTitle()}
            </Typography>
            <Button
              component={Link}
              to="/startups"
              endIcon={<ArrowRight className="w-4 h-4" />}
              size="small"
            >
              View All
            </Button>
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
              <Typography
                variant="body2"
                className="text-muted-foreground mb-6 max-w-sm mx-auto"
              >
                {profile.role === "founder"
                  ? "Create your first startup to get started and connect with investors and mentors."
                  : "Check back later for new opportunities in the ecosystem."}
              </Typography>
              {profile.role === "founder" && (
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
              {startups.map((startup, index) => (
                <Box
                  key={startup.id}
                  className={`p-6 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    index !== startups.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                  onClick={() => navigate(`/startups/${startup.id}`)}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={2}
                  >
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
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {startup.industry && (
                          <Chip
                            label={startup.industry}
                            size="small"
                            variant="outlined"
                          />
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
                      <Typography
                        variant="h5"
                        className="font-bold text-primary"
                      >
                        {startup.rating?.toFixed(1) || "0.0"}
                      </Typography>
                    </Box>
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

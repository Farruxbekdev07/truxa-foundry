import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/firebase/compat";
import {
  ArrowLeft,
  TrendingUp,
  GraduationCap,
  Users,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { roleColors } from "@/theme/muiTheme";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EditStartupDialog } from "@/components/dashboard/EditStartupDialog";
import { DeleteStartupDialog } from "@/components/dashboard/DeleteStartupDialog";

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
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
}

export default function StartupDetail() {
  const { id } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loadingStartup, setLoadingStartup] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id) {
      fetchStartup();
    }
  }, [id]);

  const fetchStartup = async () => {
    setLoadingStartup(true);
    const { data } = await supabase
      .from("startups")
      .select("*, profiles(full_name, avatar_url, role)")
      .eq("id", id)
      .single();

    setStartup(data as Startup);
    setLoadingStartup(false);
  };

  const isOwner = startup?.founder_id === user?.id;

  if (loading || loadingStartup) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  if (!startup) {
    return (
      <DashboardLayout>
        <Box className="p-8 text-center">
          <Typography variant="h5" className="mb-4">
            Startup not found
          </Typography>
          <Button
            onClick={() => navigate("/startups")}
            startIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Startups
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <Button
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/startups")}
          className="mb-6"
          color="inherit"
        >
          Back to Startups
        </Button>

        <Paper
          elevation={0}
          className="rounded-xl border border-border overflow-hidden"
        >
          {/* Header */}
          <Box className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "flex-start" }}
              spacing={3}
            >
              <Box>
                <Typography variant="h4" className="font-bold mb-2">
                  {startup.name}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                <Box className="text-center p-4 rounded-xl bg-background/80">
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                  >
                    <Star className="w-5 h-5 text-yellow-500" />
                    <Typography variant="h4" className="font-bold">
                      {startup.rating?.toFixed(1) || "0.0"}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    className="text-muted-foreground"
                  >
                    Rating
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Box className="p-6 md:p-8">
            {/* Founder Info */}
            {startup.profiles && (
              <Box className="mb-6">
                <Typography
                  variant="body2"
                  className="text-muted-foreground mb-2"
                >
                  Founded by
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={startup.profiles.avatar_url || undefined}
                    sx={{ bgcolor: roleColors.founder }}
                  >
                    {startup.profiles.full_name[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" className="font-semibold">
                      {startup.profiles.full_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-muted-foreground capitalize"
                    >
                      {startup.profiles.role}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            <Divider className="my-6" />

            {/* Description */}
            {startup.description && (
              <Box className="mb-6">
                <Typography
                  variant="body2"
                  className="text-muted-foreground mb-2"
                >
                  About
                </Typography>
                <Typography variant="body1">{startup.description}</Typography>
              </Box>
            )}

            {/* Looking For */}
            <Box className="mb-6">
              <Typography
                variant="body2"
                className="text-muted-foreground mb-3"
              >
                Currently Looking For
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {startup.looking_for_team && (
                  <Chip
                    icon={<Users className="w-4 h-4" />}
                    label="Team Members"
                    sx={{
                      backgroundColor: `${roleColors.developer}20`,
                      color: roleColors.developer,
                    }}
                  />
                )}
                {startup.looking_for_funding && (
                  <Chip
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Funding"
                    sx={{
                      backgroundColor: `${roleColors.investor}20`,
                      color: roleColors.investor,
                    }}
                  />
                )}
                {startup.looking_for_mentorship && (
                  <Chip
                    icon={<GraduationCap className="w-4 h-4" />}
                    label="Mentorship"
                    sx={{
                      backgroundColor: `${roleColors.mentor}20`,
                      color: roleColors.mentor,
                    }}
                  />
                )}
                {!startup.looking_for_team &&
                  !startup.looking_for_funding &&
                  !startup.looking_for_mentorship && (
                    <Typography
                      variant="body2"
                      className="text-muted-foreground"
                    >
                      Nothing at the moment
                    </Typography>
                  )}
              </Stack>
            </Box>

            {/* Actions for Owner */}
            {isOwner && (
              <>
                <Divider className="my-6" />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit className="w-4 h-4" />}
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit Startup
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {startup && (
        <>
          <EditStartupDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            startup={startup}
            onSuccess={() => {
              setEditDialogOpen(false);
              fetchStartup();
            }}
          />
          <DeleteStartupDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            startup={startup}
            onSuccess={() => {
              navigate("/startups");
            }}
          />
        </>
      )}
    </DashboardLayout>
  );
}

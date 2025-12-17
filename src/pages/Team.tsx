import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Users, MessageSquare, UserPlus, Code, TrendingUp, GraduationCap } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { roleColors } from "@/theme/muiTheme";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "developer":
      return Code;
    case "investor":
      return TrendingUp;
    case "mentor":
      return GraduationCap;
    default:
      return Users;
  }
};

export default function Team() {
  const { user, profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [hiringMessage, setHiringMessage] = useState("");
  const [hiringDialogOpen, setHiringDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [roleFilter]);

  const fetchProfiles = async () => {
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("id", user?.id || "");

    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    const { data } = await query.order("full_name");

    if (data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const handleHireRequest = async () => {
    if (!user || !selectedProfile) return;

    setSubmitting(true);

    const hiringType = selectedProfile.role === "developer" ? "developer" 
      : selectedProfile.role === "investor" ? "investor" 
      : "mentor";

    const { error } = await supabase.from("hiring_requests").insert({
      requester_id: user.id,
      target_id: selectedProfile.id,
      type: hiringType,
      message: hiringMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request sent!",
        description: `Your request has been sent to ${selectedProfile.full_name}`,
      });
      setHiringDialogOpen(false);
      setHiringMessage("");
      setSelectedProfile(null);
    }

    setSubmitting(false);
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionLabel = (role: string) => {
    switch (role) {
      case "developer":
        return "Hire";
      case "investor":
        return "Connect";
      case "mentor":
        return "Request Mentorship";
      default:
        return "Connect";
    }
  };

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
      <Box className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold mb-2">
            Find Talent
          </Typography>
          <Typography variant="body1" className="text-muted-foreground">
            Connect with developers, investors, and mentors
          </Typography>
        </Box>

        {/* Filters */}
        <Paper elevation={0} className="p-4 rounded-xl border border-border mb-6">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <TextField
              placeholder="Search by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              className="flex-1"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1}>
              {["all", "developer", "investor", "mentor"].map((role) => (
                <Chip
                  key={role}
                  label={role === "all" ? "All" : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
                  onClick={() => setRoleFilter(role)}
                  color={roleFilter === role ? "primary" : "default"}
                  variant={roleFilter === role ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <Paper elevation={0} className="p-12 rounded-xl border border-border text-center">
            <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </Box>
            <Typography variant="h6" className="font-medium mb-2">
              No profiles found
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Try adjusting your search or filters
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredProfiles.map((profile) => {
              const RoleIcon = getRoleIcon(profile.role);
              const roleColor = roleColors[profile.role as keyof typeof roleColors] || roleColors.developer;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={profile.id}>
                  <Card variant="outlined" className="h-full">
                    <CardContent className="text-center">
                      <Avatar
                        src={profile.avatar_url || undefined}
                        className="w-20 h-20 mx-auto mb-3"
                        sx={{ backgroundColor: `${roleColor}20` }}
                      >
                        {profile.full_name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" className="font-semibold mb-1">
                        {profile.full_name}
                      </Typography>
                      <Chip
                        icon={<RoleIcon className="w-3 h-3" />}
                        label={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: `${roleColor}20`,
                          color: roleColor,
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="body2"
                        className="text-muted-foreground line-clamp-2 mb-4 min-h-[40px]"
                      >
                        {profile.bio || "No bio available"}
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MessageSquare className="w-4 h-4" />}
                        >
                          Message
                        </Button>
                        {currentProfile?.role === "founder" && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<UserPlus className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedProfile(profile);
                              setHiringDialogOpen(true);
                            }}
                          >
                            {getActionLabel(profile.role)}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Hiring Request Dialog */}
        <Dialog
          open={hiringDialogOpen}
          onClose={() => setHiringDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedProfile && getActionLabel(selectedProfile.role)} {selectedProfile?.full_name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              Send a personalized message to introduce yourself and explain what you're looking for.
            </Typography>
            <TextField
              label="Message"
              value={hiringMessage}
              onChange={(e) => setHiringMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Hi, I'm building [startup name] and I'm looking for..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHiringDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleHireRequest}
              disabled={submitting || !hiringMessage.trim()}
            >
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}

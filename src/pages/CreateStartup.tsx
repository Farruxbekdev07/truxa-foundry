import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Building2, Target, Users, TrendingUp, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "AI/ML",
  "SaaS",
  "Consumer",
  "Enterprise",
  "Other",
];

const stages = ["Idea", "MVP", "Seed", "Series A", "Series B+", "Growth"];

export default function CreateStartup() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [lookingForTeam, setLookingForTeam] = useState(false);
  const [lookingForMentorship, setLookingForMentorship] = useState(false);
  const [lookingForFunding, setLookingForFunding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingStartup, setCheckingStartup] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
      return;
    }

    if (!authLoading && profile && profile.role !== "founder") {
      navigate("/dashboard");
      return;
    }

    // Check if founder already has a startup
    if (user && profile?.role === "founder") {
      checkExistingStartup();
    }
  }, [user, profile, authLoading, navigate]);

  const checkExistingStartup = async () => {
    const { data } = await supabase
      .from("startups")
      .select("id")
      .eq("founder_id", user!.id)
      .maybeSingle();

    if (data) {
      // Founder already has a startup, redirect to dashboard
      navigate("/dashboard");
    } else {
      setCheckingStartup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !name.trim()) return;

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("startups").insert({
      name: name.trim(),
      description: description.trim() || null,
      industry: industry || null,
      stage: stage || null,
      looking_for_team: lookingForTeam,
      looking_for_mentorship: lookingForMentorship,
      looking_for_funding: lookingForFunding,
      founder_id: user.id,
    });

    if (insertError) {
      if (insertError.message.includes("unique constraint")) {
        setError("You already have a startup. Each founder can only create one startup.");
      } else {
        setError(insertError.message);
      }
      setSaving(false);
    } else {
      toast({
        title: "Startup created!",
        description: "Your startup profile is ready. Welcome to Truxa Foundry!",
      });
      navigate("/dashboard");
    }
  };

  if (authLoading || checkingStartup) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex bg-gradient-subtle">
      {/* Left Panel - Branding */}
      <Box className="hidden lg:flex lg:w-1/2 bg-gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />

        <Box className="relative z-10">
          <Box className="flex items-center gap-2 mb-12">
            <Box className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Rocket className="w-6 h-6 text-white" />
            </Box>
            <Typography variant="h5" className="font-bold text-white">
              Truxa Foundry
            </Typography>
          </Box>

          <Typography variant="h3" className="font-bold text-white leading-tight mb-6">
            Let's set up your startup
          </Typography>
          <Typography variant="body1" className="text-white/80 max-w-md mb-8">
            Create your startup profile to connect with investors, mentors, and developers in the ecosystem.
          </Typography>

          <Stack spacing={3}>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Showcase your startup to the community</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Find talented developers for your team</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Connect with investors for funding</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Get guidance from experienced mentors</Typography>
            </Box>
          </Stack>
        </Box>

        <Box className="relative z-10">
          <Typography variant="body2" className="text-white/60">
            © {new Date().getFullYear()} Truxa Foundry. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <Box className="w-full max-w-lg">
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-4 lg:hidden">
              <Box className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </Box>
              <Typography variant="h5" className="font-bold">
                Truxa Foundry
              </Typography>
            </Box>
            <Typography variant="h4" className="font-bold mb-2">
              Create your startup
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Tell us about your startup to get started on your entrepreneurial journey.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Startup Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your startup name"
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                    </Box>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="What does your startup do? What problem does it solve?"
              />

              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={industry}
                  label="Industry"
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {industries.map((ind) => (
                    <MenuItem key={ind} value={ind}>
                      {ind}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={stage}
                  label="Stage"
                  onChange={(e) => setStage(e.target.value)}
                >
                  {stages.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Paper elevation={0} className="p-4 rounded-xl border border-border">
                <Typography variant="body2" className="font-medium mb-3">
                  What are you looking for?
                </Typography>
                <Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lookingForTeam}
                        onChange={(e) => setLookingForTeam(e.target.checked)}
                      />
                    }
                    label="Team members (developers, designers, etc.)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lookingForMentorship}
                        onChange={(e) => setLookingForMentorship(e.target.checked)}
                      />
                    }
                    label="Mentorship & guidance"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lookingForFunding}
                        onChange={(e) => setLookingForFunding(e.target.checked)}
                      />
                    }
                    label="Investment & funding"
                  />
                </Stack>
              </Paper>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={saving || !name.trim()}
                className="h-12"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Rocket className="w-5 h-5" />}
              >
                {saving ? "Creating..." : "Create Startup & Continue"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

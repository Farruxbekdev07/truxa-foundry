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
  Stack,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Rocket, 
  Building2, 
  Target, 
  Users, 
  TrendingUp, 
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from "lucide-react";
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

const stages = ["Idea", "MVP", "Pre-seed", "Seed", "Series A", "Series B+", "Growth"];

const steps = [
  { label: "Basic Info", description: "Name and industry" },
  { label: "Problem & Solution", description: "What you solve" },
  { label: "Market & Team", description: "Target audience" },
];

export default function CreateStartup() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [teamInfo, setTeamInfo] = useState("");
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
      navigate("/dashboard");
    } else {
      setCheckingStartup(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!name.trim()) {
          toast({ title: "Required", description: "Please enter your startup name.", variant: "destructive" });
          return false;
        }
        if (!industry) {
          toast({ title: "Required", description: "Please select an industry.", variant: "destructive" });
          return false;
        }
        return true;
      case 1:
        if (!problem.trim()) {
          toast({ title: "Required", description: "Please describe the problem you solve.", variant: "destructive" });
          return false;
        }
        if (!solution.trim()) {
          toast({ title: "Required", description: "Please describe your solution.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!targetMarket.trim()) {
          toast({ title: "Required", description: "Please describe your target market.", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;
    if (!user) return;

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("startups").insert({
      name: name.trim(),
      description: description.trim() || null,
      industry: industry || null,
      stage: stage || "Idea",
      target_market: targetMarket.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      team_info: teamInfo.trim() || null,
      looking_for_team: false,
      looking_for_mentorship: false,
      looking_for_funding: false,
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
        title: "Startup Created!",
        description: "Your startup profile has been created. AI analysis will begin shortly.",
      });
      navigate("/dashboard");
    }
  };

  if (authLoading || checkingStartup) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" className="text-muted-foreground">
            Loading...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex bg-gradient-subtle">
      {/* Left Panel - Branding */}
      <Box className="hidden lg:flex lg:w-2/5 bg-gradient-hero p-12 flex-col justify-between relative overflow-hidden">
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
            Complete Your Startup Profile
          </Typography>
          <Typography variant="body1" className="text-white/80 max-w-md mb-8">
            Tell us about your startup so our AI can provide personalized validation insights and recommendations.
          </Typography>

          <Stack spacing={3}>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Product-Market Fit analysis</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Market demand signals</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </Box>
              <Typography variant="body2">Personalized recommendations</Typography>
            </Box>
            <Box className="flex items-center gap-3 text-white/90">
              <Box className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </Box>
              <Typography variant="body2">AI-powered insights</Typography>
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
      <Box className="w-full lg:w-3/5 flex flex-col p-8 overflow-y-auto">
        <Box className="w-full max-w-2xl mx-auto">
          {/* Mobile Header */}
          <Box className="mb-8 lg:hidden">
            <Box className="flex items-center gap-2 mb-4">
              <Box className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </Box>
              <Typography variant="h5" className="font-bold">
                Truxa Foundry
              </Typography>
            </Box>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        activeStep > index
                          ? "bg-accent text-accent-foreground"
                          : activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeStep > index ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Typography variant="body2" className="font-semibold">
                          {index + 1}
                        </Typography>
                      )}
                    </Box>
                  )}
                >
                  <Typography variant="body2" className="font-medium">
                    {step.label}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Paper elevation={0} className="p-8 rounded-xl border border-border">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {activeStep === 0 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h5" className="font-bold mb-2">
                      <Building2 className="w-6 h-6 inline mr-2 text-primary" />
                      Basic Information
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Let's start with the basics about your startup.
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Startup Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Acme Inc."
                    helperText="Choose a memorable name for your startup"
                  />

                  <TextField
                    fullWidth
                    label="Short Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="A brief one-liner about your startup..."
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Industry *</InputLabel>
                      <Select
                        value={industry}
                        label="Industry *"
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
                      <InputLabel>Current Stage</InputLabel>
                      <Select
                        value={stage}
                        label="Current Stage"
                        onChange={(e) => setStage(e.target.value)}
                      >
                        {stages.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              )}

              {/* Step 2: Problem & Solution */}
              {activeStep === 1 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h5" className="font-bold mb-2">
                      <Lightbulb className="w-6 h-6 inline mr-2 text-primary" />
                      Problem & Solution
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Tell us about the problem you're solving and your approach.
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Problem Statement *"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    multiline
                    rows={4}
                    placeholder="What specific problem are you solving? Who experiences this problem?"
                    helperText="Be specific about the pain points your target customers face."
                  />

                  <TextField
                    fullWidth
                    label="Your Solution *"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    multiline
                    rows={4}
                    placeholder="How does your product/service solve this problem? What makes it unique?"
                    helperText="Explain your approach and any competitive advantages."
                  />
                </Stack>
              )}

              {/* Step 3: Market & Team */}
              {activeStep === 2 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h5" className="font-bold mb-2">
                      <Target className="w-6 h-6 inline mr-2 text-primary" />
                      Market & Team
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Describe your target market and team.
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Target Market *"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Who are your ideal customers? What's the market size?"
                    helperText="Describe your target audience demographics and market opportunity."
                  />

                  <TextField
                    fullWidth
                    label="Team Information (Optional)"
                    value={teamInfo}
                    onChange={(e) => setTeamInfo(e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Tell us about your founding team, their backgrounds, and expertise..."
                    InputProps={{
                      startAdornment: (
                        <Box className="self-start mt-3 mr-2">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </Box>
                      ),
                    }}
                  />

                  {/* AI Analysis Preview */}
                  <Paper
                    elevation={0}
                    className="p-5 rounded-xl border-2 border-accent/30 bg-accent/5"
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-accent" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" className="font-semibold mb-1">
                          What happens next?
                        </Typography>
                        <Typography variant="body2" className="text-muted-foreground mb-3">
                          After you submit, our AI will analyze your startup profile and generate:
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="body2" className="text-muted-foreground">
                            • Product-Market Fit score and analysis
                          </Typography>
                          <Typography variant="body2" className="text-muted-foreground">
                            • Demand signal indicators
                          </Typography>
                          <Typography variant="body2" className="text-muted-foreground">
                            • Personalized recommendations
                          </Typography>
                          <Typography variant="body2" className="text-muted-foreground">
                            • Competitive landscape insights
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {/* Navigation Buttons */}
              <Stack
                direction="row"
                justifyContent="space-between"
                className="mt-8 pt-6 border-t border-border"
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0 || saving}
                  startIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>

                {activeStep < 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Rocket className="w-5 h-5" />
                      )
                    }
                    sx={{
                      background: "var(--gradient-hero)",
                      "&:hover": { opacity: 0.9 },
                    }}
                  >
                    {saving ? "Creating..." : "Launch Startup"}
                  </Button>
                )}
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

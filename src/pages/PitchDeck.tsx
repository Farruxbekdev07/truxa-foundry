import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Presentation,
  FileText,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Palette,
  Layout,
  Rocket,
  Globe,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: string;
  type: string;
  title: string;
  content: string;
  subtitle?: string;
  bullets?: string[];
  imageUrl?: string;
  layout?: string;
}

interface PitchDeck {
  id: string;
  startup_id: string;
  title: string;
  slides: Slide[];
}

const SLIDE_TEMPLATES = [
  { type: "cover", title: "Cover Slide", icon: Presentation, description: "Company name and tagline" },
  { type: "problem", title: "Problem", icon: Target, description: "The problem you're solving" },
  { type: "solution", title: "Solution", icon: Lightbulb, description: "Your unique solution" },
  { type: "market", title: "Market Size", icon: BarChart3, description: "Total addressable market" },
  { type: "product", title: "Product", icon: FileText, description: "Product details and features" },
  { type: "team", title: "Team", icon: Users, description: "Founding team and expertise" },
  { type: "traction", title: "Traction", icon: TrendingUp, description: "Key metrics and milestones" },
  { type: "business-model", title: "Business Model", icon: DollarSign, description: "How you make money" },
  { type: "competition", title: "Competition", icon: Shield, description: "Competitive landscape" },
  { type: "roadmap", title: "Roadmap", icon: Rocket, description: "Future plans and milestones" },
  { type: "ask", title: "The Ask", icon: DollarSign, description: "Funding requirements" },
  { type: "contact", title: "Contact", icon: Globe, description: "How to reach you" },
];

const DECK_TEMPLATES = [
  {
    id: "startup-classic",
    name: "Startup Classic",
    description: "The proven 10-slide format used by YC startups",
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
    slides: [
      { type: "cover", title: "Company Name", content: "One-line description of what your company does", subtitle: "Tagline goes here" },
      { type: "problem", title: "The Problem", content: "Describe the problem you're solving", bullets: ["Pain point 1", "Pain point 2", "Pain point 3"] },
      { type: "solution", title: "Our Solution", content: "How your product solves the problem", bullets: ["Key feature 1", "Key feature 2", "Key feature 3"] },
      { type: "product", title: "Product Demo", content: "Show your product in action", subtitle: "Screenshots or demo link" },
      { type: "market", title: "Market Opportunity", content: "$X Billion TAM", bullets: ["SAM: $X Billion", "SOM: $X Million", "Growing X% annually"] },
      { type: "business-model", title: "Business Model", content: "How we make money", bullets: ["Revenue stream 1", "Revenue stream 2", "Unit economics"] },
      { type: "traction", title: "Traction", content: "What we've achieved so far", bullets: ["X users/customers", "X% MoM growth", "Key partnerships"] },
      { type: "competition", title: "Competition", content: "Our competitive advantage", bullets: ["Competitor 1 vs Us", "Competitor 2 vs Us", "Our moat"] },
      { type: "team", title: "The Team", content: "Why we're the right team", bullets: ["Founder 1 - Role & background", "Founder 2 - Role & background", "Advisors"] },
      { type: "ask", title: "The Ask", content: "Raising $X", bullets: ["Use of funds: Product (X%)", "Use of funds: Growth (X%)", "Use of funds: Team (X%)"] },
    ],
  },
  {
    id: "investor-focused",
    name: "Investor Pitch",
    description: "Focused on metrics and growth for Series A+",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    slides: [
      { type: "cover", title: "Company Name", content: "Series A Pitch Deck", subtitle: "[Month Year]" },
      { type: "traction", title: "Key Metrics at a Glance", content: "", bullets: ["ARR: $X", "MRR Growth: X%", "Net Revenue Retention: X%", "CAC Payback: X months"] },
      { type: "problem", title: "Market Problem", content: "The $X billion problem we're solving" },
      { type: "solution", title: "Our Platform", content: "How we're different" },
      { type: "market", title: "Market Size & Growth", content: "TAM/SAM/SOM analysis" },
      { type: "business-model", title: "Unit Economics", content: "LTV: $X | CAC: $X | LTV/CAC: X" },
      { type: "traction", title: "Growth Trajectory", content: "Historical and projected growth" },
      { type: "competition", title: "Competitive Moat", content: "Why we'll win" },
      { type: "team", title: "Leadership Team", content: "Combined X years of experience" },
      { type: "roadmap", title: "Product Roadmap", content: "Next 18 months" },
      { type: "ask", title: "Investment Opportunity", content: "Raising $X at $Y valuation" },
    ],
  },
  {
    id: "problem-solution",
    name: "Problem-Solution",
    description: "Story-driven format for early-stage startups",
    icon: Lightbulb,
    color: "from-orange-500 to-red-600",
    slides: [
      { type: "cover", title: "Company Name", content: "Solving [Problem] for [Audience]" },
      { type: "problem", title: "The Status Quo", content: "How things work today (and why it's broken)" },
      { type: "problem", title: "The Pain", content: "Real stories from real customers" },
      { type: "solution", title: "Imagine If...", content: "The world with our solution" },
      { type: "product", title: "Introducing [Product]", content: "See it in action" },
      { type: "market", title: "Who Needs This?", content: "Our target market" },
      { type: "traction", title: "Early Validation", content: "What customers are saying" },
      { type: "team", title: "Built by Experts", content: "Why we understand this problem" },
      { type: "ask", title: "Join Us", content: "Investment & partnership opportunities" },
    ],
  },
  {
    id: "demo-day",
    name: "Demo Day",
    description: "5-minute format for accelerator demo days",
    icon: Award,
    color: "from-purple-500 to-pink-600",
    slides: [
      { type: "cover", title: "Company Name", content: "Demo Day [Accelerator Name]" },
      { type: "problem", title: "Problem", content: "One sentence problem statement" },
      { type: "solution", title: "Solution", content: "One sentence solution" },
      { type: "product", title: "Demo", content: "Live product demonstration" },
      { type: "traction", title: "Traction", content: "Key numbers that matter" },
      { type: "ask", title: "Ask", content: "What we need to succeed" },
    ],
  },
];

const SLIDE_THEMES = [
  { id: "gradient-blue", name: "Ocean Blue", gradient: "from-blue-600 to-indigo-800", text: "white" },
  { id: "gradient-teal", name: "Teal Dreams", gradient: "from-teal-500 to-cyan-700", text: "white" },
  { id: "gradient-purple", name: "Royal Purple", gradient: "from-purple-600 to-pink-700", text: "white" },
  { id: "gradient-orange", name: "Sunset", gradient: "from-orange-500 to-red-600", text: "white" },
  { id: "gradient-green", name: "Forest", gradient: "from-green-600 to-emerald-800", text: "white" },
  { id: "dark", name: "Dark Mode", gradient: "from-slate-800 to-slate-900", text: "white" },
  { id: "light", name: "Clean White", gradient: "from-slate-50 to-white", text: "slate-800" },
  { id: "gradient-warm", name: "Warm Glow", gradient: "from-amber-400 to-orange-500", text: "slate-900" },
];

export default function PitchDeck() {
  const { startupId, deckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(SLIDE_THEMES[0]);

  useEffect(() => {
    if (deckId === "new") {
      setTitle("New Pitch Deck");
      setSlides([]);
      setLoading(false);
      setDialogOpen(true); // Auto-open template picker for new decks
    } else {
      fetchDeck();
    }
  }, [deckId]);

  const fetchDeck = async () => {
    if (!deckId || deckId === "new") return;

    const { data, error } = await supabase
      .from("pitch_decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load pitch deck",
        variant: "destructive",
      });
      navigate(`/startups/${startupId}`);
      return;
    }

    const slidesArray = Array.isArray(data.slides) ? data.slides : [];
    const deckData = {
      ...data,
      slides: slidesArray as unknown as Slide[],
    };

    setDeck(deckData);
    setTitle(deckData.title);
    setSlides(deckData.slides);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!startupId) return;

    setSaving(true);

    const slidesJson = JSON.parse(JSON.stringify(slides));

    let result;
    if (deckId === "new") {
      result = await supabase.from("pitch_decks").insert([{
        startup_id: startupId,
        title,
        slides: slidesJson,
      }]).select().single();
    } else {
      result = await supabase.from("pitch_decks").update({
        title,
        slides: slidesJson,
      }).eq("id", deckId).select().single();
    }

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to save pitch deck",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pitch deck saved successfully",
      });
      if (deckId === "new" && result.data) {
        navigate(`/startups/${startupId}/pitch-deck/${result.data.id}`, { replace: true });
      }
    }

    setSaving(false);
  };

  const applyDeckTemplate = (template: typeof DECK_TEMPLATES[0]) => {
    const newSlides: Slide[] = template.slides.map((slideData, index) => ({
      id: crypto.randomUUID(),
      type: slideData.type,
      title: slideData.title,
      content: slideData.content,
      subtitle: slideData.subtitle,
      bullets: slideData.bullets,
    }));
    setSlides(newSlides);
    setTitle(template.name + " - " + title.replace("New Pitch Deck", "My Startup"));
    setActiveSlide(0);
    setDialogOpen(false);
    toast({
      title: "Template Applied",
      description: `${template.name} template with ${template.slides.length} slides`,
    });
  };

  const addSlide = (template: typeof SLIDE_TEMPLATES[0]) => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      type: template.type,
      title: template.title,
      content: "",
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
    setDialogOpen(false);
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], ...updates };
    setSlides(updatedSlides);
  };

  const deleteSlide = (index: number) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    if (activeSlide >= updatedSlides.length) {
      setActiveSlide(Math.max(0, updatedSlides.length - 1));
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToCopy = slides[index];
    const newSlide: Slide = {
      ...slideToCopy,
      id: crypto.randomUUID(),
      title: slideToCopy.title + " (Copy)",
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setActiveSlide(index + 1);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === slides.length - 1)) {
      return;
    }
    const newSlides = [...slides];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setSlides(newSlides);
    setActiveSlide(newIndex);
  };

  const getSlideIcon = (type: string) => {
    const template = SLIDE_TEMPLATES.find((t) => t.type === type);
    return template?.icon || FileText;
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          className="mb-6"
        >
          <Box className="flex items-center gap-4">
            <IconButton onClick={() => navigate(`/startups/${startupId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </IconButton>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                className: "text-2xl font-bold",
              }}
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Palette className="w-4 h-4" />}
              onClick={() => { setDialogOpen(true); setDialogTab(2); }}
            >
              Theme
            </Button>
            <Button
              variant="outlined"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => { setDialogOpen(true); setDialogTab(1); }}
            >
              Add Slide
            </Button>
            <Button
              variant="contained"
              startIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Slide Thumbnails */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={0} className="p-4 rounded-xl border border-border">
              <Box className="flex items-center justify-between mb-3">
                <Typography variant="subtitle2" className="font-medium">
                  Slides ({slides.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<Layout className="w-3 h-3" />}
                  onClick={() => { setDialogOpen(true); setDialogTab(0); }}
                >
                  Templates
                </Button>
              </Box>
              <Stack spacing={2} className="max-h-[60vh] overflow-y-auto">
                {slides.map((slide, index) => {
                  const Icon = getSlideIcon(slide.type);
                  return (
                    <Paper
                      key={slide.id}
                      elevation={0}
                      onClick={() => setActiveSlide(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        activeSlide === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Box className="flex items-center gap-2 mb-2">
                        <Chip label={index + 1} size="small" className="w-6 h-6" />
                        <Icon className="w-4 h-4 text-primary" />
                        <Typography variant="body2" className="font-medium flex-1 truncate">
                          {slide.title}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-1 justify-end">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); moveSlide(index, "up"); }}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); moveSlide(index, "down"); }}
                          disabled={index === slides.length - 1}
                        >
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
                        >
                          <Copy className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
                {slides.length === 0 && (
                  <Box className="p-6 text-center">
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                    <Typography variant="body2" className="text-muted-foreground mb-2">
                      Start with a template
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => { setDialogOpen(true); setDialogTab(0); }}
                      startIcon={<Layout className="w-4 h-4" />}
                    >
                      Choose Template
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Slide Editor */}
          <Grid size={{ xs: 12, md: 9 }}>
            {slides.length > 0 && slides[activeSlide] ? (
              <Paper elevation={0} className="rounded-xl border border-border overflow-hidden">
                {/* Slide Preview */}
                <Box className={`p-8 aspect-video bg-gradient-to-br ${selectedTheme.gradient}`}>
                  <Box className="h-full flex flex-col">
                    {/* Slide Number Badge */}
                    <Chip 
                      label={`${activeSlide + 1} / ${slides.length}`}
                      size="small"
                      className="self-end mb-4 bg-white/20 text-white"
                    />
                    
                    {/* Title */}
                    <TextField
                      value={slides[activeSlide].title}
                      onChange={(e) => updateSlide(activeSlide, { title: e.target.value })}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        className: `text-4xl font-bold ${selectedTheme.text === "white" ? "text-white" : "text-slate-800"}`,
                        style: { color: selectedTheme.text === "white" ? "white" : "#1e293b" },
                      }}
                      fullWidth
                      placeholder="Slide Title"
                    />

                    {/* Subtitle */}
                    <TextField
                      value={slides[activeSlide].subtitle || ""}
                      onChange={(e) => updateSlide(activeSlide, { subtitle: e.target.value })}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        className: `text-xl ${selectedTheme.text === "white" ? "text-white/80" : "text-slate-600"}`,
                        style: { color: selectedTheme.text === "white" ? "rgba(255,255,255,0.8)" : "#475569" },
                      }}
                      fullWidth
                      placeholder="Subtitle (optional)"
                      className="mt-2"
                    />

                    {/* Content */}
                    <TextField
                      value={slides[activeSlide].content}
                      onChange={(e) => updateSlide(activeSlide, { content: e.target.value })}
                      placeholder="Main content..."
                      multiline
                      rows={4}
                      fullWidth
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        className: `text-lg mt-6 ${selectedTheme.text === "white" ? "text-white/90" : "text-slate-700"}`,
                        style: { color: selectedTheme.text === "white" ? "rgba(255,255,255,0.9)" : "#334155" },
                      }}
                    />

                    {/* Bullets */}
                    <Box className="mt-4 flex-1">
                      <TextField
                        value={slides[activeSlide].bullets?.join("\n") || ""}
                        onChange={(e) => updateSlide(activeSlide, { 
                          bullets: e.target.value.split("\n").filter(b => b.trim()) 
                        })}
                        placeholder="• Bullet point 1&#10;• Bullet point 2&#10;• Bullet point 3"
                        multiline
                        rows={4}
                        fullWidth
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          className: `text-base ${selectedTheme.text === "white" ? "text-white/80" : "text-slate-600"}`,
                          style: { color: selectedTheme.text === "white" ? "rgba(255,255,255,0.8)" : "#475569" },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Paper elevation={0} className="rounded-xl border border-border p-12 text-center">
                <Box className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-10 h-10 text-primary" />
                </Box>
                <Typography variant="h5" className="font-semibold mb-2">
                  Create Your Pitch Deck
                </Typography>
                <Typography variant="body1" className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start with a proven template or build from scratch. Impress investors with a professional presentation.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Sparkles className="w-5 h-5" />}
                    onClick={() => { setDialogOpen(true); setDialogTab(0); }}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Plus className="w-5 h-5" />}
                    onClick={() => { setDialogOpen(true); setDialogTab(1); }}
                  >
                    Start Blank
                  </Button>
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Template/Slide Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)}>
              <Tab label="Deck Templates" icon={<Layout className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Add Slide" icon={<Plus className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Themes" icon={<Palette className="w-4 h-4" />} iconPosition="start" />
            </Tabs>
          </DialogTitle>
          <DialogContent>
            {/* Deck Templates Tab */}
            {dialogTab === 0 && (
              <Grid container spacing={3} className="mt-2">
                {DECK_TEMPLATES.map((template) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
                    <Card
                      onClick={() => applyDeckTemplate(template)}
                      className="cursor-pointer hover:shadow-lg transition-all h-full"
                      variant="outlined"
                    >
                      <Box className={`h-24 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                        <template.icon className="w-12 h-12 text-white" />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" className="font-semibold">
                          {template.name}
                        </Typography>
                        <Typography variant="body2" className="text-muted-foreground mb-2">
                          {template.description}
                        </Typography>
                        <Chip label={`${template.slides.length} slides`} size="small" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Add Slide Tab */}
            {dialogTab === 1 && (
              <Grid container spacing={2} className="mt-2">
                {SLIDE_TEMPLATES.map((template) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={template.type}>
                    <Card
                      onClick={() => addSlide(template)}
                      className="cursor-pointer hover:border-primary transition-all h-full"
                      variant="outlined"
                    >
                      <CardContent className="text-center">
                        <template.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <Typography variant="body2" className="font-medium">
                          {template.title}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Themes Tab */}
            {dialogTab === 2 && (
              <Grid container spacing={2} className="mt-2">
                {SLIDE_THEMES.map((theme) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={theme.id}>
                    <Card
                      onClick={() => { setSelectedTheme(theme); setDialogOpen(false); }}
                      className={`cursor-pointer hover:shadow-lg transition-all ${
                        selectedTheme.id === theme.id ? "ring-2 ring-primary" : ""
                      }`}
                      variant="outlined"
                    >
                      <Box className={`h-20 bg-gradient-to-br ${theme.gradient}`} />
                      <CardContent className="py-2">
                        <Typography variant="body2" className="font-medium text-center">
                          {theme.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}

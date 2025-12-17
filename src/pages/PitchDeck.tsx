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
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: string;
  type: string;
  title: string;
  content: string;
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
  { type: "ask", title: "The Ask", icon: DollarSign, description: "Funding requirements" },
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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  useEffect(() => {
    if (deckId === "new") {
      setTitle("New Pitch Deck");
      setSlides([]);
      setLoading(false);
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

    const deckData = {
      ...data,
      slides: (data.slides || []) as Slide[],
    };

    setDeck(deckData);
    setTitle(deckData.title);
    setSlides(deckData.slides);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!startupId) return;

    setSaving(true);

    const deckData = {
      startup_id: startupId,
      title,
      slides: slides as unknown as Record<string, unknown>[],
    };

    let result;
    if (deckId === "new") {
      result = await supabase.from("pitch_decks").insert([deckData]).select().single();
    } else {
      result = await supabase.from("pitch_decks").update(deckData).eq("id", deckId).select().single();
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

  const addSlide = (template: typeof SLIDE_TEMPLATES[0]) => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      type: template.type,
      title: template.title,
      content: "",
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
    setTemplateDialogOpen(false);
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
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => setTemplateDialogOpen(true)}
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
              <Typography variant="subtitle2" className="font-medium mb-3">
                Slides ({slides.length})
              </Typography>
              <Stack spacing={2}>
                {slides.map((slide, index) => {
                  const template = SLIDE_TEMPLATES.find((t) => t.type === slide.type);
                  const Icon = template?.icon || FileText;
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
                      <Box className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <Typography variant="body2" className="font-medium flex-1 truncate">
                          {slide.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
                {slides.length === 0 && (
                  <Box className="p-6 text-center">
                    <Typography variant="body2" className="text-muted-foreground mb-2">
                      No slides yet
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setTemplateDialogOpen(true)}
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add First Slide
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Slide Editor */}
          <Grid size={{ xs: 12, md: 9 }}>
            {slides.length > 0 && slides[activeSlide] ? (
              <Paper
                elevation={0}
                className="rounded-xl border border-border overflow-hidden"
              >
                <Box className="p-6 bg-gradient-hero aspect-video flex flex-col items-center justify-center text-white">
                  <TextField
                    value={slides[activeSlide].title}
                    onChange={(e) => updateSlide(activeSlide, { title: e.target.value })}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      className: "text-3xl font-bold text-center text-white",
                      style: { color: "white" },
                    }}
                    fullWidth
                    className="text-center mb-6"
                  />
                  <TextField
                    value={slides[activeSlide].content}
                    onChange={(e) => updateSlide(activeSlide, { content: e.target.value })}
                    placeholder="Add your content here..."
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      className: "bg-white/10 text-white placeholder:text-white/50",
                    }}
                  />
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                className="rounded-xl border border-border p-12 text-center"
              >
                <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-8 h-8 text-muted-foreground" />
                </Box>
                <Typography variant="h6" className="font-medium mb-2">
                  Start building your pitch deck
                </Typography>
                <Typography variant="body2" className="text-muted-foreground mb-6">
                  Add slides using templates to create a compelling investor presentation.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  Add Your First Slide
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Template Dialog */}
        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Choose a Slide Template</DialogTitle>
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}

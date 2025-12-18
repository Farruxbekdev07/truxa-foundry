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
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Save,
  ArrowLeft,
  Video,
  FileText,
  Play,
  Clock,
  Mic,
  Camera,
  Lightbulb,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PitchVideo {
  id: string;
  startup_id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  script: string | null;
}

interface ScriptSection {
  id: string;
  title: string;
  duration: string;
  icon: React.ElementType;
  placeholder: string;
  tips: string[];
}

const SCRIPT_TEMPLATES = [
  {
    id: "elevator-30",
    name: "30-Second Elevator",
    duration: "30 seconds",
    description: "Perfect for networking events and quick introductions",
    color: "from-blue-500 to-cyan-600",
    sections: [
      {
        id: "hook",
        title: "Hook",
        duration: "5 sec",
        icon: Lightbulb,
        placeholder: "Start with a surprising fact, question, or bold statement that grabs attention.",
        tips: ["Use a statistic that shocks", "Ask a rhetorical question", "State a common frustration"],
      },
      {
        id: "problem",
        title: "Problem",
        duration: "8 sec",
        icon: Target,
        placeholder: "Describe the problem in one or two sentences.",
        tips: ["Make it relatable", "Quantify the pain if possible", "Use 'you' language"],
      },
      {
        id: "solution",
        title: "Solution",
        duration: "10 sec",
        icon: Sparkles,
        placeholder: "Explain what your product does and how it solves the problem.",
        tips: ["Lead with the benefit", "Use simple language", "Avoid jargon"],
      },
      {
        id: "cta",
        title: "Call to Action",
        duration: "7 sec",
        icon: DollarSign,
        placeholder: "What do you want them to do next?",
        tips: ["Be specific", "Make it easy", "Create urgency"],
      },
    ],
  },
  {
    id: "pitch-60",
    name: "60-Second Pitch",
    duration: "1 minute",
    description: "The classic startup pitch format for initial investor meetings",
    color: "from-emerald-500 to-teal-600",
    sections: [
      {
        id: "hook",
        title: "Attention Grabber",
        duration: "8 sec",
        icon: Lightbulb,
        placeholder: "Open with a compelling hook - a story, statistic, or provocative question.",
        tips: ["Personal stories work well", "Industry-specific stats impress", "Challenge assumptions"],
      },
      {
        id: "problem",
        title: "The Problem",
        duration: "12 sec",
        icon: Target,
        placeholder: "Paint a vivid picture of the problem. Who has it? How painful is it?",
        tips: ["Be specific about who suffers", "Quantify the cost", "Make them feel the pain"],
      },
      {
        id: "solution",
        title: "Your Solution",
        duration: "15 sec",
        icon: Sparkles,
        placeholder: "Introduce your product/service. What makes it unique?",
        tips: ["Focus on key differentiator", "Show, don't tell", "Use analogies"],
      },
      {
        id: "traction",
        title: "Traction/Proof",
        duration: "10 sec",
        icon: TrendingUp,
        placeholder: "Share your key metrics, customers, or achievements.",
        tips: ["Lead with your best number", "Show growth trajectory", "Name-drop if relevant"],
      },
      {
        id: "ask",
        title: "The Ask",
        duration: "15 sec",
        icon: DollarSign,
        placeholder: "What are you raising? What will you do with it?",
        tips: ["Be specific about amount", "Tie to milestones", "End with confidence"],
      },
    ],
  },
  {
    id: "demo-3min",
    name: "3-Minute Demo",
    duration: "3 minutes",
    description: "Full product demo with context for demo days",
    color: "from-purple-500 to-pink-600",
    sections: [
      {
        id: "intro",
        title: "Introduction",
        duration: "20 sec",
        icon: Users,
        placeholder: "Introduce yourself and your company in one breath.",
        tips: ["Name, title, company", "One-line description", "Set the stage"],
      },
      {
        id: "problem",
        title: "Problem Statement",
        duration: "30 sec",
        icon: Target,
        placeholder: "Deep dive into the problem. Use a customer story or scenario.",
        tips: ["Tell a specific story", "Make it emotional", "Show the status quo"],
      },
      {
        id: "solution",
        title: "Solution Overview",
        duration: "20 sec",
        icon: Lightbulb,
        placeholder: "High-level explanation before the demo.",
        tips: ["Bridge problem to demo", "Set expectations", "Build anticipation"],
      },
      {
        id: "demo",
        title: "Product Demo",
        duration: "60 sec",
        icon: Play,
        placeholder: "Walk through 2-3 key features. Show the 'aha' moments.",
        tips: ["Rehearse transitions", "Highlight key moments", "Keep it flowing"],
      },
      {
        id: "results",
        title: "Results & Traction",
        duration: "25 sec",
        icon: BarChart3,
        placeholder: "Share metrics, testimonials, and growth.",
        tips: ["Show before/after", "Use customer quotes", "Visualize growth"],
      },
      {
        id: "market",
        title: "Market Opportunity",
        duration: "15 sec",
        icon: TrendingUp,
        placeholder: "Size of the opportunity. Why now?",
        tips: ["TAM/SAM/SOM", "Industry trends", "Timing factors"],
      },
      {
        id: "ask",
        title: "The Ask",
        duration: "10 sec",
        icon: DollarSign,
        placeholder: "Clear ask with next steps.",
        tips: ["Amount and use", "Timeline", "How to follow up"],
      },
    ],
  },
  {
    id: "investor-5min",
    name: "5-Minute Investor Pitch",
    duration: "5 minutes",
    description: "Comprehensive pitch for serious investor meetings",
    color: "from-orange-500 to-red-600",
    sections: [
      {
        id: "hook",
        title: "Opening Hook",
        duration: "30 sec",
        icon: Lightbulb,
        placeholder: "Start with a powerful hook that establishes credibility and interest.",
        tips: ["Lead with a bold claim", "Use your best traction metric", "Tell a founder story"],
      },
      {
        id: "problem",
        title: "Problem Deep Dive",
        duration: "45 sec",
        icon: Target,
        placeholder: "Comprehensive problem analysis with market context.",
        tips: ["Industry-specific pain", "Cost of status quo", "Why existing solutions fail"],
      },
      {
        id: "solution",
        title: "Solution & Product",
        duration: "60 sec",
        icon: Sparkles,
        placeholder: "Detailed explanation of your solution and key features.",
        tips: ["Core value proposition", "Key differentiators", "Technology advantage"],
      },
      {
        id: "demo",
        title: "Demo/Proof",
        duration: "45 sec",
        icon: Play,
        placeholder: "Show the product in action or share case studies.",
        tips: ["Focus on 'wow' moments", "Customer success stories", "Show real data"],
      },
      {
        id: "market",
        title: "Market Analysis",
        duration: "30 sec",
        icon: BarChart3,
        placeholder: "TAM, SAM, SOM with clear methodology.",
        tips: ["Bottom-up analysis", "Growth projections", "Beachhead strategy"],
      },
      {
        id: "business",
        title: "Business Model",
        duration: "30 sec",
        icon: DollarSign,
        placeholder: "How you make money. Unit economics.",
        tips: ["Revenue model", "LTV/CAC", "Path to profitability"],
      },
      {
        id: "traction",
        title: "Traction & Metrics",
        duration: "30 sec",
        icon: TrendingUp,
        placeholder: "Key metrics that prove product-market fit.",
        tips: ["MRR/ARR growth", "Engagement metrics", "Customer testimonials"],
      },
      {
        id: "team",
        title: "Team",
        duration: "20 sec",
        icon: Users,
        placeholder: "Why your team is uniquely positioned to win.",
        tips: ["Relevant experience", "Unique insights", "Key hires planned"],
      },
      {
        id: "ask",
        title: "Ask & Use of Funds",
        duration: "30 sec",
        icon: DollarSign,
        placeholder: "Specific ask with clear milestones.",
        tips: ["Raise amount", "18-month milestones", "Key hires and goals"],
      },
    ],
  },
];

const TIPS = [
  { icon: Camera, title: "Lighting", desc: "Face a window or use a ring light. Avoid backlighting." },
  { icon: Mic, title: "Audio", desc: "Use an external mic. Record in a quiet room." },
  { icon: Clock, title: "Pacing", desc: "Speak slightly slower than normal. Pause between sections." },
  { icon: Play, title: "Energy", desc: "Start with high energy. Smile and make eye contact with the camera." },
];

export default function PitchVideo() {
  const { startupId, videoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState<PitchVideo | null>(null);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [script, setScript] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof SCRIPT_TEMPLATES[0] | null>(null);
  const [scriptSections, setScriptSections] = useState<Record<string, string>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (videoId === "new") {
      setTitle("New Pitch Video");
      setVideoUrl("");
      setScript("");
      setLoading(false);
      setTemplateDialogOpen(true); // Auto-open template picker
    } else {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    if (!videoId || videoId === "new") return;

    const { data, error } = await supabase
      .from("pitch_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load pitch video",
        variant: "destructive",
      });
      navigate(`/startups/${startupId}`);
      return;
    }

    setVideo(data);
    setTitle(data.title);
    setVideoUrl(data.video_url || "");
    setScript(data.script || "");
    setLoading(false);
  };

  const handleSave = async () => {
    if (!startupId) return;

    setSaving(true);

    // Compile script from sections if using template
    let finalScript = script;
    if (selectedTemplate && Object.keys(scriptSections).length > 0) {
      finalScript = selectedTemplate.sections
        .map(section => `## ${section.title} (${section.duration})\n${scriptSections[section.id] || ""}\n`)
        .join("\n");
    }

    const videoData = {
      startup_id: startupId,
      title,
      video_url: videoUrl || null,
      script: finalScript || null,
    };

    let result;
    if (videoId === "new") {
      result = await supabase.from("pitch_videos").insert(videoData).select().single();
    } else {
      result = await supabase.from("pitch_videos").update(videoData).eq("id", videoId).select().single();
    }

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to save pitch video",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pitch video saved successfully",
      });
      if (videoId === "new" && result.data) {
        navigate(`/startups/${startupId}/pitch-video/${result.data.id}`, { replace: true });
      }
    }

    setSaving(false);
  };

  const applyTemplate = (template: typeof SCRIPT_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setScriptSections({});
    setTemplateDialogOpen(false);
    toast({
      title: "Template Selected",
      description: `${template.name} - ${template.duration}`,
    });
  };

  const copySection = (sectionId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getTotalWords = () => {
    return Object.values(scriptSections).join(" ").split(/\s+/).filter(w => w).length;
  };

  const getEstimatedDuration = () => {
    const words = getTotalWords();
    const minutes = Math.floor(words / 150);
    const seconds = Math.round((words % 150) / 2.5);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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
              startIcon={<FileText className="w-4 h-4" />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Templates
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
          {/* Video Preview */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              <Paper elevation={0} className="rounded-xl border border-border p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Video Preview
                </Typography>

                {videoUrl ? (
                  <Box className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
                    <iframe
                      src={videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title="Pitch Video"
                    />
                  </Box>
                ) : (
                  <Box className="aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center mb-4">
                    <Video className="w-16 h-16 text-white/40 mb-3" />
                    <Typography variant="body2" className="text-white/60">
                      Add a video URL below
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="Video URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  fullWidth
                  placeholder="https://www.youtube.com/watch?v=..."
                  helperText="Paste a YouTube, Vimeo, or Loom URL"
                />
              </Paper>

              {/* Recording Tips */}
              <Paper elevation={0} className="rounded-xl border border-border p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Recording Tips
                </Typography>
                <Grid container spacing={2}>
                  {TIPS.map((tip) => (
                    <Grid size={{ xs: 6 }} key={tip.title}>
                      <Box className="flex items-start gap-3">
                        <Box className="p-2 rounded-lg bg-primary/10">
                          <tip.icon className="w-5 h-5 text-primary" />
                        </Box>
                        <Box>
                          <Typography variant="body2" className="font-medium">
                            {tip.title}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            {tip.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Script Editor */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper elevation={0} className="rounded-xl border border-border p-6">
              <Box className="flex items-center justify-between mb-4">
                <Box>
                  <Typography variant="h6" className="font-semibold">
                    Script Builder
                  </Typography>
                  {selectedTemplate && (
                    <Chip 
                      label={`${selectedTemplate.name} • ${selectedTemplate.duration}`}
                      size="small"
                      className="mt-1"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                {selectedTemplate && (
                  <Box className="text-right">
                    <Typography variant="body2" className="text-muted-foreground">
                      ~{getEstimatedDuration()} ({getTotalWords()} words)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (getTotalWords() / 750) * 100)} 
                      className="mt-1 w-32"
                    />
                  </Box>
                )}
              </Box>

              {selectedTemplate ? (
                <Stack spacing={2}>
                  {selectedTemplate.sections.map((section, index) => (
                    <Accordion key={section.id} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ChevronDown className="w-5 h-5" />}>
                        <Box className="flex items-center gap-3">
                          <Box className="p-2 rounded-lg bg-primary/10">
                            <section.icon className="w-5 h-5 text-primary" />
                          </Box>
                          <Box>
                            <Typography className="font-medium">
                              {section.title}
                            </Typography>
                            <Typography variant="caption" className="text-muted-foreground">
                              {section.duration}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box className="mb-3 p-3 rounded-lg bg-secondary/50">
                          <Typography variant="caption" className="text-muted-foreground font-medium">
                            Tips:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" className="mt-1">
                            {section.tips.map((tip, i) => (
                              <Chip key={i} label={tip} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        </Box>
                        <TextField
                          value={scriptSections[section.id] || ""}
                          onChange={(e) => setScriptSections({
                            ...scriptSections,
                            [section.id]: e.target.value,
                          })}
                          placeholder={section.placeholder}
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                        />
                        <Box className="flex justify-end mt-2">
                          <Button
                            size="small"
                            startIcon={copiedSection === section.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            onClick={() => copySection(section.id, scriptSections[section.id] || "")}
                            disabled={!scriptSections[section.id]}
                          >
                            {copiedSection === section.id ? "Copied!" : "Copy"}
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              ) : (
                <Box className="text-center py-12">
                  <Box className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-primary" />
                  </Box>
                  <Typography variant="h6" className="font-semibold mb-2">
                    Choose a Script Template
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start with a proven script structure to craft a compelling pitch video.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Sparkles className="w-5 h-5" />}
                    onClick={() => setTemplateDialogOpen(true)}
                  >
                    Choose Template
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Template Selection Dialog */}
        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <Typography variant="h6">Choose Script Template</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} className="mt-1">
              {SCRIPT_TEMPLATES.map((template) => (
                <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
                  <Card
                    onClick={() => applyTemplate(template)}
                    className={`cursor-pointer hover:shadow-lg transition-all h-full ${
                      selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                    }`}
                    variant="outlined"
                  >
                    <Box className={`h-20 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                      <Box className="text-center text-white">
                        <Clock className="w-8 h-8 mx-auto mb-1" />
                        <Typography variant="body2" className="font-bold">
                          {template.duration}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" className="font-semibold">
                        {template.name}
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground mb-3">
                        {template.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {template.sections.slice(0, 4).map((section) => (
                          <Chip key={section.id} label={section.title} size="small" variant="outlined" />
                        ))}
                        {template.sections.length > 4 && (
                          <Chip label={`+${template.sections.length - 4} more`} size="small" />
                        )}
                      </Stack>
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

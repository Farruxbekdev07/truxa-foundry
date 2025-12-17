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
} from "@mui/material";
import {
  Save,
  ArrowLeft,
  Video,
  FileText,
  Upload,
  Play,
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

const SCRIPT_TEMPLATES = [
  {
    name: "60-Second Pitch",
    sections: ["Hook (10s)", "Problem (10s)", "Solution (15s)", "Traction (10s)", "Ask (15s)"],
  },
  {
    name: "3-Minute Demo",
    sections: ["Introduction (30s)", "Problem (30s)", "Solution Demo (60s)", "Team (20s)", "Market (20s)", "Ask (20s)"],
  },
  {
    name: "5-Minute Full Pitch",
    sections: ["Hook (20s)", "Problem (40s)", "Solution (60s)", "Product Demo (60s)", "Market Size (30s)", "Business Model (30s)", "Team (30s)", "Traction (30s)", "Ask (30s)"],
  },
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

  useEffect(() => {
    if (videoId === "new") {
      setTitle("New Pitch Video");
      setVideoUrl("");
      setScript("");
      setLoading(false);
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

    const videoData = {
      startup_id: startupId,
      title,
      video_url: videoUrl || null,
      script: script || null,
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
    const scriptContent = template.sections
      .map((section) => `## ${section}\n\n[Your content here]\n`)
      .join("\n");
    setScript(scriptContent);
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
          <Button
            variant="contained"
            startIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Video Preview */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper elevation={0} className="rounded-xl border border-border p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Video
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
                <Box className="aspect-video rounded-lg bg-secondary flex flex-col items-center justify-center mb-4">
                  <Video className="w-12 h-12 text-muted-foreground mb-3" />
                  <Typography variant="body2" className="text-muted-foreground">
                    No video uploaded yet
                  </Typography>
                </Box>
              )}

              <TextField
                label="Video URL (YouTube, Vimeo, etc.)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                fullWidth
                placeholder="https://www.youtube.com/watch?v=..."
                helperText="Paste a YouTube or Vimeo URL"
              />
            </Paper>
          </Grid>

          {/* Script Editor */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper elevation={0} className="rounded-xl border border-border p-6">
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  Script
                </Typography>
                <Box className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Typography variant="caption" className="text-muted-foreground">
                    {script.length} characters
                  </Typography>
                </Box>
              </Box>

              <Box className="mb-4">
                <Typography variant="caption" className="text-muted-foreground block mb-2">
                  Quick Templates:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {SCRIPT_TEMPLATES.map((template) => (
                    <Button
                      key={template.name}
                      size="small"
                      variant="outlined"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <TextField
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write your pitch script here...

## Hook (10 seconds)
Grab attention with a compelling opening statement or question.

## Problem (20 seconds)
Describe the problem you're solving.

## Solution (30 seconds)
Explain your unique solution..."
                multiline
                rows={16}
                fullWidth
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Tips Section */}
        <Paper elevation={0} className="rounded-xl border border-border p-6 mt-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Tips for a Great Pitch Video
          </Typography>
          <Grid container spacing={3}>
            {[
              { icon: Play, title: "Keep it Short", desc: "Aim for 60-90 seconds for initial outreach" },
              { icon: Video, title: "Good Lighting", desc: "Natural light or ring light works best" },
              { icon: FileText, title: "Practice Your Script", desc: "Sound natural, not robotic" },
              { icon: Upload, title: "High Quality", desc: "1080p minimum, clear audio" },
            ].map((tip) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tip.title}>
                <Card variant="outlined" className="h-full">
                  <CardContent>
                    <tip.icon className="w-8 h-8 text-primary mb-2" />
                    <Typography variant="body2" className="font-medium">
                      {tip.title}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {tip.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

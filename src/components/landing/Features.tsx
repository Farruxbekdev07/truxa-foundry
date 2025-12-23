import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import { Brain, TrendingUp, Target, LineChart, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Get instant, intelligent feedback on your startup idea based on market data and startup success patterns.",
  },
  {
    icon: Target,
    title: "Product-Market Fit Score",
    description:
      "Understand how well your product matches market demand with a clear, actionable PMF score.",
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description:
      "Receive personalized growth recommendations with immediate actions and long-term milestones.",
  },
  {
    icon: LineChart,
    title: "Market Insights",
    description:
      "Discover market opportunities, competitive positioning, and potential challenges before launch.",
  },
  {
    icon: Users,
    title: "Team Building Guidance",
    description:
      "Know exactly what roles and resources you need to scale effectively.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "No waiting. Submit your startup profile and receive comprehensive analysis in seconds.",
  },
];

export function Features() {
  return (
    <Box component="section" className="py-24 bg-card" id="features">
      <Container maxWidth="lg">
        <Box className="text-center mb-16">
          <Typography
            variant="overline"
            className="text-primary font-semibold tracking-wider mb-2 block"
          >
            FEATURES
          </Typography>
          <Typography
            variant="h2"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Everything You Need to{" "}
            <span className="text-gradient">Validate Smart</span>
          </Typography>
          <Box className="flex justify-center mt-4">
            <Typography
              variant="h6"
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Our AI analyzes your startup profile against thousands of data
              points to give you actionable insights for success.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} className="max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feature.title}>
              <Paper
                elevation={0}
                className="group h-full p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                sx={{ animationDelay: `${index * 0.1}s` }}
              >
                <Box className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-muted-foreground leading-relaxed"
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

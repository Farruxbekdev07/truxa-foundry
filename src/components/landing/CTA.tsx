import { Link } from "react-router-dom";
import { Box, Button, Container, Typography, Stack } from "@mui/material";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <Box component="section" className="py-24 relative overflow-hidden">
      <Box className="absolute inset-0 bg-gradient-hero" />
      <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
      <Box className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent)]" />

      <Container maxWidth="md" className="relative z-10">
        <Box className="text-center">
          <Box className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
            <Typography variant="body2" className="text-white font-medium">
              No credit card required
            </Typography>
          </Box>

          <Typography
            variant="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-primary-foreground"
          >
            Ready to Validate Your
            <br />
            Startup Idea?
          </Typography>
          <Box className="flex justify-center mt-4 mb-4">
            <Typography
              variant="h6"
              className="text-lg sm:text-xl mb-10 text-primary-foreground/80 max-w-xl mx-auto"
            >
              Join thousands of founders who use AI-powered insights to build
              startups that succeed.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              size="large"
              endIcon={<ArrowRight className="w-5 h-5" />}
              sx={{
                backgroundColor: "white",
                color: "hsl(220, 70%, 25%)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.9)",
                },
                height: 56,
                px: 5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Start Validating — Free
            </Button>
            <Button
              component={Link}
              to="/auth?mode=login"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "white",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.5)",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
                height: 56,
                px: 5,
                fontSize: "1rem",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

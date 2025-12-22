import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';
import { ArrowRight, Sparkles, BarChart3, Target, Shield } from 'lucide-react';

const metrics = [
  { icon: Sparkles, label: 'AI-Powered Analysis', value: '100%' },
  { icon: BarChart3, label: 'Validation Score', value: 'Real-time' },
  { icon: Target, label: 'Market Fit', value: 'Instant' },
  { icon: Shield, label: 'Data Secure', value: 'Always' },
];

export function Hero() {
  return (
    <Box
      component="section"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <Box className="absolute inset-0 bg-gradient-subtle" />
      <Box className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <Box
        className="absolute bottom-20 right-10 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse-soft"
        sx={{ animationDelay: '1s' }}
      />
      {/* Grid pattern overlay */}
      <Box 
        className="absolute inset-0 opacity-[0.02]"
        sx={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <Container maxWidth="lg" className="relative z-10 py-20">
        <Box className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Paper
            elevation={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-8 animate-fade-in border border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <Typography variant="body2" className="text-primary font-semibold">
              AI-Powered Startup Validation Platform
            </Typography>
          </Paper>

          {/* Headline */}
          <Typography
            variant="h1"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up"
          >
            Validate Your Startup Idea
            <br />
            <span className="text-gradient">Before You Build</span>
          </Typography>

          {/* Subheadline */}
          <Typography
            variant="h6"
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up font-normal leading-relaxed"
            sx={{ animationDelay: '0.1s' }}
          >
            Get instant AI-powered feedback on your startup's product-market fit, 
            growth strategy, and competitive positioning. Make data-driven decisions from day one.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            className="mb-16 animate-slide-up"
            sx={{ animationDelay: '0.2s' }}
          >
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              size="large"
              endIcon={<ArrowRight className="w-5 h-5" />}
              sx={{
                height: 56,
                px: 5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Start Validating — Free
            </Button>
            <Button
              component={Link}
              to="/#how-it-works"
              variant="outlined"
              size="large"
              sx={{
                height: 56,
                px: 5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              See How It Works
            </Button>
          </Stack>

          {/* Metrics */}
          <Box
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto animate-fade-in"
            sx={{ animationDelay: '0.3s' }}
          >
            {metrics.map((metric) => (
              <Paper
                key={metric.label}
                elevation={0}
                className="text-center p-5 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <Box className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <metric.icon className="w-5 h-5 text-primary" />
                </Box>
                <Typography variant="h6" className="font-bold text-foreground mb-0.5">
                  {metric.value}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {metric.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
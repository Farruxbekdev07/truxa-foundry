import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';
import { ArrowRight, Rocket, Users, TrendingUp, Code } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Founders', value: '2,500+' },
  { icon: TrendingUp, label: 'Investors', value: '500+' },
  { icon: Rocket, label: 'Startups', value: '1,200+' },
  { icon: Code, label: 'Developers', value: '3,000+' },
];

export function Hero() {
  return (
    <Box
      component="section"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <Box className="absolute inset-0 bg-gradient-subtle" />
      <Box className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <Box
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft"
        sx={{ animationDelay: '1s' }}
      />

      <Container maxWidth="lg" className="relative z-10 py-20">
        <Box className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Paper
            elevation={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-8 animate-fade-in"
          >
            <Rocket className="w-4 h-4 text-primary" />
            <Typography variant="body2" className="text-primary font-medium">
              Building the future of startups
            </Typography>
          </Paper>

          {/* Headline */}
          <Typography
            variant="h1"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up"
          >
            Connect{' '}
            <span className="text-gradient">Founders, Investors,</span>
            <br />
            <span className="text-gradient">Mentors & Developers</span>
            <br />
            in One Platform
          </Typography>

          {/* Subheadline */}
          <Typography
            variant="h6"
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up font-normal"
            sx={{ animationDelay: '0.1s' }}
          >
            The all-in-one ecosystem where startup dreams meet the right people.
            Find mentors, attract investors, build your team, and scale your vision.
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
              className="h-14 px-10 text-lg"
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              to="/auth?mode=login"
              variant="outlined"
              size="large"
              color="primary"
              className="h-14 px-10 text-lg border-2"
            >
              Sign In
            </Button>
          </Stack>

          {/* Stats */}
          <Box
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto animate-fade-in"
            sx={{ animationDelay: '0.3s' }}
          >
            {stats.map((stat) => (
              <Paper
                key={stat.label}
                elevation={0}
                className="text-center p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <Typography variant="h5" className="font-bold text-foreground">
                  {stat.value}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

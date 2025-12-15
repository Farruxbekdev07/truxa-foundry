import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { Lightbulb, Handshake, Target, Zap, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Lightbulb,
    title: 'Showcase Your Startup',
    description: 'Create a compelling profile for your startup and attract the attention of investors and mentors.',
  },
  {
    icon: Handshake,
    title: 'Connect with Mentors',
    description: 'Find experienced entrepreneurs and industry experts ready to guide your journey.',
  },
  {
    icon: Target,
    title: 'Attract Investors',
    description: 'Get discovered by investors actively looking for the next big opportunity.',
  },
  {
    icon: Zap,
    title: 'Build Your Team',
    description: 'Connect with talented developers eager to join innovative startup projects.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security and privacy controls.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access a worldwide community of startup enthusiasts and industry professionals.',
  },
];

export function Features() {
  return (
    <Box component="section" className="py-24 bg-card">
      <Container maxWidth="lg">
        <Box className="text-center mb-16">
          <Typography variant="h2" className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Succeed</span>
          </Typography>
          <Typography
            variant="body1"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our platform provides all the tools and connections you need to take your startup from idea to success.
          </Typography>
        </Box>

        <Grid container spacing={4} className="max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feature.title}>
              <Paper
                elevation={0}
                className="group h-full p-6 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                sx={{ animationDelay: `${index * 0.1}s` }}
              >
                <Box className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
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

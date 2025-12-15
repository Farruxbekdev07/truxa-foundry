import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Rocket, TrendingUp, GraduationCap, Code, ArrowRight, Circle } from 'lucide-react';
import { roleColors } from '@/theme/muiTheme';

const roles = [
  {
    icon: Rocket,
    title: 'Founders',
    colorKey: 'founder' as const,
    description: 'Showcase your startup, find co-founders, and connect with investors and mentors who believe in your vision.',
    features: ['Create startup profiles', 'Connect with investors', 'Find mentors'],
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    colorKey: 'investor' as const,
    description: 'Discover promising startups, access detailed metrics, and connect directly with founders.',
    features: ['Browse startups', 'View ratings & metrics', 'Direct founder access'],
  },
  {
    icon: GraduationCap,
    title: 'Mentors',
    colorKey: 'mentor' as const,
    description: 'Share your expertise, guide the next generation of entrepreneurs, and give back to the ecosystem.',
    features: ['Mentor matching', 'Startup guidance', 'Build your legacy'],
  },
  {
    icon: Code,
    title: 'Developers',
    colorKey: 'developer' as const,
    description: 'Join innovative startups, work on cutting-edge projects, and grow your career in the startup world.',
    features: ['Find startup jobs', 'Join early-stage teams', 'Equity opportunities'],
  },
];

export function RoleCards() {
  return (
    <Box component="section" className="py-24 bg-gradient-subtle">
      <Container maxWidth="lg">
        <Box className="text-center mb-16">
          <Typography variant="h2" className="text-3xl sm:text-4xl font-bold mb-4">
            Built for{' '}
            <span className="text-gradient">Every Role</span>
          </Typography>
          <Typography
            variant="body1"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Whether you're building, investing, mentoring, or coding — there's a place for you here.
          </Typography>
        </Box>

        <Grid container spacing={3} className="max-w-5xl mx-auto">
          {roles.map((role) => {
            const color = roleColors[role.colorKey];
            
            return (
              <Grid size={{ xs: 12, md: 6 }} key={role.title}>
                <Paper
                  elevation={0}
                  className="group h-full p-8 rounded-2xl bg-card border border-border/50 hover:shadow-xl transition-all duration-300"
                >
                  <Box
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    sx={{ backgroundColor: `${color}20` }}
                  >
                    <role.icon className="w-7 h-7" style={{ color }} />
                  </Box>

                  <Typography variant="h5" className="font-bold mb-3">
                    {role.title}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground mb-6">
                    {role.description}
                  </Typography>

                  <List dense disablePadding className="mb-6">
                    {role.features.map((feature) => (
                      <ListItem key={feature} disablePadding className="py-1">
                        <ListItemIcon className="min-w-0 mr-2">
                          <Circle
                            className="w-1.5 h-1.5"
                            style={{ color, fill: color }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    component={Link}
                    to={`/auth?role=${role.title.toLowerCase().slice(0, -1)}`}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    Join as {role.title.slice(0, -1)}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

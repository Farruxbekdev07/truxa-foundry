import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Rocket, TrendingUp, GraduationCap, Code, ArrowRight, CheckCircle } from 'lucide-react';
import { roleColors } from '@/theme/muiTheme';

const roles = [
  {
    icon: Rocket,
    title: 'Founders',
    colorKey: 'founder' as const,
    description: 'Validate your startup idea with AI-powered insights and connect with the right people to scale.',
    features: ['AI startup validation', 'PMF scoring', 'Growth recommendations', 'Investor connections'],
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    colorKey: 'investor' as const,
    description: 'Discover data-validated startups with clear metrics and direct access to founders.',
    features: ['Pre-validated startups', 'AI-scored opportunities', 'Direct founder access', 'Due diligence insights'],
  },
  {
    icon: GraduationCap,
    title: 'Mentors',
    colorKey: 'mentor' as const,
    description: 'Guide startups with AI-supported insights and make a lasting impact on the ecosystem.',
    features: ['Matched mentoring', 'AI-backed guidance', 'Track impact', 'Build legacy'],
  },
  {
    icon: Code,
    title: 'Developers',
    colorKey: 'developer' as const,
    description: 'Join validated startups at the right stage and grow your career with equity opportunities.',
    features: ['Validated startups only', 'Clear growth stage', 'Equity opportunities', 'Tech-first teams'],
  },
];

export function RoleCards() {
  return (
    <Box component="section" className="py-24 bg-card" id="roles">
      <Container maxWidth="lg">
        <Box className="text-center mb-16">
          <Typography 
            variant="overline" 
            className="text-primary font-semibold tracking-wider mb-2 block"
          >
            FOR EVERYONE
          </Typography>
          <Typography variant="h2" className="text-3xl sm:text-4xl font-bold mb-4">
            Built for{' '}
            <span className="text-gradient">Every Role</span>
          </Typography>
          <Typography
            variant="body1"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Whether you're building, investing, mentoring, or coding — Truxa Foundry has the tools you need.
          </Typography>
        </Box>

        <Grid container spacing={3} className="max-w-5xl mx-auto">
          {roles.map((role) => {
            const color = roleColors[role.colorKey];
            
            return (
              <Grid size={{ xs: 12, md: 6 }} key={role.title}>
                <Paper
                  elevation={0}
                  className="group h-full p-8 rounded-2xl bg-background border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <Box
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    sx={{ backgroundColor: `${color}15` }}
                  >
                    <role.icon className="w-7 h-7" style={{ color }} />
                  </Box>

                  <Typography variant="h5" className="font-bold mb-3">
                    {role.title}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground mb-6 leading-relaxed">
                    {role.description}
                  </Typography>

                  <List dense disablePadding className="mb-6">
                    {role.features.map((feature) => (
                      <ListItem key={feature} disablePadding className="py-1">
                        <ListItemIcon className="min-w-0 mr-2">
                          <CheckCircle
                            className="w-4 h-4"
                            style={{ color }}
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
                    sx={{ 
                      color, 
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: `${color}10` }
                    }}
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
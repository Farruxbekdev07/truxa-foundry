import { Box, Container, Typography, Paper } from '@mui/material';
import { UserPlus, FileText, Sparkles, BarChart3 } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up for free in seconds. No credit card required to get started.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Complete Startup Profile',
    description: 'Tell us about your startup, target market, problem you\'re solving, and your solution.',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'AI Analysis',
    description: 'Our AI instantly analyzes your profile against market data and success patterns.',
  },
  {
    step: '04',
    icon: BarChart3,
    title: 'Get Actionable Insights',
    description: 'Receive your PMF score, growth strategy, and specific recommendations to improve.',
  },
];

export function HowItWorks() {
  return (
    <Box component="section" className="py-24 bg-gradient-subtle" id="how-it-works">
      <Container maxWidth="lg">
        <Box className="text-center mb-16">
          <Typography 
            variant="overline" 
            className="text-primary font-semibold tracking-wider mb-2 block"
          >
            HOW IT WORKS
          </Typography>
          <Typography variant="h2" className="text-3xl sm:text-4xl font-bold mb-4">
            From Idea to{' '}
            <span className="text-gradient">Validated Startup</span>
          </Typography>
          <Typography
            variant="body1"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get from signup to actionable AI insights in under 5 minutes.
          </Typography>
        </Box>

        <Box className="max-w-4xl mx-auto relative">
          {/* Connection line */}
          <Box className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
          
          <Box className="space-y-8">
            {steps.map((step, index) => (
              <Box 
                key={step.step}
                className={`flex items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <Paper
                  elevation={0}
                  className="flex-1 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <Box className="flex items-start gap-4">
                    <Box className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </Box>
                    <Box>
                      <Typography variant="overline" className="text-primary font-bold">
                        STEP {step.step}
                      </Typography>
                      <Typography variant="h6" className="font-semibold mb-1">
                        {step.title}
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                {/* Center dot */}
                <Box className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md flex-shrink-0 z-10" />
                
                <Box className="hidden md:block flex-1" />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
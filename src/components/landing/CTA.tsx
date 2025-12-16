import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <Box component="section" className="py-24 relative overflow-hidden">
      <Box className="absolute inset-0 bg-gradient-hero opacity-95" />
      <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />

      <Container maxWidth="md" className="relative z-10">
        <Box className="text-center">
          <Typography
            variant="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white"
          >
            Ready to Join the Ecosystem?
          </Typography>
          <Typography
            variant="body1"
            className="text-lg sm:text-xl mb-10 text-white/80"
          >
            Start connecting with founders, investors, mentors, and developers today.
            Your next big opportunity is just a click away.
          </Typography>
          <Stack direction="row" justifyContent="center">
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              size="large"
              endIcon={<ArrowRight className="w-5 h-5" />}
              sx={{
                backgroundColor: 'white',
                color: 'hsl(172, 66%, 30%)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                height: 56,
                px: 5,
                fontSize: '1rem',
              }}
            >
              Create Free Account
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

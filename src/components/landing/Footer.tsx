import { Link } from 'react-router-dom';
import { Box, Container, Typography, Stack } from '@mui/material';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <Box component="footer" className="py-12 bg-background border-t border-border/50">
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={3}
        >
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            className="flex items-center gap-2 no-underline text-inherit"
          >
            <Box className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </Box>
            <Typography variant="h6" className="font-bold">
              Truxa Foundry
            </Typography>
          </Box>

          {/* Copyright */}
          <Typography variant="body2" className="text-muted-foreground">
            © {new Date().getFullYear()} Truxa Foundry. All rights reserved.
          </Typography>

          {/* Links */}
          <Stack direction="row" spacing={3}>
            <Typography
              component={Link}
              to="/privacy"
              variant="body2"
              className="text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              Privacy
            </Typography>
            <Typography
              component={Link}
              to="/terms"
              variant="body2"
              className="text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              Terms
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
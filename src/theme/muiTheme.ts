import { createTheme, ThemeOptions } from '@mui/material/styles';

// Extract HSL values from CSS custom properties
const getHSLColor = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;

// Light theme colors (matching index.css)
const lightPalette = {
  primary: {
    main: getHSLColor(172, 66, 30),
    light: getHSLColor(172, 66, 40),
    dark: getHSLColor(172, 66, 20),
    contrastText: '#ffffff',
  },
  secondary: {
    main: getHSLColor(215, 15, 94),
    light: getHSLColor(215, 15, 97),
    dark: getHSLColor(215, 15, 85),
    contrastText: getHSLColor(215, 25, 25),
  },
  error: {
    main: getHSLColor(0, 72, 51),
    contrastText: '#ffffff',
  },
  warning: {
    main: getHSLColor(28, 87, 55),
    contrastText: '#ffffff',
  },
  info: {
    main: getHSLColor(221, 83, 53),
    contrastText: '#ffffff',
  },
  success: {
    main: getHSLColor(172, 66, 30),
    contrastText: '#ffffff',
  },
  background: {
    default: getHSLColor(210, 20, 98),
    paper: '#ffffff',
  },
  text: {
    primary: getHSLColor(215, 25, 15),
    secondary: getHSLColor(215, 15, 45),
  },
  divider: getHSLColor(215, 20, 88),
};

// Role colors
export const roleColors = {
  founder: getHSLColor(172, 66, 30),
  investor: getHSLColor(262, 52, 47),
  mentor: getHSLColor(28, 87, 55),
  developer: getHSLColor(221, 83, 53),
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...lightPalette,
  },
  typography: {
    fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          padding: '0.625rem 1.25rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, hsl(172, 66%, 30%) 0%, hsl(200, 60%, 35%) 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, hsl(172, 66%, 25%) 0%, hsl(200, 60%, 30%) 100%)',
            transform: 'scale(1.02)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        sizeLarge: {
          padding: '0.875rem 2rem',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: `1px solid ${getHSLColor(215, 20, 88)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${getHSLColor(215, 20, 88)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${getHSLColor(215, 20, 88)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 500,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          '&.Mui-selected': {
            backgroundColor: 'rgba(20, 110, 100, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(20, 110, 100, 0.15)',
            },
          },
        },
      },
    },
  },
};

export const muiTheme = createTheme(themeOptions);

/**
 * Theme Configuration
 * Defines colors, spacing, shadows, and typography settings for the application
 * Structure inspired by:
 * - Material UI Theme: https://mui.com/material-ui/customization/theming/
 * - Tailwind CSS: https://tailwindcss.com/docs/theme
 * - Chakra UI: https://chakra-ui.com/docs/styled-system/theme
 */

const theme = {
  colors: {
    primary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2ecc71',
      light: '#58d68d',
      dark: '#27ae60',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#f39c12',
      light: '#f8c471',
      dark: '#d68910',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2ecc71',
      light: '#58d68d',
      dark: '#27ae60',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f39c12',
      light: '#f8c471',
      dark: '#d68910',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#7f8c8d',
      disabled: '#bdc3c7',
    },
    background: {
      default: '#f5f8fa',
      paper: '#ffffff',
      dark: '#34495e',
      hover: '#f8fafc',
    },
    border: {
      light: '#e0e0e0',
      main: '#bdc3c7',
      dark: '#95a5a6',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      md: '1rem',        // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
  },
  spacing: {
    unit: 8,
    xs: '0.25rem',      // 4px
    sm: '0.5rem',       // 8px
    md: '1rem',         // 16px
    lg: '1.5rem',       // 24px
    xl: '2rem',         // 32px
    '2xl': '3rem',      // 48px
    '3xl': '4rem',      // 64px
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.04)',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  transitions: {
    quick: '150ms ease',
    default: '300ms ease',
    slow: '500ms ease',
  },
  zIndex: {
    modal: 1000,
    dropdown: 100,
    header: 50,
  },
};

export default theme; 
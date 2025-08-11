import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { initializeLogging, Log } from './utils/logger';
import UrlShortenerPage from './pages/UrlShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function Navigation() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleNavigation = async (path, pageName) => {
    await Log("frontend", "info", "component", `Navigating to ${pageName}`);
    navigate(path);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigation('/', 'home')}>
                Create URLs
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/statistics', 'statistics')}>
                Statistics
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              color="inherit" 
              onClick={() => handleNavigation('/', 'home')}
            >
              CREATE URLS
            </Button>
            <Button 
              color="inherit" 
              onClick={() => handleNavigation('/statistics', 'statistics')}
            >
              STATISTICS
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const [loggingReady, setLoggingReady] = useState(false);

  useEffect(() => {
    async function setupLogging() {
      const success = await initializeLogging();
      setLoggingReady(success);
      
      if (success) {
        await Log("frontend", "info", "component", "App initialized successfully");
      }
    }
    
    setupLogging();
  }, []);

  if (!loggingReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography>Initializing application...</Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<UrlShortenerPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/:shortcode" element={<RedirectHandler />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
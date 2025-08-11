import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Log } from '../utils/logger';
import UrlForm from '../components/UrlForm';

function UrlShortenerPage() {
  useEffect(() => {
    const logPageLoad = async () => {
      await Log("frontend", "info", "page", "URL Shortener page loaded");
    };
    logPageLoad();
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Create up to 5 shortened URLs at once
      </Typography>
      <UrlForm />
    </Box>
  );
}

export default UrlShortenerPage;
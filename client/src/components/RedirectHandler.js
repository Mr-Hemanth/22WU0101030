import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Log } from '../utils/logger';
import urlService from '../services/urlService';

function RedirectHandler() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading'); // loading, redirecting, expired, notfound
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleRedirect = async () => {
      await Log("frontend", "info", "component", `Redirect requested: ${shortcode}`);
      
      try {
        // Get referrer information
        const referrer = document.referrer || 'Direct';
        
        // Record click and get original URL
        const originalUrl = await urlService.recordClick(shortcode, referrer);
        
        if (originalUrl) {
          setStatus('redirecting');
          await Log("frontend", "info", "component", `Redirecting to: ${originalUrl.substring(0, 30)}`);
          
          // Countdown before redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                window.location.href = originalUrl;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          // Check if URL exists but is expired
          const urlData = urlService.getUrlByShortcode(shortcode);
          if (urlData) {
            setStatus('expired');
            await Log("frontend", "warn", "component", `Expired URL accessed: ${shortcode}`);
          } else {
            setStatus('notfound');
            await Log("frontend", "error", "component", `URL not found: ${shortcode}`);
          }
        }
      } catch (error) {
        await Log("frontend", "error", "component", `Redirect error: ${error.message}`);
        setStatus('notfound');
      }
    };

    if (shortcode) {
      handleRedirect();
    }
  }, [shortcode]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Processing your request...</Typography>
          </Box>
        );

      case 'redirecting':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress color="success" />
            <Typography variant="h5">Redirecting...</Typography>
            <Typography variant="body1">
              You will be redirected in {countdown} seconds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you're not redirected automatically, please check if pop-ups are blocked.
            </Typography>
          </Box>
        );

      case 'expired':
        return (
          <Alert severity="warning" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Link Expired
            </Typography>
            <Typography variant="body2">
              This shortened URL has expired and is no longer valid.
              Please contact the link creator for a new URL.
            </Typography>
          </Alert>
        );

      case 'notfound':
        return (
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Link Not Found
            </Typography>
            <Typography variant="body2">
              The shortened URL '{shortcode}' does not exist or may have been removed.
              Please check the URL and try again.
            </Typography>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center',
        px: 2
      }}
    >
      {renderContent()}
    </Box>
  );
}

export default RedirectHandler;
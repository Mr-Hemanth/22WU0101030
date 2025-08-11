import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore, Link as LinkIcon } from '@mui/icons-material';
import { Log } from '../utils/logger';
import urlService from '../services/urlService';

function StatsList() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      await Log("frontend", "info", "component", "Loading URL statistics");
      const allUrls = urlService.getAllUrls();
      setUrls(allUrls);
    };
    loadStats();
  }, []);

  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  const getClickDetails = (shortcode) => {
    const stats = urlService.getStatistics(shortcode);
    return stats ? stats.clicks : [];
  };

  if (urls.length === 0) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No shortened URLs found. Create some URLs first!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        URL Statistics ({urls.length} URLs)
      </Typography>

      {urls.map((url) => {
        const clicks = getClickDetails(url.shortcode);
        const expired = isExpired(url.expiry);

        return (
          <Accordion key={url.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon fontSize="small" />
                      <Chip 
                        label={url.shortLink} 
                        color="primary" 
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {url.originalUrl.length > 50 
                        ? url.originalUrl.substring(0, 50) + '...' 
                        : url.originalUrl}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Typography variant="body2">
                      <strong>Clicks:</strong> {url.clickCount}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Chip 
                      label={expired ? 'Expired' : 'Active'} 
                      color={expired ? 'error' : 'success'} 
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(url.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      URL Details
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Original URL:</strong> {url.originalUrl}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Short Code:</strong> {url.shortcode}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Created:</strong> {new Date(url.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Expires:</strong> {new Date(url.expiry).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Validity:</strong> {url.validityMinutes} minutes
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Click History ({clicks.length} clicks)
                    </Typography>
                    {clicks.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Location</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clicks.slice(-5).map((click, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {new Date(click.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{click.referrer}</TableCell>
                              <TableCell>{click.location}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No clicks yet
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default StatsList;
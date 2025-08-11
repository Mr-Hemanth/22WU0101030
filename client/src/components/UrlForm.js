import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Log } from '../utils/logger';
import urlService from '../services/urlService';

function UrlForm() {
  const [urls, setUrls] = useState([{ original: '', shortcode: '', validity: 30 }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const addUrlField = async () => {
    if (urls.length < 5) {
      setUrls([...urls, { original: '', shortcode: '', validity: 30 }]);
      await Log("frontend", "info", "component", "Added new URL field");
    }
  };

  const removeUrlField = async (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      await Log("frontend", "info", "component", "Removed URL field");
    }
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const validateForm = () => {
    const newErrors = {};
    
    urls.forEach((url, index) => {
      if (url.original) {
        // Validate URL
        if (!urlService.isValidUrl(url.original)) {
          newErrors[`url_${index}`] = 'Invalid URL format';
        }
        
        // Validate validity
        if (url.validity && (!Number.isInteger(Number(url.validity)) || Number(url.validity) < 1)) {
          newErrors[`validity_${index}`] = 'Validity must be a positive integer';
        }
        
        // Validate shortcode if provided
        if (url.shortcode && (url.shortcode.length < 3 || !/^[a-zA-Z0-9]+$/.test(url.shortcode))) {
          newErrors[`shortcode_${index}`] = 'Shortcode must be alphanumeric, min 3 chars';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Log("frontend", "info", "component", "Form submission started");
    
    if (!validateForm()) {
      await Log("frontend", "error", "component", "Form validation failed");
      return;
    }

    setLoading(true);
    const newResults = [];

    try {
      for (const url of urls) {
        if (url.original) {
          try {
            const result = await urlService.createShortUrl(
              url.original,
              url.shortcode || null,
              Number(url.validity) || 30
            );
            newResults.push({ success: true, data: result, originalUrl: url.original });
          } catch (error) {
            newResults.push({ success: false, error: error.message, originalUrl: url.original });
          }
        }
      }
      
      setResults(newResults);
      await Log("frontend", "info", "component", `Created ${newResults.length} URLs`);
      
    } catch (error) {
      await Log("frontend", "error", "component", "Batch creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Shortened URLs
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {urls.map((url, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com"
                      value={url.original}
                      onChange={(e) => updateUrl(index, 'original', e.target.value)}
                      error={!!errors[`url_${index}`]}
                      helperText={errors[`url_${index}`]}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (optional)"
                      placeholder="mycode"
                      value={url.shortcode}
                      onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                      error={!!errors[`shortcode_${index}`]}
                      helperText={errors[`shortcode_${index}`]}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={url.validity}
                      onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                      error={!!errors[`validity_${index}`]}
                      helperText={errors[`validity_${index}`]}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {urls.length < 5 && index === urls.length - 1 && (
                        <Button
                          startIcon={<Add />}
                          onClick={addUrlField}
                          variant="outlined"
                          size="small"
                        >
                          Add
                        </Button>
                      )}
                      {urls.length > 1 && (
                        <Button
                          startIcon={<Delete />}
                          onClick={() => removeUrlField(index)}
                          color="error"
                          variant="outlined"
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Creating...' : 'Create Short URLs'}
          </Button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            {results.map((result, index) => (
              <Alert 
                key={index} 
                severity={result.success ? 'success' : 'error'} 
                sx={{ mb: 1 }}
              >
                {result.success ? (
                  <Box>
                    <Typography variant="body2" component="div">
                      <strong>Original:</strong> {result.originalUrl}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Short URL:</strong> 
                      <Chip 
                        label={result.data.shortLink} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }} 
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Expires:</strong> {new Date(result.data.expiry).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>
                    <strong>Failed:</strong> {result.originalUrl} - {result.error}
                  </Typography>
                )}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default UrlForm;
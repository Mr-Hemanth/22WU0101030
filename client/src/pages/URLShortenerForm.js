// src/pages/URLShortenerForm.js
import React, { useState } from 'react';
import {
  Container, Paper, Typography, Divider, Card, CardContent,
  Box, TextField, Button, IconButton, Alert, CircularProgress
} from '@mui/material';
// Remove unused imports
import { Add, Remove, ContentCopy, OpenInNew } from '@mui/icons-material';
import Logger from '../components/Logger';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZW1hbnRocmVkZHkuZHdhcmFtcHVkaV8yMDI2QHdveHNlbi5lZHUuaW4iLCJleHAiOjE3NTQ4OTgyMDIsImlhdCI6MTc1NDg5NzMwMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjYzMWM4Y2VkLTM0N2EtNDdjMy1iNjNhLTkxY2U3ODcyNTRkNyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImhlbWFudGggZHdhcmFtcHVkaSIsInN1YiI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSJ9LCJlbWFpbCI6ImhlbWFudGhyZWRkeS5kd2FyYW1wdWRpXzIwMjZAd294c2VuLmVkdS5pbiIsIm5hbWUiOiJoZW1hbnRoIGR3YXJhbXB1ZGkiLCJyb2xsTm8iOiIyMnd1MDEwMTAzMCIsImFjY2Vzc0NvZGUiOiJVTVhWUVQiLCJjbGllbnRJRCI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSIsImNsaWVudFNlY3JldCI6InNTRUJqWHp0WVJDQ1F6UGgifQ.gv2-9vV4EIHQ7VSFnAqQxOjiDvF9LIab-eVMU06_ihY';
const logger = new Logger(ACCESS_TOKEN);

function URLShortenerForm({ onUrlCreated }) {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tags, setTags] = useState(['']);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTagChange = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addTagField = () => {
    setTags([...tags, '']);
  };

  const removeTagField = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleShorten = async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a valid URL.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://20.244.56.144/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ url, tags: tags.filter(tag => tag.trim()) })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setSuccessMessage('URL shortened successfully!');
      logger.info('frontend', 'url-shortener', 'URL shortened successfully');
      onUrlCreated();
    } catch (error) {
      setErrorMessage(error.message);
      logger.error('frontend', 'url-shortener', `Error shortening URL: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setSuccessMessage('Copied to clipboard!');
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6">Shorten your URL</Typography>
        <Divider sx={{ my: 2 }} />
        <TextField
          fullWidth
          label="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        {tags.map((tag, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              label={`Tag ${index + 1}`}
              value={tag}
              onChange={(e) => handleTagChange(index, e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={() => removeTagField(index)}>
              <Remove />
            </IconButton>
          </Box>
        ))}
        <Button variant="outlined" onClick={addTagField} startIcon={<Add />} sx={{ mb: 2 }}>
          Add Tag
        </Button>
        <Box>
          <Button
            variant="contained"
            onClick={handleShorten}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Shorten'}
          </Button>
        </Box>
        {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        {shortUrl && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="body1">{shortUrl}</Typography>
              <IconButton onClick={handleCopy}>
                <ContentCopy />
              </IconButton>
              <IconButton href={shortUrl} target="_blank">
                <OpenInNew />
              </IconButton>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
}

export default URLShortenerForm;
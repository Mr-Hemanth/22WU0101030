// src/App.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Paper, Tabs, Tab, Box } from '@mui/material';
import URLShortenerForm from './pages/URLShortenerForm';
import StatisticsPage from './pages/StatisticsPage';
import TabPanel from './components/TabPanel';
import Logger from './components/Logger';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZW1hbnRocmVkZHkuZHdhcmFtcHVkaV8yMDI2QHdveHNlbi5lZHUuaW4iLCJleHAiOjE3NTQ4OTgyMDIsImlhdCI6MTc1NDg5NzMwMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjYzMWM4Y2VkLTM0N2EtNDdjMy1iNjNhLTkxY2U3ODcyNTRkNyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImhlbWFudGggZHdhcmFtcHVkaSIsInN1YiI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSJ9LCJlbWFpbCI6ImhlbWFudGhyZWRkeS5kd2FyYW1wdWRpXzIwMjZAd294c2VuLmVkdS5pbiIsIm5hbWUiOiJoZW1hbnRoIGR3YXJhbXB1ZGkiLCJyb2xsTm8iOiIyMnd1MDEwMTAzMCIsImFjY2Vzc0NvZGUiOiJVTVhWUVQiLCJjbGllbnRJRCI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSIsImNsaWVudFNlY3JldCI6InNTRUJqWHp0WVJDQ1F6UGgifQ.gv2-9vV4EIHQ7VSFnAqQxOjiDvF9LIab-eVMU06_ihY';
const logger = new Logger(ACCESS_TOKEN);

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [refreshStats, setRefreshStats] = useState(0);

  useEffect(() => {
    logger.info('frontend', 'component', 'App initialized');
  }, []);

  const handleTabChange = (e, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUrlCreated = () => {
    setRefreshStats(prev => prev + 1);
  };

  return (
    <div>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🏥 AffordMed URL Shortener
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            Technology, Innovation & Affordability
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} centered>
            <Tab label="🔗 URL Shortener" />
            <Tab label="📊 Statistics" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <URLShortenerForm onUrlCreated={handleUrlCreated} />
          </TabPanel>
          <TabPanel value={currentTab} index={1} key={refreshStats}>
            <StatisticsPage />
          </TabPanel>
        </Paper>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            AffordMed Campus Hiring Evaluation - Full Stack URL Shortener
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default App;
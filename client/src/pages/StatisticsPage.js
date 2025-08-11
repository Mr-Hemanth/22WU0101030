import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { Log } from '../utils/logger';
import StatsList from '../components/StatsList';

function StatisticsPage() {
  useEffect(() => {
    const logPageLoad = async () => {
      await Log("frontend", "info", "page", "Statistics page loaded");
    };
    logPageLoad();
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics & Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        View analytics for all your shortened URLs including click counts, creation dates, and detailed click history.
      </Typography>
      <StatsList />
    </Box>
  );
}

export default StatisticsPage;
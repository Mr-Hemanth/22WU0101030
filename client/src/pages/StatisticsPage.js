// src/pages/StatisticsPage.js
import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Collapse, Link, CircularProgress, Button
} from '@mui/material';
import { ExpandLess, ExpandMore, Refresh } from '@mui/icons-material';
import Logger from '../components/Logger';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZW1hbnRocmVkZHkuZHdhcmFtcHVkaV8yMDI2QHdveHNlbi5lZHUuaW4iLCJleHAiOjE3NTQ4OTgyMDIsImlhdCI6MTc1NDg5NzMwMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjYzMWM4Y2VkLTM0N2EtNDdjMy1iNjNhLTkxY2U3ODcyNTRkNyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImhlbWFudGggZHdhcmFtcHVkaSIsInN1YiI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSJ9LCJlbWFpbCI6ImhlbWFudGhyZWRkeS5kd2FyYW1wdWRpXzIwMjZAd294c2VuLmVkdS5pbiIsIm5hbWUiOiJoZW1hbnRoIGR3YXJhbXB1ZGkiLCJyb2xsTm8iOiIyMnd1MDEwMTAzMCIsImFjY2Vzc0NvZGUiOiJVTVhWUVQiLCJjbGllbnRJRCI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSIsImNsaWVudFNlY3JldCI6InNTRUJqWHp0WVJDQ1F6UGgifQ.gv2-9vV4EIHQ7VSFnAqQxOjiDvF9LIab-eVMU06_ihY';
const logger = new Logger(ACCESS_TOKEN);

function StatisticsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const fetchStats = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('http://20.244.56.144/url/statistics', {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
      logger.info('frontend', 'statistics', 'Statistics fetched successfully');
    } catch (error) {
      setErrorMessage(error.message);
      logger.error('frontend', 'statistics', `Error fetching statistics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleRow = (index) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6">Statistics</Typography>
        <Button onClick={fetchStats} startIcon={<Refresh />} sx={{ mb: 2 }}>
          Refresh
        </Button>
        {loading && <CircularProgress />}
        {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>
                      <Link href={row.shortUrl} target="_blank">{row.shortUrl}</Link>
                    </TableCell>
                    <TableCell>{row.clicks}</TableCell>
                    <TableCell>
                      {row.tags?.map((tag, i) => (
                        <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => toggleRow(index)}>
                        {expandedRows[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                      <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                        <Typography variant="body2" sx={{ p: 2 }}>
                          Original URL: {row.originalUrl}
                        </Typography>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default StatisticsPage;
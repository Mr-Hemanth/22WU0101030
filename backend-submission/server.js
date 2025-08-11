// server.js - Save this in "Backend Test Submission" folder
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Logger from './logging.js';

const app = express();
const PORT = 8080;

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZW1hbnRocmVkZHkuZHdhcmFtcHVkaV8yMDI2QHdveHNlbi5lZHUuaW4iLCJleHAiOjE3NTQ4OTgyMDIsImlhdCI6MTc1NDg5NzMwMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjYzMWM4Y2VkLTM0N2EtNDdjMy1iNjNhLTkxY2U3ODcyNTRkNyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImhlbWFudGggZHdhcmFtcHVkaSIsInN1YiI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSJ9LCJlbWFpbCI6ImhlbWFudGhyZWRkeS5kd2FyYW1wdWRpXzIwMjZAd294c2VuLmVkdS5pbiIsIm5hbWUiOiJoZW1hbnRoIGR3YXJhbXB1ZGkiLCJyb2xsTm8iOiIyMnd1MDEwMTAzMCIsImFjY2Vzc0NvZGUiOiJVTVhWUVQiLCJjbGllbnRJRCI6IjM5ZGNlZjlkLTE4MDMtNDZlZC1iZDgyLTI2NGQwOGM0NTA1YSIsImNsaWVudFNlY3JldCI6InNTRUJqWHp0WVJDQ1F6UGgifQ.gv2-9vV4EIHQ7VSFnAqQxOjiDvF9LIab-eVMU06_ihY';
const logger = new Logger(ACCESS_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const urlDatabase = new Map();
const analytics = new Map();

// Custom logging middleware
app.use(async (req, res, next) => {
  await logger.info('backend', 'middleware', `${req.method} ${req.url} - Request received`);
  next();
});

// Helper functions
const generateShortcode = () => crypto.randomBytes(3).toString('hex');

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const getClientInfo = (req) => ({
  ip: req.ip || req.connection.remoteAddress || 'unknown',
  userAgent: req.get('User-Agent') || 'unknown',
  referrer: req.get('Referrer') || 'direct',
  location: 'Unknown' // In real app, use IP geolocation
});

// API Routes

// 1. Create Short URL
app.post('/shorturls', async (req, res) => {
  try {
    await logger.info('backend', 'controller', 'Creating short URL request received');
    const { url, validity, shortcode } = req.body;

    // Validation
    if (!url) {
      await logger.warn('backend', 'controller', 'URL creation failed - missing URL');
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a valid URL to shorten'
      });
    }

    if (!isValidUrl(url)) {
      await logger.warn('backend', 'controller', `Invalid URL format: ${url}`);
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid URL starting with http:// or https://'
      });
    }

    if (validity && (!Number.isInteger(validity) || validity <= 0)) {
      await logger.warn('backend', 'controller', `Invalid validity: ${validity}`);
      return res.status(400).json({
        error: 'Invalid validity period',
        message: 'Validity must be a positive integer representing minutes'
      });
    }

    // Handle shortcode
    let finalShortcode = shortcode;
    if (shortcode) {
      if (!/^[a-zA-Z0-9]+$/.test(shortcode) || shortcode.length < 3 || shortcode.length > 10) {
        await logger.warn('backend', 'service', `Invalid shortcode format: ${shortcode}`);
        return res.status(400).json({
          error: 'Invalid shortcode',
          message: 'Shortcode must be alphanumeric, 3-10 characters long'
        });
      }
      
      if (urlDatabase.has(shortcode)) {
        await logger.warn('backend', 'service', `Shortcode collision: ${shortcode}`);
        return res.status(409).json({
          error: 'Shortcode already exists',
          message: 'Please choose a different shortcode'
        });
      }
    } else {
      do {
        finalShortcode = generateShortcode();
      } while (urlDatabase.has(finalShortcode));
      await logger.debug('backend', 'service', `Generated shortcode: ${finalShortcode}`);
    }

    // Calculate expiry
    const validityMinutes = validity || 30;
    const expiryDate = new Date(Date.now() + validityMinutes * 60 * 1000);

    // Store data
    const urlData = {
      originalUrl: url,
      shortcode: finalShortcode,
      createdAt: new Date(),
      expiryDate,
      clickCount: 0
    };

    urlDatabase.set(finalShortcode, urlData);
    analytics.set(finalShortcode, []);

    const shortLink = `http://localhost:${PORT}/${finalShortcode}`;
    await logger.info('backend', 'service', `URL shortened: ${url} -> ${shortLink}`);

    res.status(201).json({
      shortLink,
      expiry: expiryDate.toISOString()
    });

  } catch (error) {
    await logger.error('backend', 'controller', `URL creation error: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

// 2. Get Statistics
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    await logger.info('backend', 'controller', `Getting statistics for: ${shortcode}`);

    if (!urlDatabase.has(shortcode)) {
      await logger.warn('backend', 'controller', `Shortcode not found: ${shortcode}`);
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested shortcode does not exist'
      });
    }

    const urlData = urlDatabase.get(shortcode);
    const clickData = analytics.get(shortcode) || [];

    res.json({
      shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt.toISOString(),
      expiryDate: urlData.expiryDate.toISOString(),
      totalClicks: urlData.clickCount,
      clickHistory: clickData.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        location: click.location,
        userAgent: click.userAgent
      }))
    });

  } catch (error) {
    await logger.error('backend', 'controller', `Statistics error: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve statistics'
    });
  }
});

// 3. URL Redirection
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    await logger.info('backend', 'controller', `Redirecting shortcode: ${shortcode}`);

    if (!urlDatabase.has(shortcode)) {
      await logger.warn('backend', 'controller', `Redirect failed - not found: ${shortcode}`);
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested shortcode does not exist'
      });
    }

    const urlData = urlDatabase.get(shortcode);

    // Check expiry
    if (new Date() > urlData.expiryDate) {
      await logger.warn('backend', 'controller', `Redirect failed - expired: ${shortcode}`);
      return res.status(410).json({
        error: 'Short URL expired',
        message: 'This short URL has expired and is no longer valid'
      });
    }

    // Record analytics
    const clientInfo = getClientInfo(req);
    const clickRecord = {
      timestamp: new Date().toISOString(),
      referrer: clientInfo.referrer,
      location: clientInfo.location,
      userAgent: clientInfo.userAgent,
      ip: clientInfo.ip
    };

    const clickHistory = analytics.get(shortcode) || [];
    clickHistory.push(clickRecord);
    analytics.set(shortcode, clickHistory);

    // Update click count
    urlData.clickCount += 1;
    urlDatabase.set(shortcode, urlData);

    await logger.info('backend', 'service', `Redirecting to: ${urlData.originalUrl}`);
    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    await logger.error('backend', 'controller', `Redirect error: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect'
    });
  }
});

// 4. Get all URLs (for frontend)
app.get('/api/urls', async (req, res) => {
  try {
    await logger.info('backend', 'controller', 'Getting all URLs for frontend');
    
    const allUrls = Array.from(urlDatabase.entries()).map(([shortcode, data]) => ({
      shortcode,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt.toISOString(),
      expiryDate: data.expiryDate.toISOString(),
      totalClicks: data.clickCount,
      shortLink: `http://localhost:${PORT}/${shortcode}`
    }));

    res.json(allUrls);
  } catch (error) {
    await logger.error('backend', 'controller', `Get URLs error: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  await logger.info('backend', 'service', 'Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(async (err, req, res, next) => {
  await logger.error('backend', 'middleware', `Unhandled error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', async (req, res) => {
  await logger.warn('backend', 'middleware', `404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource does not exist'
  });
});

// Start server
app.listen(PORT, async () => {
  await logger.info('backend', 'service', `Server started on port ${PORT}`);
  await logger.info('backend', 'service', `Health check: http://localhost:${PORT}/health`);
});

export default app;
import { Log } from '../utils/logger';

class UrlService {
  constructor() {
    this.urls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
    this.clicks = JSON.parse(localStorage.getItem('urlClicks')) || {};
  }

  // Generate random shortcode
  generateShortcode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Check if shortcode is unique
  isShortcodeUnique(shortcode) {
    return !this.urls.some(url => url.shortcode === shortcode);
  }

  // Validate URL format
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Create shortened URL
  async createShortUrl(originalUrl, customShortcode = null, validityMinutes = 30) {
    await Log("frontend", "info", "service", "Creating new short URL");

    // Validation
    if (!this.isValidUrl(originalUrl)) {
      await Log("frontend", "error", "service", "Invalid URL format provided");
      throw new Error('Invalid URL format');
    }

    let shortcode = customShortcode;
    
    // Generate shortcode if not provided
    if (!shortcode) {
      do {
        shortcode = this.generateShortcode();
      } while (!this.isShortcodeUnique(shortcode));
    } else {
      // Check if custom shortcode is unique
      if (!this.isShortcodeUnique(shortcode)) {
        await Log("frontend", "error", "service", "Shortcode already exists");
        throw new Error('Shortcode already exists');
      }
    }

    // Calculate expiry
    const now = new Date();
    const expiry = new Date(now.getTime() + validityMinutes * 60000);

    const urlData = {
      id: Date.now() + Math.random(),
      originalUrl,
      shortcode,
      shortLink: `http://localhost:3000/${shortcode}`,
      createdAt: now.toISOString(),
      expiry: expiry.toISOString(),
      validityMinutes,
      clickCount: 0
    };

    this.urls.push(urlData);
    this.clicks[shortcode] = [];
    this.saveToStorage();

    await Log("frontend", "info", "service", `Short URL created: ${shortcode}`);
    return urlData;
  }

  // Get all URLs
  getAllUrls() {
    return this.urls;
  }

  // Get URL by shortcode
  getUrlByShortcode(shortcode) {
    return this.urls.find(url => url.shortcode === shortcode);
  }

  // Record click
  async recordClick(shortcode, referrer = '') {
    const url = this.getUrlByShortcode(shortcode);
    if (!url) return null;

    // Check if expired
    if (new Date() > new Date(url.expiry)) {
      await Log("frontend", "warn", "service", "Expired URL accessed");
      return null;
    }

    // Record click
    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: referrer || 'Direct',
      location: 'Hyderabad, IN' // Mock location
    };

    url.clickCount++;
    this.clicks[shortcode].push(clickData);
    this.saveToStorage();

    await Log("frontend", "info", "service", `Click recorded for ${shortcode}`);
    return url.originalUrl;
  }

  // Get click statistics
  getStatistics(shortcode) {
    const url = this.getUrlByShortcode(shortcode);
    if (!url) return null;

    return {
      url,
      clicks: this.clicks[shortcode] || []
    };
  }

  // Save to localStorage
  saveToStorage() {
    localStorage.setItem('shortenedUrls', JSON.stringify(this.urls));
    localStorage.setItem('urlClicks', JSON.stringify(this.clicks));
  }
}

export default new UrlService();
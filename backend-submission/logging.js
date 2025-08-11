// logging.js - Save this in "Logging Middleware" folder
import fetch from 'node-fetch';

class Logger {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.logEndpoint = 'http://20.244.56.144/evaluation-service/logs';
  }

  async Log(stack, level, packageName, message) {
    // Validate inputs
    const validStacks = ['backend', 'frontend'];
    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    
    if (!validStacks.includes(stack) || !validLevels.includes(level)) {
      console.error('Invalid log parameters');
      return;
    }

    const logData = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message: message
    };

    try {
      const response = await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error(`Logging failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Logging error:', error.message);
    }
  }

  // Convenience methods
  async info(stack, packageName, message) {
    return this.Log(stack, 'info', packageName, message);
  }

  async error(stack, packageName, message) {
    return this.Log(stack, 'error', packageName, message);
  }

  async warn(stack, packageName, message) {
    return this.Log(stack, 'warn', packageName, message);
  }

  async debug(stack, packageName, message) {
    return this.Log(stack, 'debug', packageName, message);
  }
}

export default Logger;
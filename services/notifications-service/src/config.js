// src/config.js
require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVICE_NAME: 'notifications-service',

  // Termii — SMS gateway
  // Locally this points to WireMock
  TERMII_BASE_URL: requireEnv('TERMII_BASE_URL'),
  TERMII_API_KEY: requireEnv('TERMII_API_KEY'),
};

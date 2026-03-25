// src/routes.js
const express = require('express');
const { sendNotification, getNotificationLog } = require('./notification');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notifications-service',
    timestamp: new Date().toISOString(),
  });
});

// POST /api/v1/notify — send a notification
// Called internally by transfer-service, nestcredit-service, etc.
// This endpoint is NOT exposed to the public internet — ClusterIP only
router.post('/api/v1/notify', async (req, res) => {
  const { userId, type, message, channel } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is required',
    });
  }

  try {
    const result = await sendNotification({ userId, type, message, channel });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Notification failed',
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      reference: result.reference,
    });
  } catch (error) {
    console.error('Unhandled error in notification route:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
});

// GET /api/v1/notify/log — internal endpoint for debugging
// Returns all notifications sent in this session
// In production this would be Datadog — this is just for local dev
router.get('/api/v1/notify/log', (req, res) => {
  const log = getNotificationLog();
  res.status(200).json({
    success: true,
    count: log.length,
    data: log,
  });
});

module.exports = router;

// src/notification.js
// Core business logic for sending notifications
// Supports two channels: sms and push
// Locally both channels hit WireMock instead of real providers

const axios = require('axios');
const config = require('./config');

// In-memory log of sent notifications
const notificationLog = [];

async function sendNotification({ userId, type, message, channel = 'push' }) {

  // Step 1 — Validate
  const errors = validateNotificationRequest({ userId, type, message });
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Step 2 — Route to the correct channel
  let providerResponse;
  try {
    if (channel === 'sms') {
      providerResponse = await sendSMS({ userId, message });
    } else {
      providerResponse = await sendPushNotification({ userId, message });
    }
  } catch (error) {
    // Log the failure but don't crash — a failed notification
    // should never cause the calling service to fail
    console.error(`Notification delivery failed for user ${userId}:`, error.message);

    notificationLog.push({
      userId,
      type,
      message,
      channel,
      status: 'failed',
      failureReason: error.message,
      sentAt: new Date().toISOString(),
    });

    return {
      success: false,
      errors: ['Notification delivery failed'],
    };
  }

  // Step 3 — Log the successful notification
  const record = {
    userId,
    type,
    message,
    channel,
    status: 'delivered',
    providerReference: providerResponse.data.messageId,
    sentAt: new Date().toISOString(),
  };
  notificationLog.push(record);

  return {
    success: true,
    message: 'Notification sent successfully',
    reference: record.providerReference,
  };
}

async function sendSMS({ userId, message }) {
  return axios.post(
    `${config.TERMII_BASE_URL}/api/sms/send`,
    {
      to: userId,
      from: 'PayNest',
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: config.TERMII_API_KEY,
    },
    { timeout: 10000 }
  );
}

async function sendPushNotification({ userId, message }) {
  // In production this would call Firebase Cloud Messaging (FCM)
  // For now we simulate the call through WireMock
  return axios.post(
    `${config.TERMII_BASE_URL}/api/push/send`,
    {
      userId,
      message,
      provider: 'fcm',
    },
    { timeout: 10000 }
  );
}

function validateNotificationRequest({ userId, type, message }) {
  const errors = [];

  if (!userId) errors.push('userId is required');
  if (!type)   errors.push('type is required');
  if (!message) errors.push('message is required');

  const validTypes = [
    'transfer_successful',
    'transfer_failed',
    'login_otp',
    'loan_disbursed',
    'bill_payment_successful',
  ];

  if (type && !validTypes.includes(type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  return errors;
}

function getNotificationLog() {
  return notificationLog;
}

module.exports = { sendNotification, getNotificationLog };

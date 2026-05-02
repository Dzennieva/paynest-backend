const { sendNotification } = require('./notification');

jest.mock('axios');
const axios = require('axios');

describe('sendNotification', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects a notification with no userId', async () => {
    const result = await sendNotification({
      userId: null,
      type: 'transfer_successful',
      message: 'Your transfer was successful',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('userId is required');
  });

  test('rejects an invalid notification type', async () => {
    const result = await sendNotification({
      userId: 'usr_123',
      type: 'invalid_type',
      message: 'Test message',
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('type must be one of');
  });

  test('sends a push notification successfully', async () => {
    axios.post.mockResolvedValueOnce({
      data: { messageId: 'MSG-001' }
    });

    const result = await sendNotification({
      userId: 'usr_123',
      type: 'transfer_successful',
      message: 'Your transfer of ₦5,000 was successful',
      channel: 'push',
    });

    expect(result.success).toBe(true);
    expect(result.reference).toBe('MSG-001');
  });

  test('sends an SMS successfully', async () => {
    axios.post.mockResolvedValueOnce({
      data: { messageId: 'SMS-001' }
    });

    const result = await sendNotification({
      userId: 'usr_123',
      type: 'login_otp',
      message: 'Your PayNest OTP is 482910',
      channel: 'sms',
    });

    expect(result.success).toBe(true);
    expect(result.reference).toBe('SMS-001');
  });

  test('handles provider failure gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await sendNotification({
      userId: 'usr_123',
      type: 'transfer_successful',
      message: 'Your transfer was successful',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Notification delivery failed');
  });

});

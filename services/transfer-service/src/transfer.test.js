// Unit tests for the transfer business logic
// These run in the Docker test stage — a failed test stops the build

const { initiateTransfer, getTransaction } = require('./transfer');

jest.mock('axios');
const axios = require('axios');

describe('initiateTransfer', () => {

  beforeEach(() => {
    // Reset all mocks between tests
    jest.clearAllMocks();
  });

  test('rejects a transfer with no senderId', async () => {
    const result = await initiateTransfer({
      senderId: null,
      recipientAccount: '0123456789',
      amount: 5000,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('senderId is required');
  });

  test('rejects a transfer below minimum amount', async () => {
    const result = await initiateTransfer({
      senderId: 'usr_123',
      recipientAccount: '0123456789',
      amount: 0,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('amount must be at least ₦1');
  });

  test('rejects a transfer above maximum limit', async () => {
    const result = await initiateTransfer({
      senderId: 'usr_123',
      recipientAccount: '0123456789',
      amount: 6000000,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('amount exceeds maximum single transfer limit of ₦5,000,000');
  });

  test('processes a valid transfer successfully', async () => {
    // Mock a successful NIBSS response
    axios.post.mockResolvedValueOnce({
      data: { sessionId: 'NIBSS-SESSION-001' }
    });

    // Mock a successful notification response
    axios.post.mockResolvedValueOnce({
      data: { sent: true }
    });

    const result = await initiateTransfer({
      senderId: 'usr_123',
      recipientAccount: '0123456789',
      amount: 5000,
      narration: 'Rent payment',
    });

    expect(result.success).toBe(true);
    expect(result.transactionRef).toMatch(/^PNT-/);
    expect(result.amount).toBe(5000);
    expect(result.status).toBe('successful');
  });

  test('handles NIBSS failure gracefully', async () => {
    // Mock NIBSS being down
    axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await initiateTransfer({
      senderId: 'usr_123',
      recipientAccount: '0123456789',
      amount: 5000,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Transfer processing failed. Please try again.');
    // A transaction reference is still generated even for failed transfers
    expect(result.transactionRef).toMatch(/^PNT-/);
  });

});

describe('getTransaction', () => {

  test('returns null for a reference that does not exist', async () => {
    const result = await getTransaction('PNT-DOESNOTEXIST');
    expect(result).toBeNull();
  });

});

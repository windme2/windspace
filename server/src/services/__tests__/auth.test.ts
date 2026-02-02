import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth service
const mockGenerateTokenPair = vi.fn();
const mockVerifyAccessToken = vi.fn();

vi.mock('../../services/auth', () => ({
  generateTokenPair: mockGenerateTokenPair,
  verifyAccessToken: mockVerifyAccessToken,
  verifyRefreshToken: vi.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      mockGenerateTokenPair.mockReturnValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
      });

      const payload = {
        userId: 'admin',
        username: 'admin',
        role: 'admin',
      };

      const result = mockGenerateTokenPair(payload);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should include correct expiration time', () => {
      mockGenerateTokenPair.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
      });

      const result = mockGenerateTokenPair({ userId: 'admin' });

      expect(result.expiresIn).toBe(900);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', () => {
      mockVerifyAccessToken.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        role: 'admin',
      });

      const result = mockVerifyAccessToken('valid-token');

      expect(result).toHaveProperty('userId', 'admin');
      expect(result).toHaveProperty('role', 'admin');
    });

    it('should return null for invalid token', () => {
      mockVerifyAccessToken.mockReturnValue(null);

      const result = mockVerifyAccessToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      mockVerifyAccessToken.mockReturnValue(null);

      const result = mockVerifyAccessToken('expired-token');

      expect(result).toBeNull();
    });
  });
});

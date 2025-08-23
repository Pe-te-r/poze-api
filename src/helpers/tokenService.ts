import * as jwt from 'jsonwebtoken';
import { roleEnum } from '../db/schema.js';

export class AuthTokenService {
  private readonly secretKey: string;
  private readonly refreshSecretKey: string;

  constructor(
    secretKey: string = process.env.JWT_SECRET || 'your-access-secret-key',
    refreshSecretKey: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
  ) {
    this.secretKey = secretKey;
    this.refreshSecretKey = refreshSecretKey;
  }

  // Generate access token (12 hours) with user data
  generateAccessToken(phone: string, role: string, userId: string): string {
    const payload = {
      sub: userId,    // Subject (user ID)
      phone: phone,   // User's phone number
      role: role,     // User's role
      type: 'access', // Token type
      iat: Math.floor(Date.now() / 1000) // Issued at
    };

    return jwt.sign(payload, this.secretKey, { expiresIn: '12h' });
  }

  // Generate refresh token (24 hours) with only userId
  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,    // Subject (user ID)
      type: 'refresh', // Token type
      iat: Math.floor(Date.now() / 1000) // Issued at
    };

    return jwt.sign(payload, this.refreshSecretKey, { expiresIn: '24h' });
  }

  // Generate both tokens at once role can be type enum
    generateAuthTokens(phone: string, role: string, userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(phone, role, userId),
      refreshToken: this.generateRefreshToken(userId)
    };
  }

  // Verify access token
  verifyAccessToken(token: string): { phone: string; role: string; userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      
      // Check if it's an access token
      if (decoded.type !== 'access') {
        return null;
      }

      return {
        phone: decoded.phone,
        role: decoded.role,
        userId: decoded.sub
      };
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.refreshSecretKey) as any;
      
      // Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        return null;
      }

      return {
        userId: decoded.sub
      };
    } catch (error) {
      return null;
    }
  }

  // Refresh access token using refresh token
  refreshAccessToken(refreshToken: string, phone: string, role: string): {
    accessToken: string;
  } | null {
    const decoded = this.verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return null;
    }

    // Generate new tokens
    const access_token =this.generateAuthTokens(phone, role, decoded.userId).accessToken;
    return { accessToken: access_token };
  }

  // Get token expiration time
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance for easy import
export const authTokenService = new AuthTokenService();
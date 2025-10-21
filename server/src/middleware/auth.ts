import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth';
import { SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    shopName: string;
    shopType: string;
  };
}

class AuthMiddleware {
  private authService: AuthService;

  constructor(supabase: SupabaseClient) {
    this.authService = new AuthService(supabase);
  }

  // Verify JWT token
  async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Access token required'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      const { userId } = await this.authService.verifyToken(token);
      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        shopName: user.shopName,
        shopType: user.shopType
      };

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  }

  // Optional token verification (for public endpoints that can benefit from user context)
  async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without user context
        next();
        return;
      }

      const token = authHeader.substring(7);
      const { userId } = await this.authService.verifyToken(token);
      const user = await this.authService.getUserById(userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          shopName: user.shopName,
          shopType: user.shopType
        };
      }

      next();
    } catch (error) {
      // Token is invalid, but we continue without user context
      logger.warn('Optional auth failed:', error);
      next();
    }
  }
}

export default AuthMiddleware;
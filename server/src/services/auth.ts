import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';
import { config } from '../config';
import logger from '../utils/logger';

class AuthService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  // Register new user
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const { data: user, error } = await this.supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          name: userData.name,
          shop_name: userData.shopName,
          shop_type: userData.shopType,
          language: userData.language || 'en',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating user:', error);
        throw new Error('Failed to create user');
      }

      // Generate token
      const token = this.generateToken(user.id);

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          shopName: user.shop_name,
          shopType: user.shop_type,
          language: user.language,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(loginData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id);

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          shopName: user.shop_name,
          shopType: user.shop_type,
          language: user.language,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return { userId: decoded.userId };
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        shopName: user.shop_name,
        shopType: user.shop_type,
        language: user.language,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      return null;
    }
  }
}

export default AuthService;
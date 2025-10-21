// Re-export types from the frontend schema
export type { Product, Customer, Transaction, Supplier, SupplierTransaction } from '../../../schema';

// Additional backend-specific types
export interface User {
  id: string;
  email: string;
  name: string;
  shopName: string;
  shopType: string;
  language: 'en' | 'hi';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  shopName: string;
  shopType: string;
  language?: 'en' | 'hi';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface LogLevel {
  error: 0;
  warn: 1;
  info: 2;
  http: 3;
  debug: 4;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}
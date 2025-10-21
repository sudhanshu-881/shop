import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig } from '../types';

class DatabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(config: DatabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
    this.serviceClient = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // Get the public client (for frontend operations)
  getClient(): SupabaseClient {
    return this.client;
  }

  // Get the service client (for admin operations)
  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.serviceClient
        .from('suppliers')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Connection pooling helper
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }
}

export default DatabaseService;
// Re-export core data models from the central schema definition
export type { Product, Customer, Transaction, Supplier, SupplierTransaction } from './schema';

// --- UI-Specific Types ---

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi';

export type View = 'dashboard' | 'inventory' | 'khata' | 'analytics' | 'suppliers';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

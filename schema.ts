// This file defines the data schema for the application.
// It serves as a single source of truth for data models,
// which should be used to create database tables/collections.

/**
 * Represents a product in the shop's inventory.
 */
export interface Product {
  id: string; // Corresponds to _id in MongoDB
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  cost: number;
  expiryDate: string; // ISO string format: "YYYY-MM-DD"
  supplierId: string; // Foreign key to the Supplier model
  imageUrl?: string;
  variants?: string[];
  barcode?: string;
}

/**
 * Represents a supplier of products.
 */
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  balance: number; // Amount owed to the supplier
}

/**
 * Represents a customer, typically for credit (Khata) management.
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // Amount owed by the customer
}

/**
 * Represents a credit or payment transaction for a Customer.
 */
export interface Transaction {
  id: string;
  customerId: string; // Foreign key to the Customer model
  type: 'credit' | 'payment';
  amount: number;
  date: string; // ISO string
}

/**
 * Represents a purchase or payment transaction for a Supplier.
 */
export interface SupplierTransaction {
  id: string;
  supplierId: string; // Foreign key to the Supplier model
  type: 'purchase' | 'payment';
  amount: number;
  date: string; // ISO string
}
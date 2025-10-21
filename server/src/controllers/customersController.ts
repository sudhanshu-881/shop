import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Customer, Transaction } from '../types';
import logger from '../utils/logger';

class CustomersController {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Get all customers
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { data: customers, error } = await this.supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        logger.error('Error fetching customers:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch customers'
        });
        return;
      }

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      logger.error('Customers controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Create new customer
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerData: Omit<Customer, 'id' | 'balance'> = req.body;

      if (!customerData.name || !customerData.phone) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, phone'
        });
        return;
      }

      const { data: customer, error } = await this.supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone: customerData.phone,
          balance: 0
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating customer:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create customer'
        });
        return;
      }

      logger.info(`Customer created: ${customer.name}`);
      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      logger.error('Customer creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Add transaction
  async addTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transactionData: Omit<Transaction, 'id' | 'date'> = req.body;

      if (!transactionData.customerId || !transactionData.type || !transactionData.amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: customerId, type, amount'
        });
        return;
      }

      // Start transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          customer_id: transactionData.customerId,
          type: transactionData.type,
          amount: transactionData.amount,
          description: transactionData.description || null
        })
        .select()
        .single();

      if (transactionError) {
        logger.error('Error creating transaction:', transactionError);
        res.status(500).json({
          success: false,
          error: 'Failed to create transaction'
        });
        return;
      }

      // Update customer balance
      const balanceChange = transactionData.type === 'credit' 
        ? transactionData.amount 
        : -transactionData.amount;

      const { data: updatedCustomer, error: customerError } = await this.supabase
        .from('customers')
        .update({
          balance: this.supabase.raw(`balance + ${balanceChange}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionData.customerId)
        .select()
        .single();

      if (customerError) {
        logger.error('Error updating customer balance:', customerError);
        res.status(500).json({
          success: false,
          error: 'Failed to update customer balance'
        });
        return;
      }

      logger.info(`Transaction created: ${transaction.type} ${transaction.amount} for customer ${transactionData.customerId}`);
      res.status(201).json({
        success: true,
        data: {
          newTransaction: transaction,
          updatedCustomer: updatedCustomer
        }
      });
    } catch (error) {
      logger.error('Transaction creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get customer transactions
  async getCustomerTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      const { data: transactions, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching customer transactions:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch transactions'
        });
        return;
      }

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Customer transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default CustomersController;
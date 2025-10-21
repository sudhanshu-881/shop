import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Supplier, SupplierTransaction } from '../types';
import logger from '../utils/logger';

class SuppliersController {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Get all suppliers
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const { data: suppliers, error } = await this.supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        logger.error('Error fetching suppliers:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch suppliers'
        });
        return;
      }

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      logger.error('Suppliers controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Create new supplier
  async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      const supplierData: Omit<Supplier, 'id' | 'balance'> = req.body;

      if (!supplierData.name || !supplierData.contactPerson || !supplierData.phone || !supplierData.address) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, contactPerson, phone, address'
        });
        return;
      }

      const { data: supplier, error } = await this.supabase
        .from('suppliers')
        .insert({
          name: supplierData.name,
          contact_person: supplierData.contactPerson,
          phone: supplierData.phone,
          address: supplierData.address,
          balance: 0
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating supplier:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create supplier'
        });
        return;
      }

      logger.info(`Supplier created: ${supplier.name}`);
      res.status(201).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      logger.error('Supplier creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Add supplier transaction
  async addSupplierTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transactionData: Omit<SupplierTransaction, 'id' | 'date'> = req.body;

      if (!transactionData.supplierId || !transactionData.type || !transactionData.amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: supplierId, type, amount'
        });
        return;
      }

      // Create transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from('supplier_transactions')
        .insert({
          supplier_id: transactionData.supplierId,
          type: transactionData.type,
          amount: transactionData.amount,
          description: transactionData.description || null
        })
        .select()
        .single();

      if (transactionError) {
        logger.error('Error creating supplier transaction:', transactionError);
        res.status(500).json({
          success: false,
          error: 'Failed to create supplier transaction'
        });
        return;
      }

      // Update supplier balance
      const balanceChange = transactionData.type === 'purchase' 
        ? transactionData.amount 
        : -transactionData.amount;

      const { data: updatedSupplier, error: supplierError } = await this.supabase
        .from('suppliers')
        .update({
          balance: this.supabase.raw(`balance + ${balanceChange}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionData.supplierId)
        .select()
        .single();

      if (supplierError) {
        logger.error('Error updating supplier balance:', supplierError);
        res.status(500).json({
          success: false,
          error: 'Failed to update supplier balance'
        });
        return;
      }

      logger.info(`Supplier transaction created: ${transaction.type} ${transaction.amount} for supplier ${transactionData.supplierId}`);
      res.status(201).json({
        success: true,
        data: {
          newTransaction: transaction,
          updatedSupplier: updatedSupplier
        }
      });
    } catch (error) {
      logger.error('Supplier transaction creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get supplier transactions
  async getSupplierTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;

      const { data: transactions, error } = await this.supabase
        .from('supplier_transactions')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching supplier transactions:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch supplier transactions'
        });
        return;
      }

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Supplier transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default SuppliersController;
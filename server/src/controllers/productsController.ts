import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../types';
import logger from '../utils/logger';

class ProductsController {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Get all products
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { data: products, error } = await this.supabase
        .from('products')
        .select(`
          *,
          suppliers (
            id,
            name,
            contact_person,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch products'
        });
        return;
      }

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      logger.error('Products controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { data: product, error } = await this.supabase
        .from('products')
        .select(`
          *,
          suppliers (
            id,
            name,
            contact_person,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({
            success: false,
            error: 'Product not found'
          });
          return;
        }
        
        logger.error('Error fetching product:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch product'
        });
        return;
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Product controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Create new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: Omit<Product, 'id'> = req.body;

      // Validate required fields
      if (!productData.name || !productData.category || productData.price === undefined || productData.cost === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, category, price, cost'
        });
        return;
      }

      const { data: product, error } = await this.supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          stock: productData.stock || 0,
          low_stock_threshold: productData.lowStockThreshold || 0,
          price: productData.price,
          cost: productData.cost,
          expiry_date: productData.expiryDate || null,
          supplier_id: productData.supplierId || null,
          image_url: productData.imageUrl || null,
          variants: productData.variants || [],
          barcode: productData.barcode || null,
        })
        .select(`
          *,
          suppliers (
            id,
            name,
            contact_person,
            phone
          )
        `)
        .single();

      if (error) {
        logger.error('Error creating product:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create product'
        });
        return;
      }

      logger.info(`Product created: ${product.name}`);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Product creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const { data: product, error } = await this.supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          suppliers (
            id,
            name,
            contact_person,
            phone
          )
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({
            success: false,
            error: 'Product not found'
          });
          return;
        }
        
        logger.error('Error updating product:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update product'
        });
        return;
      }

      logger.info(`Product updated: ${product.name}`);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Product update error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting product:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete product'
        });
        return;
      }

      logger.info(`Product deleted: ${id}`);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logger.error('Product deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Bulk import products
  async bulkImportProducts(req: Request, res: Response): Promise<void> {
    try {
      const products: Omit<Product, 'id'>[] = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid products data'
        });
        return;
      }

      const productsToInsert = products.map(product => ({
        name: product.name,
        category: product.category,
        stock: product.stock || 0,
        low_stock_threshold: product.lowStockThreshold || 0,
        price: product.price,
        cost: product.cost,
        expiry_date: product.expiryDate || null,
        supplier_id: product.supplierId || null,
        image_url: product.imageUrl || null,
        variants: product.variants || [],
        barcode: product.barcode || null,
      }));

      const { data, error } = await this.supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) {
        logger.error('Error bulk importing products:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to import products'
        });
        return;
      }

      logger.info(`Bulk imported ${data.length} products`);
      res.status(201).json({
        success: true,
        data: {
          insertedCount: data.length,
          products: data
        }
      });
    } catch (error) {
      logger.error('Bulk import error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update product stock
  async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (typeof stock !== 'number' || stock < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid stock value'
        });
        return;
      }

      const { data: product, error } = await this.supabase
        .from('products')
        .update({ 
          stock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({
            success: false,
            error: 'Product not found'
          });
          return;
        }
        
        logger.error('Error updating product stock:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update product stock'
        });
        return;
      }

      logger.info(`Product stock updated: ${product.name} - ${stock}`);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Product stock update error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default ProductsController;
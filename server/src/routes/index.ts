import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import ProductsController from '../controllers/productsController';
import CustomersController from '../controllers/customersController';
import SuppliersController from '../controllers/suppliersController';
import AIController from '../controllers/aiController';
import AuthService from '../services/auth';
import AuthMiddleware from '../middleware/auth';
import { generalLimiter, aiLimiter, authLimiter } from '../middleware/rateLimiter';
import { config } from '../config';

const createRoutes = (supabase: SupabaseClient) => {
  const router = Router();
  
  // Initialize controllers
  const productsController = new ProductsController(supabase);
  const customersController = new CustomersController(supabase);
  const suppliersController = new SuppliersController(supabase);
  const aiController = new AIController(config.gemini.apiKey);
  const authService = new AuthService(supabase);
  const authMiddleware = new AuthMiddleware(supabase);

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'InvenShop API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Auth routes
  router.post('/auth/register', authLimiter, async (req, res) => {
    try {
      const result = await authService.register(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });

  router.post('/auth/login', authLimiter, async (req, res) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  });

  // Public data endpoint (for initial app load)
  router.get('/data', generalLimiter, async (req, res) => {
    try {
      const [productsResult, customersResult, suppliersResult, transactionsResult, supplierTransactionsResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('name', { ascending: true }),
        supabase.from('suppliers').select('*').order('name', { ascending: true }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('supplier_transactions').select('*').order('created_at', { ascending: false })
      ]);

      res.json({
        success: true,
        data: {
          products: productsResult.data || [],
          customers: customersResult.data || [],
          suppliers: suppliersResult.data || [],
          transactions: transactionsResult.data || [],
          supplierTransactions: supplierTransactionsResult.data || []
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch initial data'
      });
    }
  });

  // Product routes
  router.get('/products', generalLimiter, productsController.getAllProducts.bind(productsController));
  router.get('/products/:id', generalLimiter, productsController.getProductById.bind(productsController));
  router.post('/products', generalLimiter, productsController.createProduct.bind(productsController));
  router.put('/products/:id', generalLimiter, productsController.updateProduct.bind(productsController));
  router.delete('/products/:id', generalLimiter, productsController.deleteProduct.bind(productsController));
  router.post('/products/bulk', generalLimiter, productsController.bulkImportProducts.bind(productsController));
  router.put('/products/:id/stock', generalLimiter, productsController.updateProductStock.bind(productsController));

  // Customer routes
  router.get('/customers', generalLimiter, customersController.getAllCustomers.bind(customersController));
  router.post('/customers', generalLimiter, customersController.createCustomer.bind(customersController));
  router.post('/transactions', generalLimiter, customersController.addTransaction.bind(customersController));
  router.get('/customers/:customerId/transactions', generalLimiter, customersController.getCustomerTransactions.bind(customersController));

  // Supplier routes
  router.get('/suppliers', generalLimiter, suppliersController.getAllSuppliers.bind(suppliersController));
  router.post('/suppliers', generalLimiter, suppliersController.createSupplier.bind(suppliersController));
  router.post('/supplier-transactions', generalLimiter, suppliersController.addSupplierTransaction.bind(suppliersController));
  router.get('/suppliers/:supplierId/transactions', generalLimiter, suppliersController.getSupplierTransactions.bind(suppliersController));

  // AI routes
  router.post('/ai/ask', aiLimiter, aiController.askDukaanMitra.bind(aiController));
  router.get('/ai/health', generalLimiter, aiController.healthCheck.bind(aiController));

  return router;
};

export default createRoutes;
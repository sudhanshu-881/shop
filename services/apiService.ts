import type { Product, Customer, Transaction, Supplier, SupplierTransaction } from '../schema';

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend server URL

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const apiService = {
  // --- Initial Data ---
  getInitialData: async () => {
    const response = await fetch(`${API_BASE_URL}/data`);
    return handleResponse(response);
  },

  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return handleResponse(response);
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },
  
  bulkImportProducts: async (products: Omit<Product, 'id'>[]): Promise<{ insertedCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
    return handleResponse(response);
  },

  updateProductStock: async (productId: string, stock: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });
  },

  // --- Customers ---
  addCustomer: async (customerData: Omit<Customer, 'id' | 'balance'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
    });
    return handleResponse(response);
  },

  // --- Transactions ---
  addTransaction: async (transactionData: Omit<Transaction, 'id' | 'date'>): Promise<{newTransaction: Transaction, updatedCustomer: Customer}> => {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
      });
      return handleResponse(response);
  },

  // --- Suppliers ---
   addSupplier: async (supplierData: Omit<Supplier, 'id' | 'balance'>): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
    });
    return handleResponse(response);
  },
  
  // --- Supplier Transactions ---
  addSupplierTransaction: async (transactionData: Omit<SupplierTransaction, 'id' | 'date'>): Promise<{newTransaction: SupplierTransaction, updatedSupplier: Supplier}> => {
      const response = await fetch(`${API_BASE_URL}/supplier-transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
      });
      return handleResponse(response);
  },

  // --- AI Assistant ---
  askDukaanMitra: async (query: string, products: Product[], suppliers: Supplier[], shopType: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, products, suppliers, shopType }),
    });
    const data = await handleResponse(response);
    return data.text;
  }

};

export { apiService };

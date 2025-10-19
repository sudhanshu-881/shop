import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Khata } from './components/Khata';
import { Analytics } from './components/Analytics';
import { Suppliers } from './components/Suppliers';
import type { Product, Notification, Language, Customer, Transaction, View, Supplier, SupplierTransaction } from './types';
import { AddProductModal } from './components/AddProductModal';
import { MenuIcon, PlusIcon } from './components/Icons';
import { Onboarding } from './components/Onboarding';
import { BulkImportModal } from './components/BulkImportModal';
import { useTranslations } from './contexts';
import { Toast } from './components/Toast';
import { apiService } from './services/apiService';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SUPPLIERS, MOCK_TRANSACTIONS, MOCK_SUPPLIER_TRANSACTIONS } from './constants';

const App: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => localStorage.getItem('onboardingComplete') === 'true');
  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || 'InvenShop');
  const [shopType, setShopType] = useState(() => localStorage.getItem('shopType') || 'General Store');

  const { t, setLanguage } = useTranslations();

  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierTransactions, setSupplierTransactions] = useState<SupplierTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  // Fetch initial data from the backend
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const data = await apiService.getInitialData();
        setProducts(data.products || []);
        setCustomers(data.customers || []);
        setTransactions(data.transactions || []);
        setSuppliers(data.suppliers || []);
        setSupplierTransactions(data.supplierTransactions || []);
      } catch (error) {
        console.warn("Failed to fetch initial data from backend:", error);
        addNotification('Could not connect to server. Loading sample data.', 'warning');
        setIsOffline(true);
        
        // Load mock data as a fallback
        setProducts(MOCK_PRODUCTS);
        setCustomers(MOCK_CUSTOMERS);
        setTransactions(MOCK_TRANSACTIONS);
        setSuppliers(MOCK_SUPPLIERS);
        setSupplierTransactions(MOCK_SUPPLIER_TRANSACTIONS);
      } finally {
        setIsLoading(false);
      }
    };
    if (isOnboardingComplete) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [isOnboardingComplete, addNotification]);

  const customerTotalDues = useMemo(() => {
    return customers.reduce((acc, customer) => acc + customer.balance, 0);
  }, [customers]);

  const supplierTotalDues = useMemo(() => {
    return suppliers.reduce((acc, supplier) => acc + supplier.balance, 0);
  }, [suppliers]);

  const handleOnboardingComplete = (name: string, type: string, lang: Language) => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('shopName', name);
    localStorage.setItem('shopType', type);
    setIsOnboardingComplete(true);
    setShopName(name);
    setShopType(type);
    setLanguage(lang);
  };
  
  const handleAddProduct = useCallback(async (newProductData: Omit<Product, 'id'>) => {
    if (isOffline) {
        const productWithId: Product = { ...newProductData, id: `mock-${Date.now()}` };
        setProducts(prev => [productWithId, ...prev]);
        setIsModalOpen(false);
        addNotification(`(Offline) ${productWithId.name} added successfully!`, 'success');
        return;
    }
    try {
      const addedProduct = await apiService.addProduct(newProductData);
      setProducts(prevProducts => [addedProduct, ...prevProducts]);
      setIsModalOpen(false);
      addNotification(`${addedProduct.name} added successfully!`, 'success');
    } catch (error) {
      console.error("Failed to add product:", error);
      addNotification('Failed to add product.', 'error');
    }
  }, [isOffline, addNotification]);

  const handleBulkAddProducts = useCallback(async (newProducts: Omit<Product, 'id'>[]) => {
    if (isOffline) {
        const productsWithIds: Product[] = newProducts.map(p => ({...p, id: `mock-${Date.now()}-${p.name}`}));
        setProducts(prev => [...productsWithIds, ...prev]);
        setIsBulkImportModalOpen(false);
        addNotification(`(Offline) ${newProducts.length} products imported!`, 'success');
        return;
    }
    try {
        await apiService.bulkImportProducts(newProducts);
        // Re-fetch products to get the new list with IDs from the backend
        const updatedProducts = await apiService.getProducts();
        setProducts(updatedProducts);
        setIsBulkImportModalOpen(false);
        addNotification(`${newProducts.length} products imported successfully!`, 'success');
    } catch (error) {
        console.error("Failed to bulk import products:", error);
        addNotification('Failed to import products.', 'error');
    }
  }, [isOffline, addNotification]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateProductStock = useCallback(async (productId: string, newStock: number) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return;
    
    if (isOffline) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        if (productToUpdate.stock >= productToUpdate.lowStockThreshold && newStock < productToUpdate.lowStockThreshold) {
            addNotification(`(Offline) ${t('lowStockNotification', productToUpdate.name)}`, 'info');
        }
        return;
    }

    const originalProducts = [...products];
    // Optimistic update
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    try {
        await apiService.updateProductStock(productId, newStock);
        if (productToUpdate && productToUpdate.stock >= productToUpdate.lowStockThreshold && newStock < productToUpdate.lowStockThreshold) {
            addNotification(t('lowStockNotification', productToUpdate.name), 'info');
        }
    } catch (error) {
        console.error("Failed to update stock:", error);
        addNotification(`Failed to update stock for ${productToUpdate?.name}.`, 'error');
        setProducts(originalProducts); // Revert on failure
    }
  }, [isOffline, products, addNotification, t]);
  
  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'balance'>) => {
    if (isOffline) {
        const newCustomer: Customer = { ...customerData, id: `mock-c-${Date.now()}`, balance: 0 };
        setCustomers(prev => [newCustomer, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
        addNotification(`(Offline) ${newCustomer.name} added as a customer.`, 'success');
        return;
    }
    try {
        const newCustomer = await apiService.addCustomer(customerData);
        setCustomers(prev => [newCustomer, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
        addNotification(`${newCustomer.name} added as a customer.`, 'success');
    } catch (error) {
        console.error("Failed to add customer:", error);
        addNotification('Failed to add customer.', 'error');
    }
  }, [isOffline, addNotification]);

  const handleAddTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    if (isOffline) {
        const newTransaction: Transaction = { ...transactionData, id: `mock-tx-${Date.now()}`, date: new Date().toISOString() };
        setTransactions(prev => [newTransaction, ...prev]);
        setCustomers(prev => prev.map(c => {
            if (c.id === transactionData.customerId) {
                const balanceChange = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
                return { ...c, balance: c.balance + balanceChange };
            }
            return c;
        }));
        addNotification(`(Offline) Transaction recorded successfully.`, 'success');
        return;
    }
    try {
        const { newTransaction, updatedCustomer } = await apiService.addTransaction(transactionData);
        setTransactions(prev => [newTransaction, ...prev]);
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } catch (error) {
        console.error("Failed to add transaction:", error);
        addNotification('Failed to record transaction.', 'error');
    }
  }, [isOffline, addNotification]);

  const handleAddSupplier = useCallback(async (supplierData: Omit<Supplier, 'id' | 'balance'>) => {
    if (isOffline) {
        const newSupplier: Supplier = { ...supplierData, id: `mock-s-${Date.now()}`, balance: 0 };
        setSuppliers(prev => [newSupplier, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
        addNotification(`(Offline) ${newSupplier.name} added as a supplier.`, 'success');
        return;
    }
    try {
        const newSupplier = await apiService.addSupplier(supplierData);
        setSuppliers(prev => [newSupplier, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
        addNotification(`${newSupplier.name} added as a supplier.`, 'success');
    } catch (error) {
        console.error("Failed to add supplier:", error);
        addNotification('Failed to add supplier.', 'error');
    }
  }, [isOffline, addNotification]);

  const handleAddSupplierTransaction = useCallback(async (transactionData: Omit<SupplierTransaction, 'id'|'date'>) => {
    if (isOffline) {
        const newTransaction: SupplierTransaction = { ...transactionData, id: `mock-stx-${Date.now()}`, date: new Date().toISOString() };
        setSupplierTransactions(prev => [newTransaction, ...prev]);
        setSuppliers(prev => prev.map(s => {
            if (s.id === transactionData.supplierId) {
                const balanceChange = transactionData.type === 'purchase' ? transactionData.amount : -transactionData.amount;
                return { ...s, balance: s.balance + balanceChange };
            }
            return s;
        }));
        addNotification(`(Offline) Supplier transaction recorded.`, 'success');
        return;
    }
    try {
        const { newTransaction, updatedSupplier } = await apiService.addSupplierTransaction(transactionData);
        setSupplierTransactions(prev => [newTransaction, ...prev]);
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    } catch (error) {
        console.error("Failed to add supplier transaction:", error);
        addNotification('Failed to record supplier transaction.', 'error');
    }
  }, [isOffline, addNotification]);


  const renderView = () => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><p>Connecting to your shop...</p></div>;
    }
    
    switch (view) {
      case 'dashboard':
        return <Dashboard products={products} suppliers={suppliers} shopType={shopType} onAddProductClick={() => setIsModalOpen(true)} onBulkImportClick={() => setIsBulkImportModalOpen(true)} customerTotalDues={customerTotalDues} supplierTotalDues={supplierTotalDues} />;
      case 'inventory':
        return <Inventory products={products} updateProductStock={updateProductStock} onBulkImportClick={() => setIsBulkImportModalOpen(true)} />;
      case 'khata':
        return <Khata customers={customers} transactions={transactions} onAddCustomer={handleAddCustomer} onAddTransaction={handleAddTransaction} />;
      case 'suppliers':
        return <Suppliers suppliers={suppliers} transactions={supplierTransactions} onAddSupplier={handleAddSupplier} onAddTransaction={handleAddSupplierTransaction} />;
      case 'analytics':
        return <Analytics products={products} customers={customers} suppliers={suppliers} />;
      default:
        return <Dashboard products={products} suppliers={suppliers} shopType={shopType} onAddProductClick={() => setIsModalOpen(true)} onBulkImportClick={() => setIsBulkImportModalOpen(true)} customerTotalDues={customerTotalDues} supplierTotalDues={supplierTotalDues} />;
    }
  };

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-base-100 dark:bg-gray-900 font-sans">
      <Sidebar view={view} setView={setView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} shopName={shopName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
             <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 uppercase">{t('viewTitle', view)}</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-primary-light hover:to-primary transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{t('addProduct')}</span>
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>

      {/* Notification Toasts */}
      <div className="fixed top-5 right-5 z-[100] space-y-3">
        {notifications.map(notification => (
            <Toast key={notification.id} notification={notification} onClose={removeNotification} />
        ))}
      </div>

      {isModalOpen && (
        <AddProductModal
          suppliers={suppliers}
          onClose={() => setIsModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}
      {isBulkImportModalOpen && (
        <BulkImportModal
          onClose={() => setIsBulkImportModalOpen(false)}
          onImport={handleBulkAddProducts}
        />
      )}
    </div>
  );
};

export default App;
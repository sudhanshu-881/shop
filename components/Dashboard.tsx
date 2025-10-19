import React, { useMemo } from 'react';
import type { Product, Supplier } from '../types';
import { StatCard } from './StatCard';
import { ProductTable } from './ProductTable';
import { DukaanMitra } from './AIAssistant';
import { AlertTriangleIcon, ClockIcon, ClipboardListIcon, InventoryIcon, PlusIcon, UploadIcon, UsersIcon } from './Icons';
import { useTranslations } from '../contexts';

interface DashboardProps {
  products: Product[];
  suppliers: Supplier[];
  shopType: string;
  onAddProductClick: () => void;
  onBulkImportClick: () => void;
  customerTotalDues: number;
  supplierTotalDues: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ products, suppliers, shopType, onAddProductClick, onBulkImportClick, customerTotalDues, supplierTotalDues }) => {
  const { t } = useTranslations();
  const dashboardData = useMemo(() => {
    const lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold);
    const expiringSoonProducts = products.filter(p => {
      const expiry = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });
      
    return { lowStockProducts, expiringSoonProducts };
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalProducts')} 
          value={products.length.toString()} 
          icon={<InventoryIcon className="h-8 w-8" />} 
          color="primary" 
        />
        <StatCard 
          title={t('lowStockItems')} 
          value={dashboardData.lowStockProducts.length.toString()} 
          icon={<AlertTriangleIcon className="h-8 w-8" />} 
          color="secondary" 
        />
        <StatCard 
          title={t('totalCustomerDues')}
          value={`₹${customerTotalDues.toFixed(2)}`}
          icon={<UsersIcon className="h-8 w-8" />} 
          color="success" 
        />
        <StatCard 
          title={t('totalSupplierDues')}
          value={`₹${supplierTotalDues.toFixed(2)}`}
          icon={<ClipboardListIcon className="h-8 w-8" />} 
          color="warning" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
            <DukaanMitra products={products} suppliers={suppliers} shopType={shopType} />
        </div>
        
        {/* Quick Actions and Alerts */}
        <div className="lg:col-span-2 space-y-8">
             <div>
                <h2 className="text-xl font-bold font-display text-gray-700 dark:text-gray-200 mb-4">{t('quickActions')}</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={onAddProductClick} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:from-primary-light hover:to-primary transition-all duration-300 transform hover:scale-105">
                        <PlusIcon className="h-5 w-5"/> {t('addNewProduct')}
                    </button>
                    <button onClick={onBulkImportClick} className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:from-gray-700 hover:to-gray-600 transition-all duration-300 transform hover:scale-105">
                        <UploadIcon className="h-5 w-5"/> {t('bulkImport')}
                    </button>
                </div>
            </div>
            
          {dashboardData.lowStockProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold font-display text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="h-6 w-6 text-secondary" /> {t('lowStockAlerts')}
              </h2>
              <ProductTable products={dashboardData.lowStockProducts.slice(0, 5)} compact />
            </div>
          )}

          {dashboardData.expiringSoonProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold font-display text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-yellow-500" /> {t('expiringSoon')}
              </h2>
              <ProductTable products={dashboardData.expiringSoonProducts.slice(0, 5)} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
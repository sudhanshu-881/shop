import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { ProductTable } from './ProductTable';
import { SearchIcon, UploadIcon } from './Icons';
import { useTranslations } from '../contexts';

interface InventoryProps {
  products: Product[];
  updateProductStock: (productId: string, newStock: number) => void;
  onBulkImportClick: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, updateProductStock, onBulkImportClick }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => [t('all'), ...new Set(products.map(p => p.category))], [products, t]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === t('all') || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter, t]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
      <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{t('fullInventory')}</h1>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button 
            onClick={onBulkImportClick}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
        >
            <UploadIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{t('bulkImport')}</span>
        </button>
      </div>

      {/* Product Table */}
      <ProductTable products={filteredProducts} onStockUpdate={updateProductStock} />
    </div>
  );
};
import React from 'react';
import type { Product } from '../types';
import { useTranslations } from '../contexts';

interface ProductTableProps {
  products: Product[];
  compact?: boolean;
  onStockUpdate?: (productId: string, newStock: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, compact = false, onStockUpdate }) => {
  const { t } = useTranslations();
  
  const getProductDateInfo = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (product: Product) => {
    if (product.stock < product.lowStockThreshold) {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">{t('lowStock')}</span>;
    }
    const diffDays = getProductDateInfo(product.expiryDate);
    if (diffDays <= 7 && diffDays >= 0) {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">{t('expiringSoon')}</span>;
    }
    if (diffDays < 0) {
       return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{t('expired')}</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-teal-800 bg-teal-100 rounded-full">{t('inStock')}</span>;
  };

  const getRowClass = (product: Product) => {
    const diffDays = getProductDateInfo(product.expiryDate);

    if (diffDays < 0) {
      return 'bg-gray-100 dark:bg-gray-800 opacity-60'; // Expired
    }
    if (product.stock < product.lowStockThreshold) {
      return 'bg-red-50 dark:bg-red-900/20'; // Low Stock
    }
    if (diffDays <= 7) {
      return 'bg-yellow-50 dark:bg-yellow-900/20'; // Expiring Soon
    }
    return '';
  };

  if (products.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noProducts')}</p>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('product')}</th>
            <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('stock')}</th>
            {!compact && <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('price')}</th>}
            {!compact && <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('expiryDate')}</th>}
            <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => (
            <tr key={product.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 ${getRowClass(product)}`}>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                     {product.variants && product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.variants.map(variant => (
                          <span key={variant} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full">{variant}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {onStockUpdate ? (
                   <input 
                     type="number"
                     value={product.stock}
                     onChange={(e) => onStockUpdate(product.id, parseInt(e.target.value) || 0)}
                     className="w-20 p-1 border rounded bg-transparent dark:bg-gray-900/50 border-gray-300 dark:border-gray-600"
                   />
                ) : product.stock}
              </td>
              {!compact && <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">₹{product.price.toFixed(2)}</td>}
              {!compact && <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{product.expiryDate}</td>}
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatus(product)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
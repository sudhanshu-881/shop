import React, { useState } from 'react';
import type { Product } from './types';
import { CloseIcon, UploadIcon } from './Icons';
import { useTranslations } from './contexts';

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (products: Omit<Product, 'id'>[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onImport }) => {
  const { t } = useTranslations();
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    setError('');
    if (!csvText.trim()) {
      setError(t('importError'));
      return;
    }

    const lines = csvText.trim().split('\n');
    const newProducts: Omit<Product, 'id'>[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue; // Skip empty lines
        const [name, category, stockStr, lowStockThresholdStr, costStr, priceStr, expiryDate, supplierId, variantsStr] = line.split(',');

        if (!name || !category || !stockStr || !lowStockThresholdStr || !costStr || !priceStr || !expiryDate || !supplierId) {
          throw new Error(`Invalid data on line ${i + 1}. Each line must have at least 8 comma-separated values.`);
        }

        const stock = parseInt(stockStr, 10);
        const lowStockThreshold = parseInt(lowStockThresholdStr, 10);
        const cost = parseFloat(costStr);
        const price = parseFloat(priceStr);

        if (isNaN(stock) || isNaN(lowStockThreshold) || isNaN(cost) || isNaN(price)) {
            throw new Error(`Invalid number format on line ${i + 1}. Stock, low stock threshold, cost, and price must be numbers.`);
        }

        newProducts.push({
          name: name.trim(),
          category: category.trim(),
          stock,
          lowStockThreshold,
          cost,
          price,
          expiryDate: expiryDate.trim(),
          supplierId: supplierId.trim(),
          variants: variantsStr ? variantsStr.split('|').map(v => v.trim()) : [],
          imageUrl: `https://picsum.photos/seed/${name.trim().replace(/\s+/g, '')}/200`,
        });
      }
      onImport(newProducts);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during parsing.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleImport();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl animate-scale-in">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <UploadIcon className="h-6 w-6" />
            {t('modalImportTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="h-6 w-6"/>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
              <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  <h3 className="font-bold text-primary-dark dark:text-primary-light mb-2">{t('importInstructions')}</h3>
                  <p>{t('importInfo')}</p>
                  <p className="mt-2"><strong>{t('importFormat')}</strong></p>
                  <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs mt-1">
                      name,category,stock,lowStockThreshold,cost,price,expiryDate(YYYY-MM-DD),supplierId,variants(pipe|separated)
                  </code>
                   <p className="mt-2"><strong>{t('importExample')}</strong></p>
                  <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs mt-1">
                      Good Day Cookies,Biscuits,50,15,15,20,2025-10-20,supp_123,Cashew|Butter
                  </code>
              </div>

              <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={t('importPlaceholder')}
                  rows={10}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />

              {error && <p className="text-sm text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">{error}</p>}
          
              <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                  <button type="submit" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-5 rounded-lg hover:from-primary-light hover:to-primary transition-all">{t('importButton')}</button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};
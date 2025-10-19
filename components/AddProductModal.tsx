import React, { useState, KeyboardEvent } from 'react';
import type { Product, Supplier } from '../types';
import { CloseIcon, BarcodeIcon } from './Icons';
import { useTranslations } from '../contexts';
import { BarcodeScanner } from './BarcodeScanner';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  suppliers: Supplier[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddProduct, suppliers }) => {
  const { t } = useTranslations();
  const [product, setProduct] = useState({
    name: '',
    category: '',
    stock: '' as number | '',
    lowStockThreshold: 10 as number | '',
    price: '' as number | '',
    cost: '' as number | '',
    expiryDate: '',
    supplierId: suppliers.length > 0 ? suppliers[0].id : '',
    imageUrl: `https://picsum.photos/seed/${Date.now()}/200`,
    barcode: '',
  });

  const [variants, setVariants] = useState<string[]>([]);
  const [currentVariant, setCurrentVariant] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isScanning, setIsScanning] = useState(false);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!product.name.trim()) newErrors.name = "Product name is required.";
    if (!product.category.trim()) newErrors.category = "Category is required.";
    if (product.cost === '' || Number(product.cost) < 0) newErrors.cost = "Cost price must be a non-negative number.";
    if (product.price === '' || Number(product.price) <= 0) newErrors.price = "Selling price must be a positive number.";
    if (product.stock === '' || !Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) newErrors.stock = "Stock must be a non-negative integer.";
    if (product.lowStockThreshold === '' || !Number.isInteger(Number(product.lowStockThreshold)) || Number(product.lowStockThreshold) < 0) newErrors.lowStockThreshold = "Low stock threshold must be a non-negative integer.";
    if (!product.expiryDate) {
        newErrors.expiryDate = "Expiry date is required.";
    } else if (new Date(product.expiryDate) < new Date(new Date().setHours(0,0,0,0))) {
        newErrors.expiryDate = "Expiry date cannot be in the past.";
    }
    if (!product.supplierId) newErrors.supplierId = "A supplier must be selected.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAddVariant = () => {
    if (currentVariant.trim() && !variants.includes(currentVariant.trim())) {
      setVariants([...variants, currentVariant.trim()]);
      setCurrentVariant('');
    }
  };
  
  const handleVariantKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariant();
    }
  };

  const handleRemoveVariant = (variantToRemove: string) => {
    setVariants(variants.filter(v => v !== variantToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalProduct = {
          ...product,
          stock: Number(product.stock),
          lowStockThreshold: Number(product.lowStockThreshold),
          price: Number(product.price),
          cost: Number(product.cost),
          variants
      };
      onAddProduct(finalProduct as Omit<Product, 'id'>);
    }
  };

  const handleScanSuccess = (scannedBarcode: string) => {
      setProduct(prev => ({...prev, barcode: scannedBarcode }));
      setIsScanning(false);
  }

  const inputClass = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-primary focus:border-primary";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <>
      {isScanning && <BarcodeScanner onScan={handleScanSuccess} onClose={() => setIsScanning(false)} />}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">{t('modalAddTitle')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <CloseIcon className="h-6 w-6"/>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('productName')}</label>
                <input type="text" name="name" value={product.name} onChange={handleChange} className={inputClass} aria-invalid={!!errors.name} />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('category')}</label>
                <input type="text" name="category" value={product.category} onChange={handleChange} className={inputClass} aria-invalid={!!errors.category} />
                {errors.category && <p className={errorClass}>{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('barcode')}</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  name="barcode"
                  value={product.barcode}
                  onChange={handleChange}
                  className={inputClass + " mt-0"}
                  placeholder={t('scanBarcodePlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold p-2.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                  aria-label={t('scanBarcode')}
                >
                  <BarcodeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('costPrice')} (₹)</label>
                <input type="number" name="cost" step="0.01" value={product.cost} onChange={handleChange} className={inputClass} aria-invalid={!!errors.cost} />
                {errors.cost && <p className={errorClass}>{errors.cost}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('sellingPrice')} (₹)</label>
                <input type="number" name="price" step="0.01" value={product.price} onChange={handleChange} className={inputClass} aria-invalid={!!errors.price} />
                {errors.price && <p className={errorClass}>{errors.price}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('stock')}</label>
                <input type="number" name="stock" value={product.stock} onChange={handleChange} className={inputClass} aria-invalid={!!errors.stock} />
                {errors.stock && <p className={errorClass}>{errors.stock}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('lowStockAt')}</label>
                <input type="number" name="lowStockThreshold" value={product.lowStockThreshold} onChange={handleChange} className={inputClass} aria-invalid={!!errors.lowStockThreshold} />
                {errors.lowStockThreshold && <p className={errorClass}>{errors.lowStockThreshold}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className={labelClass}>{t('supplier')}</label>
                  <select name="supplierId" value={product.supplierId} onChange={handleChange} className={inputClass} aria-invalid={!!errors.supplierId}>
                    {suppliers.length === 0 ? (
                      <option value="" disabled>{t('noSuppliers')}</option>
                    ) : (
                      suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    )}
                  </select>
                  {errors.supplierId && <p className={errorClass}>{errors.supplierId}</p>}
              </div>
              <div>
                  <label className={labelClass}>{t('expiryDate')}</label>
                  <input type="date" name="expiryDate" value={product.expiryDate} onChange={handleChange} className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} aria-invalid={!!errors.expiryDate} />
                  {errors.expiryDate && <p className={errorClass}>{errors.expiryDate}</p>}
              </div>
            </div>
            
            <div>
              <label className={labelClass}>{t('variantsLabel')}</label>
              <div className="flex mt-1">
                  <input 
                      type="text"
                      value={currentVariant}
                      onChange={(e) => setCurrentVariant(e.target.value)}
                      onKeyDown={handleVariantKeyDown}
                      placeholder={t('variantsPlaceholder')}
                      className="flex-grow border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm p-2 bg-white dark:bg-gray-700"
                  />
                  <button type="button" onClick={handleAddVariant} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('add')}</button>
              </div>
              {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                      {variants.map(v => (
                          <span key={v} className="flex items-center gap-1 bg-primary/10 text-primary dark:text-primary-light text-sm font-medium px-2 py-1 rounded-full">
                              {v}
                              <button type="button" onClick={() => handleRemoveVariant(v)} className="text-primary dark:text-primary-light hover:text-primary-dark">
                                  <CloseIcon className="h-3 w-3" />
                              </button>
                          </span>
                      ))}
                  </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
              <button type="submit" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-5 rounded-lg hover:from-primary-light hover:to-primary transition-all">{t('addProduct')}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
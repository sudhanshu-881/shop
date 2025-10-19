import React, { useState, useMemo } from 'react';
import type { Supplier, SupplierTransaction } from '../types';
import { useTranslations } from '../contexts';
import { PlusIcon, SearchIcon, CloseIcon, ClipboardListIcon } from './Icons';

// --- Modals (kept in the same file for simplicity) ---

interface AddSupplierModalProps {
  onClose: () => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'balance'>) => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ onClose, onAddSupplier }) => {
    const { t } = useTranslations();
    const [supplier, setSupplier] = useState({ name: '', contactPerson: '', phone: '', address: ''});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!supplier.name.trim()) newErrors.name = "Supplier name is required.";
        if (!supplier.contactPerson.trim()) newErrors.contactPerson = "Contact person is required.";
        if (!/^\d{10}$/.test(supplier.phone.trim())) newErrors.phone = "Please enter a valid 10-digit phone number.";
        if (!supplier.address.trim()) newErrors.address = "Address is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSupplier({...supplier, [name]: value});
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onAddSupplier(supplier);
            onClose();
        }
    };
    
    const inputClass = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-primary focus:border-primary";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">{t('addSupplier')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('supplierName')}</label>
                        <input type="text" name="name" value={supplier.name} onChange={handleChange} className={inputClass} aria-invalid={!!errors.name} />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('contactPerson')}</label>
                        <input type="text" name="contactPerson" value={supplier.contactPerson} onChange={handleChange} className={inputClass} aria-invalid={!!errors.contactPerson} />
                        {errors.contactPerson && <p className={errorClass}>{errors.contactPerson}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customerPhone')}</label>
                        <input type="tel" name="phone" value={supplier.phone} onChange={handleChange} className={inputClass} aria-invalid={!!errors.phone} />
                        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address')}</label>
                        <input type="text" name="address" value={supplier.address} onChange={handleChange} className={inputClass} aria-invalid={!!errors.address} />
                        {errors.address && <p className={errorClass}>{errors.address}</p>}
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-5 rounded-lg hover:from-primary-light hover:to-primary transition-all">{t('addSupplier')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AddTransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<SupplierTransaction, 'id' | 'date'>) => void;
    supplierId: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, supplierId }) => {
    const { t } = useTranslations();
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState<'purchase' | 'payment'>('purchase');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount === 'number' && amount > 0) {
            onAddTransaction({ supplierId, amount, type });
            onClose();
        } else {
             setError("Amount must be a positive number.");
        }
    };
    
    const inputClass = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-primary focus:border-primary";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">{t('addTransaction')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')}</label>
                        <input type="number" value={amount} onChange={e => { setAmount(e.target.value === '' ? '' : parseFloat(e.target.value)); setError(''); }} min="0.01" step="0.01" className={inputClass} aria-invalid={!!error} />
                        {error && <p className={errorClass}>{error}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('transactionType')}</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className={inputClass}>
                            <option value="purchase">{t('purchase')}</option>
                            <option value="payment">{t('payment')}</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-5 rounded-lg hover:from-primary-light hover:to-primary transition-all">{t('saveTransaction')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Main Suppliers Component ---

interface SuppliersProps {
    suppliers: Supplier[];
    transactions: SupplierTransaction[];
    onAddSupplier: (supplier: Omit<Supplier, 'id' | 'balance'>) => void;
    onAddTransaction: (transaction: Omit<SupplierTransaction, 'id' | 'date'>) => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({ suppliers, transactions, onAddSupplier, onAddTransaction }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isAddSupplierModalOpen, setAddSupplierModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setAddTransactionModalOpen] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [suppliers, searchTerm]);
  
  const selectedSupplierTransactions = useMemo(() => {
      if (!selectedSupplier) return [];
      return transactions.filter(t => t.supplierId === selectedSupplier.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedSupplier]);
  
  const handleSelectSupplier = (supplier: Supplier) => {
      setSelectedSupplier(supplier);
  }

  if (selectedSupplier) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <button onClick={() => setSelectedSupplier(null)} className="text-primary dark:text-primary-light font-semibold mb-4">&larr; {t('backToList')}</button>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-2 mb-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{selectedSupplier.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{selectedSupplier.contactPerson} - {selectedSupplier.phone}</p>
                </div>
                <div className="sm:text-right w-full sm:w-auto">
                     <p className="text-sm text-gray-500 dark:text-gray-400">{t('balance')}</p>
                    <p className={`text-2xl font-bold ${selectedSupplier.balance > 0 ? 'text-error' : 'text-success'}`}>
                      ₹{selectedSupplier.balance.toFixed(2)}
                    </p>
                </div>
            </div>
            <button onClick={() => setAddTransactionModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:from-primary-light hover:to-primary transition-colors mb-4">
              <PlusIcon className="h-5 w-5" /> {t('addTransaction')}
            </button>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">{t('transactionHistory')}</h3>
            <div className="overflow-y-auto max-h-96">
                {selectedSupplierTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noTransactions')}</p>
                ) : (
                    <ul className="space-y-2">
                        {selectedSupplierTransactions.map(tx => (
                            <li key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className={`font-semibold ${tx.type === 'purchase' ? 'text-error' : 'text-success'}`}>{t(tx.type)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                                </div>
                                <p className={`font-bold text-lg ${tx.type === 'purchase' ? 'text-error' : 'text-success'}`}>
                                    {tx.type === 'purchase' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isAddTransactionModalOpen && <AddTransactionModal supplierId={selectedSupplier.id} onClose={() => setAddTransactionModalOpen(false)} onAddTransaction={onAddTransaction} />}
        </div>
      );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{t('supplierKhata')}</h1>
            <button onClick={() => setAddSupplierModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:from-primary-light hover:to-primary transition-colors">
                <PlusIcon className="h-5 w-5" /> {t('addSupplier')}
            </button>
        </div>
        
        <div className="relative">
            <input
                type="text"
                placeholder={t('searchSupplier')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
            {filteredSuppliers.length === 0 ? (
                 <div className="text-center py-10 px-4">
                    <ClipboardListIcon className="h-12 w-12 mx-auto text-gray-400"/>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noSuppliersFound')}</p>
                 </div>
            ) : (
                <ul className="space-y-3">
                    {filteredSuppliers.map(supplier => (
                        <li key={supplier.id} onClick={() => handleSelectSupplier(supplier)} className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all bg-gray-50 hover:bg-primary/10 dark:bg-gray-700/50 dark:hover:bg-primary/20 hover:shadow-md">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{supplier.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.contactPerson}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('balance')}</p>
                                <p className={`font-bold text-lg ${supplier.balance > 0 ? 'text-error' : 'text-success'}`}>
                                    ₹{supplier.balance.toFixed(2)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {isAddSupplierModalOpen && <AddSupplierModal onClose={() => setAddSupplierModalOpen(false)} onAddSupplier={onAddSupplier} />}
    </div>
  );
};
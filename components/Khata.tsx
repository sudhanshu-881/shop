import React, { useState, useMemo } from 'react';
import type { Customer, Transaction } from '../types';
import { useTranslations } from '../contexts';
import { PlusIcon, SearchIcon, CloseIcon, UsersIcon } from './Icons';

// --- Modals (kept in the same file for simplicity) ---

interface AddCustomerModalProps {
  onClose: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onAddCustomer }) => {
    const { t } = useTranslations();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = "Customer name is required.";
        if (!/^\d{10}$/.test(phone.trim())) newErrors.phone = "Please enter a valid 10-digit phone number.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onAddCustomer({ name, phone });
            onClose();
        }
    };
    
    const inputClass = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-primary focus:border-primary";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">{t('addCustomer')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customerName')}</label>
                        <input type="text" value={name} onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({...p, name: ''})) }} className={inputClass} aria-invalid={!!errors.name} />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customerPhone')}</label>
                        <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({...p, phone: ''})) }} className={inputClass} aria-invalid={!!errors.phone} />
                        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-5 rounded-lg hover:from-primary-light hover:to-primary transition-all">{t('addCustomer')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AddTransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
    customerId: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, customerId }) => {
    const { t } = useTranslations();
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState<'credit' | 'payment'>('credit');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount === 'number' && amount > 0) {
            onAddTransaction({ customerId, amount, type });
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
                            <option value="credit">{t('credit')}</option>
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

// --- Main Khata Component ---

interface KhataProps {
    customers: Customer[];
    transactions: Transaction[];
    onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export const Khata: React.FC<KhataProps> = ({ customers, transactions, onAddCustomer, onAddTransaction }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setAddTransactionModalOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [customers, searchTerm]);
  
  const selectedCustomerTransactions = useMemo(() => {
      if (!selectedCustomer) return [];
      return transactions.filter(t => t.customerId === selectedCustomer.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedCustomer]);
  
  const handleSelectCustomer = (customer: Customer) => {
      setSelectedCustomer(customer);
  }

  if (selectedCustomer) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
            <button onClick={() => setSelectedCustomer(null)} className="text-primary dark:text-primary-light font-semibold mb-4">&larr; {t('backToList')}</button>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-2 mb-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{selectedCustomer.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>
                </div>
                <div className="sm:text-right w-full sm:w-auto">
                     <p className="text-sm text-gray-500 dark:text-gray-400">{t('balance')}</p>
                    <p className={`text-2xl font-bold ${selectedCustomer.balance > 0 ? 'text-error' : 'text-success'}`}>
                      ₹{selectedCustomer.balance.toFixed(2)}
                    </p>
                </div>
            </div>
            <button onClick={() => setAddTransactionModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:from-primary-light hover:to-primary transition-colors mb-4">
              <PlusIcon className="h-5 w-5" /> {t('addTransaction')}
            </button>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">{t('transactionHistory')}</h3>
            <div className="overflow-y-auto max-h-96">
                {selectedCustomerTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noTransactions')}</p>
                ) : (
                    <ul className="space-y-2">
                        {selectedCustomerTransactions.map(tx => (
                            <li key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className={`font-semibold ${tx.type === 'credit' ? 'text-error' : 'text-success'}`}>{t(tx.type)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                                </div>
                                <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-error' : 'text-success'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isAddTransactionModalOpen && <AddTransactionModal customerId={selectedCustomer.id} onClose={() => setAddTransactionModalOpen(false)} onAddTransaction={onAddTransaction} />}
        </div>
      );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{t('customerKhata')}</h1>
            <button onClick={() => setAddCustomerModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:from-primary-light hover:to-primary transition-colors">
                <PlusIcon className="h-5 w-5" /> {t('addCustomer')}
            </button>
        </div>
        
        <div className="relative">
            <input
                type="text"
                placeholder={t('searchCustomer')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
            {filteredCustomers.length === 0 ? (
                 <div className="text-center py-10 px-4">
                    <UsersIcon className="h-12 w-12 mx-auto text-gray-400"/>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noCustomers')}</p>
                 </div>
            ) : (
                <ul className="space-y-3">
                    {filteredCustomers.map(customer => (
                        <li key={customer.id} onClick={() => handleSelectCustomer(customer)} className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all bg-gray-50 hover:bg-primary/10 dark:bg-gray-700/50 dark:hover:bg-primary/20 hover:shadow-md">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{customer.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('balance')}</p>
                                <p className={`font-bold text-lg ${customer.balance > 0 ? 'text-error' : 'text-success'}`}>
                                    ₹{customer.balance.toFixed(2)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {isAddCustomerModalOpen && <AddCustomerModal onClose={() => setAddCustomerModalOpen(false)} onAddCustomer={onAddCustomer} />}
    </div>
  );
};
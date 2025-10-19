import React, { useMemo } from 'react';
import type { Product, Customer, Supplier } from '../types';
import { useTranslations } from '../contexts';
import { StatCard } from './StatCard';
import { InventoryIcon, UsersIcon, ClipboardListIcon } from './Icons';

interface AnalyticsProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
}

const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#F97316'];

const DonutChart: React.FC<{ data: { label: string; value: number }[], title: string }> = ({ data, title }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex items-center justify-center text-gray-500">{title} - No Data</div>;

    let cumulative = 0;
    const gradients = data.map((item, index) => {
        const start = (cumulative / total) * 100;
        const end = ((cumulative + item.value) / total) * 100;
        cumulative += item.value;
        return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    });
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-lg font-bold font-display text-gray-700 dark:text-gray-200 mb-4 text-center">{title}</h3>
            <div className="flex justify-center items-center my-4">
                <div 
                    className="w-48 h-48 rounded-full flex justify-center items-center"
                    style={{ background: `conic-gradient(${gradients.join(', ')})` }}
                >
                    <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full"></div>
                </div>
            </div>
            <ul className="space-y-2">
                {data.map((item, index) => (
                    <li key={item.label} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.value} ({(item.value / total * 100).toFixed(1)}%)</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[], title: string, unit?: string, suffix?: string }> = ({ data, title, unit = '', suffix = '' }) => {
    if (data.length === 0) return <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex items-center justify-center text-gray-500">{title} - No Data</div>;
    
    const maxValue = Math.max(...data.map(d => d.value), 0);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold font-display text-gray-700 dark:text-gray-200 mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-4 text-sm">
                        <span className="w-20 sm:w-24 truncate text-gray-600 dark:text-gray-400" title={item.label}>{item.label}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                            <div 
                                className="h-6 rounded-full text-white text-xs flex items-center px-2 transition-all duration-1000"
                                style={{ 
                                    width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                }}
                            >
                                {unit}{item.value.toLocaleString(undefined, {maximumFractionDigits: 1})}{suffix}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const Analytics: React.FC<AnalyticsProps> = ({ products, customers, suppliers }) => {
  const { t } = useTranslations();

  const analyticsData = useMemo(() => {
    const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
    const totalDues = customers.reduce((acc, c) => acc + c.balance, 0);
    const totalSupplierDues = suppliers.reduce((acc, s) => acc + s.balance, 0);

    const stockStatus = {
        inStock: products.filter(p => p.stock >= p.lowStockThreshold && new Date(p.expiryDate) >= new Date()).length,
        lowStock: products.filter(p => p.stock < p.lowStockThreshold).length,
        expired: products.filter(p => new Date(p.expiryDate) < new Date()).length
    };
    
    const valueByCategory = products.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = 0;
        acc[p.category] += p.stock * p.price;
        return acc;
    }, {} as Record<string, number>);

    const profitByCategory = products.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = { totalRevenue: 0, totalCost: 0 };
        acc[p.category].totalRevenue += p.stock * p.price;
        acc[p.category].totalCost += p.stock * p.cost;
        return acc;
    }, {} as Record<string, { totalRevenue: number, totalCost: number }>);
    
    const profitMarginByCategory = Object.entries(profitByCategory).map(([category, data]) => {
        const margin = data.totalRevenue > 0 ? ((data.totalRevenue - data.totalCost) / data.totalRevenue) * 100 : 0;
        return { label: category, value: margin };
    }).sort((a,b) => b.value - a.value);

    return {
      totalInventoryValue,
      totalDues,
      totalSupplierDues,
      stockStatus: [
        { label: t('inStock'), value: stockStatus.inStock },
        { label: t('lowStock'), value: stockStatus.lowStock },
        { label: t('expired'), value: stockStatus.expired }
      ],
      valueByCategory: Object.entries(valueByCategory)
        .map(([label, value]) => ({ label, value }))
        .sort((a,b) => b.value - a.value),
      profitMarginByCategory
    };
  }, [products, customers, suppliers, t]);

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{t('analyticsOverview')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title={t('totalInventoryValue')}
                value={`₹${analyticsData.totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                icon={<InventoryIcon className="h-8 w-8" />} 
                color="primary" 
            />
            <StatCard 
                title={t('totalCustomerDues')}
                value={`₹${analyticsData.totalDues.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                icon={<UsersIcon className="h-8 w-8" />} 
                color="success" 
            />
            <StatCard 
                title={t('totalSupplierDues')}
                value={`₹${analyticsData.totalSupplierDues.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                icon={<ClipboardListIcon className="h-8 w-8" />} 
                color="warning" 
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DonutChart data={analyticsData.stockStatus} title={t('stockStatus')} />
            <BarChart data={analyticsData.valueByCategory} title={t('valueByCategory')} unit="₹" />
        </div>
        <div className="grid grid-cols-1 gap-8">
            <BarChart data={analyticsData.profitMarginByCategory} title={t('profitMarginByCategory')} suffix="%" />
        </div>
    </div>
  );
};
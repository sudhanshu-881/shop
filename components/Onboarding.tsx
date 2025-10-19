import React, { useState } from 'react';
import { useTranslations } from '../contexts';
import type { Language } from '../types';

interface OnboardingProps {
  onComplete: (shopName: string, shopType: string, language: Language) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t, setLanguage, language } = useTranslations();
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopName.trim() && category.trim()) {
      onComplete(shopName.trim(), category.trim(), selectedLang);
    }
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLang = e.target.value as Language;
      setSelectedLang(newLang);
      setLanguage(newLang);
  }

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary";

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display text-gray-800">{t('welcome')}</h1>
          <p className="mt-2 text-gray-600">{t('setup')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
              {t('shopNameLabel')}
            </label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className={inputClass}
              placeholder={t('shopNamePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              {t('shopTypeLabel')}
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={inputClass}
              placeholder={t('shopTypePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                {t('languageLabel')}
            </label>
            <select
                id="language"
                value={selectedLang}
                onChange={handleLanguageChange}
                className={inputClass}
            >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
            >
              {t('getStarted')}
            </button>
          </div>
        </form>
         <div className="text-center text-xs text-gray-400">
          <p>&copy; 2024 InvenShop - Empowering Local Retail</p>
        </div>
      </div>
    </div>
  );
};
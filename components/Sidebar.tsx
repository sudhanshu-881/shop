import React from 'react';
import type { View } from '../types';
import { DashboardIcon, InventoryIcon, CloseIcon, UsersIcon, ChartBarIcon, ClipboardListIcon } from './Icons';
import { useTranslations } from '../contexts';
import { ThemeSwitcher } from './ThemeSwitcher';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  shopName: string;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`
        flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-gradient-to-r from-white/20 to-white/5 text-white shadow-inner'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="ml-4 font-semibold text-sm tracking-wide">{label}</span>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, isOpen, setIsOpen, shopName }) => {
  const { t } = useTranslations();
  const handleSetView = (newView: View) => {
    setView(newView);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`absolute md:relative z-30 flex flex-col h-full bg-gradient-to-b from-primary to-primary-dark text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64`}>
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h1 className="text-2xl font-display font-bold">{shopName}</h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1">
             <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul>
            <NavItem
              label={t('dashboard')}
              icon={<DashboardIcon className="h-5 w-5" />}
              isActive={view === 'dashboard'}
              onClick={() => handleSetView('dashboard')}
            />
            <NavItem
              label={t('inventory')}
              icon={<InventoryIcon className="h-5 w-5" />}
              isActive={view === 'inventory'}
              onClick={() => handleSetView('inventory')}
            />
             <NavItem
              label={t('khata')}
              icon={<UsersIcon className="h-5 w-5" />}
              isActive={view === 'khata'}
              onClick={() => handleSetView('khata')}
            />
             <NavItem
              label={t('suppliers')}
              icon={<ClipboardListIcon className="h-5 w-5" />}
              isActive={view === 'suppliers'}
              onClick={() => handleSetView('suppliers')}
            />
            <NavItem
              label={t('analytics')}
              icon={<ChartBarIcon className="h-5 w-5" />}
              isActive={view === 'analytics'}
              onClick={() => handleSetView('analytics')}
            />
          </ul>
        </nav>
        <div className="p-4 border-t border-white/20 flex justify-between items-center text-xs text-gray-300">
          <div>
            <p>&copy; 2024 InvenShop</p>
            <p>Empowering Local Retail</p>
          </div>
          <ThemeSwitcher />
        </div>
      </aside>
    </>
  );
};
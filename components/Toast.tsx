import React, { useEffect } from 'react';
import type { Notification } from '../types';
import { CloseIcon, MailIcon } from './Icons';

interface ToastProps {
  notification: Notification;
  onClose: (id: number) => void;
}

const typeClasses = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};


export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [notification.id, onClose]);

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg text-white ${typeClasses[notification.type]} animate-fade-in-right`}>
      <div className="flex-shrink-0">
        <MailIcon className="h-6 w-6" />
      </div>
      <div className="ml-3 text-sm font-medium">
        {notification.message}
      </div>
      <button onClick={() => onClose(notification.id)} className="ml-4 -mr-2 p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
        <CloseIcon className="h-4 w-4" />
      </button>
      <style>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

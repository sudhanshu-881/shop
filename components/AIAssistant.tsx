import React, { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/apiService';
import type { Product, Message, Supplier } from '../types';
import { SparklesIcon, SendIcon } from './Icons';
import { useTranslations } from '../contexts';

interface DukaanMitraProps {
  products: Product[];
  suppliers: Supplier[];
  shopType: string;
}

const formatResponse = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/(\r\n|\n|\r)/gm, '<br>')
        .replace(/<br>\*/g, '<ul>*')
        .replace(/\* (.*?)(<br>|$)/g, '<li class="flex items-start mb-1"><span class="mr-2 mt-1 text-primary">&#8226;</span><span>$1</span></li>')
        .replace(/\*<\/ul>/g, '*');
};

const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

export const DukaanMitra: React.FC<DukaanMitraProps> = ({ products, suppliers, shopType }) => {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: t('aiWelcome') }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await apiService.askDukaanMitra(query, products, suppliers, shopType);
      setMessages([...newMessages, { sender: 'ai', text: result }]);
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : "Sorry, I encountered an error. Please try again.";
      setMessages([...newMessages, { sender: 'ai', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, products, suppliers, shopType]);
  
  const suggestions = [t('aiSuggestion1'), t('aiSuggestion2'), t('aiSuggestion5'), t('aiSuggestion4')];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg h-full flex flex-col max-h-[75vh]">
      <div className="flex items-center gap-3 mb-4 border-b dark:border-gray-700 pb-3">
        <SparklesIcon className="h-7 w-7 text-primary" />
        <h2 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">{t('aiTitle')}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>}
            <div
              className={`max-w-xs md:max-w-sm lg:max-w-md p-3 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary-light text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }} />
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"><SparklesIcon className="w-5 h-5"/></div>
                 <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                    <TypingIndicator />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto pt-2 border-t dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-2">
            {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSendMessage(s)} className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-light text-xs font-medium rounded-full hover:bg-primary/20 transition-colors">
                    {s}
                </button>
            ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t('aiPlaceholder')}
            disabled={isLoading}
            className="flex-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-600"
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-primary text-white p-3 rounded-full shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-110">
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
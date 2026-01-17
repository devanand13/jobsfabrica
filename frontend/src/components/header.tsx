'use client';

import { useState } from 'react';
import ThemeToggle from './theme-toggle';
import { APP_CONFIG, ROUTES } from '@/lib/constants';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {APP_CONFIG.name[0]}
                </span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {APP_CONFIG.name}
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {APP_CONFIG.nav.main.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {isLoggedIn ? (
              <button
                onClick={() => setIsLoggedIn(false)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium hover:shadow-lg transition-shadow"
              >
                JD
              </button>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                {APP_CONFIG.auth.loginText}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
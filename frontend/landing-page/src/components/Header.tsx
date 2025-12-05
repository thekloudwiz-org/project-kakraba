import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold text-white">Kakraba</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/creator/" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/creator/';
              }}
            >
              For Creators
            </a>
            <a 
              href="/fan/" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/fan/';
              }}
            >
              For Fans
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

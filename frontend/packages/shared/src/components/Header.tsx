import React from 'react';

export interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ logo, navigation, actions }) => {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* Navigation */}
        {navigation && (
          <nav className="hidden md:flex items-center space-x-6">
            {navigation}
          </nav>
        )}

        {/* Actions (e.g., user menu, notifications) */}
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export interface HeaderLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const HeaderLink: React.FC<HeaderLinkProps> = ({ href, children, isActive = false }) => {
  return (
    <a
      href={href}
      className={`
        text-sm font-medium transition-colors
        ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}
      `}
    >
      {children}
    </a>
  );
};

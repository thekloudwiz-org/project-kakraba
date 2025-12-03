import React from 'react';

export interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className="h-full py-6 px-3">
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
};

export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  badge?: React.ReactNode;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive = false, badge }) => {
  return (
    <a
      href={href}
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{label}</span>
      </div>
      {badge && <span>{badge}</span>}
    </a>
  );
};

export interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

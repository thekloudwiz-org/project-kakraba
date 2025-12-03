import React from 'react';

export interface FooterProps {
  links?: Array<{ label: string; href: string }>;
  copyright?: string;
  socialLinks?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({ links, copyright, socialLinks }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Links */}
          {links && links.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Copyright */}
          <p className="text-sm text-gray-600">
            {copyright || `© ${currentYear} Kakraba. All rights reserved.`}
          </p>

          {/* Social Links */}
          {socialLinks && (
            <div className="flex items-center space-x-4">
              {socialLinks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

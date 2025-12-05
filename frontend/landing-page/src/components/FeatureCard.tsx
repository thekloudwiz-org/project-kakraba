import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

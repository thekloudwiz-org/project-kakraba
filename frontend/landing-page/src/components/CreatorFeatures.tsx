import React from 'react';
import { FeatureCard } from './FeatureCard';

export const CreatorFeatures: React.FC = () => {
  const features = [
    {
      icon: '🎨',
      title: 'Upload Your Content',
      description: 'Share your audio, video, PDFs, and images with your fans. Easy upload with drag-and-drop support.',
    },
    {
      icon: '💰',
      title: 'Set Your Prices',
      description: 'Create products, bundles, and subscriptions. You control the pricing and access rules.',
    },
    {
      icon: '📊',
      title: 'Track Your Success',
      description: 'Comprehensive analytics dashboard showing revenue, engagement, and content performance.',
    },
    {
      icon: '🔒',
      title: 'Secure & Protected',
      description: 'Your content is protected with secure delivery and access controls. You own your work.',
    },
  ];

  return (
    <section id="creators" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Fans Are Waiting
          </h2>
          <p className="text-2xl text-purple-400 font-semibold mb-4">
            Upload Your Content Now
          </p>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of creators who are building their business and connecting
            with fans on Kakraba.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/creator/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/creator/';
            }}
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50"
          >
            Start Creating Today
          </a>
        </div>
      </div>
    </section>
  );
};

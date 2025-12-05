import React from 'react';
import { FeatureCard } from './FeatureCard';

export const FanFeatures: React.FC = () => {
  const features = [
    {
      icon: '🔍',
      title: 'Discover Amazing Content',
      description: 'Browse and search through thousands of creators and their exclusive content.',
    },
    {
      icon: '💎',
      title: 'Own What You Love',
      description: 'Purchase content once and own it forever. Download or stream anytime, anywhere.',
    },
    {
      icon: '🎯',
      title: 'Flexible Access',
      description: 'Choose between one-time purchases or subscriptions. Get exactly what you want.',
    },
    {
      icon: '📱',
      title: 'Access Anywhere',
      description: 'Stream on any device or download for offline access. Your content, your way.',
    },
  ];

  return (
    <section id="fans" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Own It How You Want It
          </h2>
          <p className="text-2xl text-blue-400 font-semibold mb-4">
            Discover Amazing Creators and Get Started
          </p>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Support your favorite creators and get exclusive access to premium content
            you can't find anywhere else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/fan/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/fan/';
            }}
            className="inline-block px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg text-lg border-2 border-gray-700 transition-all hover:scale-105 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/50"
          >
            Start Exploring
          </a>
        </div>
      </div>
    </section>
  );
};

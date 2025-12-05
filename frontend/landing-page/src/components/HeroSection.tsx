import React from 'react';
import { CTAButtons } from './CTAButtons';
import { ValueProposition } from './ValueProposition';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-4" data-testid="hero-section">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Connect Creators
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              With Their Fans
            </span>
          </h1>

          {/* Value Proposition */}
          <ValueProposition />

          {/* CTA Buttons */}
          <CTAButtons />

          {/* Visual Element */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400">10K+</div>
                  <div className="text-gray-400 mt-2">Active Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-400">100K+</div>
                  <div className="text-gray-400 mt-2">Happy Fans</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">$1M+</div>
                  <div className="text-gray-400 mt-2">Creator Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

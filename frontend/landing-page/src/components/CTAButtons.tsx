import React from 'react';

export const CTAButtons: React.FC = () => {
  const handleCreatorClick = () => {
    // Scroll to creator section
    const creatorSection = document.getElementById('creators');
    if (creatorSection) {
      creatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFanClick = () => {
    // Scroll to fan section
    const fanSection = document.getElementById('fans');
    if (fanSection) {
      fanSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
      <button
        onClick={handleCreatorClick}
        className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 w-full sm:w-auto"
        aria-label="Scroll to Creator Section"
      >
        <span className="relative z-10">I'm a Creator</span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <button
        onClick={handleFanClick}
        className="group relative px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg text-lg border-2 border-gray-700 transition-all hover:scale-105 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/50 w-full sm:w-auto"
        aria-label="Scroll to Fan Section"
      >
        <span className="relative z-10">I'm a Fan</span>
      </button>
    </div>
  );
};

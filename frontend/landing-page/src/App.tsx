import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CreatorFeatures } from './components/CreatorFeatures';
import { FanFeatures } from './components/FanFeatures';
import { TestimonialSection } from './components/TestimonialSection';
import { LandingFooter } from './components/LandingFooter';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main>
        <HeroSection />
        <CreatorFeatures />
        <FanFeatures />
        <TestimonialSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default App;

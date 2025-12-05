import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Landing Page', () => {
  it('should render the hero section with main heading', () => {
    render(<App />);
    
    expect(screen.getByText(/Connect Creators/i)).toBeInTheDocument();
    // Use getAllByText since "With Their Fans" appears in multiple places
    const fanTexts = screen.getAllByText(/With Their Fans/i);
    expect(fanTexts.length).toBeGreaterThan(0);
  });

  it('should render both CTA buttons', () => {
    render(<App />);
    
    expect(screen.getByRole('button', { name: /creator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fan/i })).toBeInTheDocument();
  });

  it('should render creator features section with required message', () => {
    render(<App />);
    
    expect(screen.getByText(/Your Fans Are Waiting/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Your Content Now/i)).toBeInTheDocument();
  });

  it('should render fan features section with required message', () => {
    render(<App />);
    
    expect(screen.getByText(/Own It How You Want It/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover Amazing Creators and Get Started/i)).toBeInTheDocument();
  });

  it('should render testimonials section', () => {
    render(<App />);
    
    expect(screen.getByText(/Loved by Creators and Fans/i)).toBeInTheDocument();
  });

  it('should render footer with brand name', () => {
    render(<App />);
    
    const footerBrand = screen.getAllByText(/Kakraba/i);
    expect(footerBrand.length).toBeGreaterThan(0);
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<App />);
    
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});

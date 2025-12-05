import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { CTAButtons } from '../components/CTAButtons';

/**
 * Feature: creator-fan-portals, Property 0: Creator button redirects to creator portal
 * Validates: Requirements 0.3
 * 
 * For any click on the "I'm a Creator" button, the system should redirect to create-kakraba.thekloudwiz.com
 */
describe('Property 0: Creator button redirects to creator portal', () => {
  beforeEach(() => {
    // Reset window.location.href before each test
    window.location.href = 'http://localhost:3000';
  });

  it('should redirect to creator portal when creator button is clicked', async () => {
    // Property: For any number of clicks on the creator button,
    // the system should attempt to redirect to the creator portal
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of clicks
        async (clickCount) => {
          const user = userEvent.setup();
          const { unmount } = render(<CTAButtons />);
          
          const creatorButton = screen.getByLabelText('Go to Creator Portal');
          expect(creatorButton).toBeInTheDocument();
          
          // Click the button the specified number of times
          for (let i = 0; i < clickCount; i++) {
            await user.click(creatorButton);
          }
          
          // Verify the redirect URL is set to creator portal
          expect(window.location.href).toBe('https://create-kakraba.thekloudwiz.com');
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct ARIA label for accessibility', () => {
    render(<CTAButtons />);
    
    const creatorButton = screen.getByLabelText('Go to Creator Portal');
    expect(creatorButton).toBeInTheDocument();
    expect(creatorButton).toHaveTextContent(/creator/i);
  });
});

/**
 * Feature: creator-fan-portals, Property 0.1: Fan button redirects to fan portal
 * Validates: Requirements 0.4
 * 
 * For any click on the "I'm a Fan" button, the system should redirect to fan-kakraba.thekloudwiz.com
 */
describe('Property 0.1: Fan button redirects to fan portal', () => {
  beforeEach(() => {
    // Reset window.location.href before each test
    window.location.href = 'http://localhost:3000';
  });

  it('should redirect to fan portal when fan button is clicked', async () => {
    // Property: For any number of clicks on the fan button,
    // the system should attempt to redirect to the fan portal
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of clicks
        async (clickCount) => {
          const user = userEvent.setup();
          const { unmount } = render(<CTAButtons />);
          
          const fanButton = screen.getByLabelText('Go to Fan Portal');
          expect(fanButton).toBeInTheDocument();
          
          // Click the button the specified number of times
          for (let i = 0; i < clickCount; i++) {
            await user.click(fanButton);
          }
          
          // Verify the redirect URL is set to fan portal
          expect(window.location.href).toBe('https://fan-kakraba.thekloudwiz.com');
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct ARIA label for accessibility', () => {
    render(<CTAButtons />);
    
    const fanButton = screen.getByLabelText('Go to Fan Portal');
    expect(fanButton).toBeInTheDocument();
    expect(fanButton).toHaveTextContent(/fan/i);
  });
});

/**
 * Additional property: Both buttons should be independently functional
 * 
 * For any sequence of clicks on either button, each button should redirect to its respective portal
 */
describe('Property: Independent button functionality', () => {
  beforeEach(() => {
    window.location.href = 'http://localhost:3000';
  });

  it('should handle alternating clicks between creator and fan buttons', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 3 }), // true = creator, false = fan
        async (clickSequence) => {
          const user = userEvent.setup();
          const { unmount } = render(<CTAButtons />);
          
          const creatorButton = screen.getByLabelText('Go to Creator Portal');
          const fanButton = screen.getByLabelText('Go to Fan Portal');
          
          for (const isCreator of clickSequence) {
            // Reset location before each click
            window.location.href = 'http://localhost:3000';
            
            if (isCreator) {
              await user.click(creatorButton);
              expect(window.location.href).toBe('https://create-kakraba.thekloudwiz.com');
            } else {
              await user.click(fanButton);
              expect(window.location.href).toBe('https://fan-kakraba.thekloudwiz.com');
            }
          }
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 15000);
});

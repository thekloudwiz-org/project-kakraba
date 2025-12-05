import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.location
delete (window as { location?: Location }).location;
window.location = {
  href: '',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: () => {},
  reload: () => {},
  replace: () => {},
  ancestorOrigins: {} as DOMStringList,
  toString: () => 'http://localhost:3000/',
} as Location;

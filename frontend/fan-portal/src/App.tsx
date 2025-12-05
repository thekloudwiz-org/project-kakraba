import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@kakraba/shared';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PasswordResetPage = lazy(() => import('./pages/auth/PasswordResetPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename="/fan">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

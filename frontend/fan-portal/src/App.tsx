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
const LibraryPage = lazy(() => import('./pages/library/LibraryPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const CreatorProfilePage = lazy(() => import('./pages/creator/CreatorProfilePage'));
const ProductDetailPage = lazy(() => import('./pages/product/ProductDetailPage'));
const SubscriptionManagerPage = lazy(() => import('./pages/subscription/SubscriptionManagerPage'));
const PurchaseHistoryPage = lazy(() => import('./pages/PurchaseHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

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
              <Route path="/discover" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/creator/:id" element={<CreatorProfilePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/subscriptions" element={<SubscriptionManagerPage />} />
              <Route path="/purchases" element={<PurchaseHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

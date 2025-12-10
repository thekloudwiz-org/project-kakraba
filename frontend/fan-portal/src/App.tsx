import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@kakraba/shared';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
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
  // Use basename only in production, not in local dev
  const basename = import.meta.env.PROD ? '/fan' : '';
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/creator/:userId" element={<CreatorProfilePage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionManagerPage /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><PurchaseHistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

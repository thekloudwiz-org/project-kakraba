import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '@kakraba/shared';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PasswordResetPage = lazy(() => import('./pages/auth/PasswordResetPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ContentLibraryPage = lazy(() => import('./pages/ContentLibraryPage'));
const ContentUploadPage = lazy(() => import('./pages/ContentUploadPage'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'));
const ProductCreatePage = lazy(() => import('./pages/ProductCreatePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />} />
        <Route path="/content" element={isAuthenticated ? <ContentLibraryPage /> : <Navigate to="/login" />} />
        <Route path="/content/upload" element={isAuthenticated ? <ContentUploadPage /> : <Navigate to="/login" />} />
        <Route path="/products" element={isAuthenticated ? <ProductCatalogPage /> : <Navigate to="/login" />} />
        <Route path="/products/create" element={isAuthenticated ? <ProductCreatePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Suspense>
  );
}

export default App;

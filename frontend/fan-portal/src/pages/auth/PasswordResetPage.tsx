import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@kakraba/shared';

export default function PasswordResetPage() {
  const { resetPassword, confirmPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset code sent! Please check your email.');
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await confirmPassword(email, code, newPassword);
      setSuccess('Password reset successful! You can now sign in with your new password.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <a href="https://kakraba.thekloudwiz.com/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2 hover:text-blue-300 transition-colors">Kakraba</h1>
          </a>
          <p className="text-blue-300 text-lg">Fan Portal</p>
        </div>

        {/* Reset Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {step === 'request' ? 'Reset Password' : 'Enter Reset Code'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  We'll send a reset code to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                  Reset Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter code from email"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-gray-400 hover:text-gray-300 text-sm"
              >
                Didn't receive code? Send again
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Back to sign in
            </Link>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 hover:text-gray-300 text-sm">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

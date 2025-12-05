import { useAuth } from '@kakraba/shared';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="https://kakraba.thekloudwiz.com/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
                Kakraba Fan Portal
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.username}!</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || user?.username}!
          </h2>
          <p className="text-gray-400">
            Discover amazing content from your favorite creators
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">My Library</h3>
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-500 text-sm mt-1">Content items</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Subscriptions</h3>
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-500 text-sm mt-1">Active subscriptions</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Favorites</h3>
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-500 text-sm mt-1">Favorite creators</p>
          </div>
        </div>

        {/* Featured Content Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Discover Content</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All →
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h4 className="text-xl font-semibold text-white mb-2">Start Exploring</h4>
            <p className="text-gray-400 mb-6">
              Browse thousands of creators and discover amazing content
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Browse Creators
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400">No recent activity</p>
            <p className="text-gray-500 text-sm mt-1">
              Your purchases and interactions will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

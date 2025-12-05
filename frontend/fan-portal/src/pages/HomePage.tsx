import { Link } from 'react-router-dom';

// Placeholder data for content
const categories = {
  books: [
    { id: 1, title: 'The Art of Digital Creation', creator: 'Sarah Mitchell', image: '📚', price: '$12.99' },
    { id: 2, title: 'Photography Masterclass Guide', creator: 'James Chen', image: '📖', price: '$19.99' },
    { id: 3, title: 'Modern Web Design Principles', creator: 'Emma Rodriguez', image: '📕', price: '$15.99' },
    { id: 4, title: 'Creative Writing Workshop', creator: 'Michael Brown', image: '📘', price: '$14.99' },
  ],
  courses: [
    { id: 5, title: 'Complete Video Editing Course', creator: 'Alex Turner', image: '🎓', price: '$49.99' },
    { id: 6, title: 'Music Production Fundamentals', creator: 'Lisa Anderson', image: '🎬', price: '$39.99' },
    { id: 7, title: 'Digital Marketing Mastery', creator: 'David Kim', image: '💼', price: '$59.99' },
    { id: 8, title: 'UI/UX Design Bootcamp', creator: 'Sophie Taylor', image: '🎨', price: '$44.99' },
  ],
  podcasts: [
    { id: 9, title: 'Tech Talk Daily', creator: 'Ryan Foster', image: '🎙️', price: '$4.99/mo' },
    { id: 10, title: 'Creative Minds Podcast', creator: 'Jessica Lee', image: '🎧', price: '$3.99/mo' },
    { id: 11, title: 'Business Insights Weekly', creator: 'Mark Johnson', image: '📻', price: '$5.99/mo' },
    { id: 12, title: 'The Art of Storytelling', creator: 'Nina Patel', image: '🎤', price: '$4.99/mo' },
  ],
  music: [
    { id: 13, title: 'Midnight Dreams Album', creator: 'Luna Sky', image: '🎵', price: '$9.99' },
    { id: 14, title: 'Jazz Essentials Collection', creator: 'Marcus Williams', image: '🎶', price: '$12.99' },
    { id: 15, title: 'Electronic Vibes EP', creator: 'DJ Nova', image: '🎸', price: '$7.99' },
    { id: 16, title: 'Acoustic Sessions Vol. 1', creator: 'Emma Stone', image: '🎹', price: '$8.99' },
  ],
};

const popularCreators = [
  { id: 1, name: 'Sarah Mitchell', category: 'Author & Educator', followers: '12.5K', image: '👩‍🎨' },
  { id: 2, name: 'Alex Turner', category: 'Video Creator', followers: '25.3K', image: '🎬' },
  { id: 3, name: 'Luna Sky', category: 'Musician', followers: '18.7K', image: '🎤' },
  { id: 4, name: 'Ryan Foster', category: 'Podcaster', followers: '15.2K', image: '🎙️' },
  { id: 5, name: 'Sophie Taylor', category: 'Designer', followers: '20.1K', image: '🎨' },
  { id: 6, name: 'Marcus Williams', category: 'Jazz Artist', followers: '9.8K', image: '🎺' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <a href="https://kakraba.thekloudwiz.com/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
                Kakraba
              </a>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#books" className="text-gray-300 hover:text-white transition-colors">Books</a>
                <a href="#courses" className="text-gray-300 hover:text-white transition-colors">Courses</a>
                <a href="#podcasts" className="text-gray-300 hover:text-white transition-colors">Podcasts</a>
                <a href="#music" className="text-gray-300 hover:text-white transition-colors">Music</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Discover Amazing Content
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Stream, download, and own content from your favorite creators. Books, courses, podcasts, music, and more.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Exploring
            </Link>
            <a
              href="#books"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
            >
              Browse Content
            </a>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Books</h3>
            <button className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.books.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{item.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">{item.price}</span>
                    <button className="text-sm text-gray-400 hover:text-white">
                      Preview →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-gray-850">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Courses</h3>
            <button className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.courses.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{item.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">{item.price}</span>
                    <button className="text-sm text-gray-400 hover:text-white">
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcasts Section */}
      <section id="podcasts" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Podcasts</h3>
            <button className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.podcasts.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{item.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">{item.price}</span>
                    <button className="text-sm text-gray-400 hover:text-white">
                      Listen →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="py-16 bg-gray-850">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Music</h3>
            <button className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.music.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{item.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">{item.price}</span>
                    <button className="text-sm text-gray-400 hover:text-white">
                      Play →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Creators Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Popular Creators</h3>
            <button className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-gray-800 rounded-lg p-6 text-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
              >
                <div className="text-6xl mb-3">{creator.image}</div>
                <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                  {creator.name}
                </h4>
                <p className="text-gray-400 text-sm mb-2">{creator.category}</p>
                <p className="text-gray-500 text-xs">{creator.followers} followers</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Kakraba. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">About</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

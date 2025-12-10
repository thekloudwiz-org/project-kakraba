import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@kakraba/shared';
import Header from '../components/layout/Header';

interface Product {
  productId: string;
  title: string;
  description: string;
  price: number;
  creatorId: string;
  creatorName?: string;
  contentType?: string;
  accessType: string;
  isActive: boolean;
}

interface SearchFilters {
  search?: string;
  contentType?: string;
  minPrice?: number;
  maxPrice?: number;
  creatorId?: string;
  page?: number;
}

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
  });

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.contentType) params.append('contentType', filters.contentType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.creatorId) params.append('creatorId', filters.creatorId);
      if (filters.page) params.append('page', filters.page.toString());

      // For now, return mock data since API might not be fully implemented
      // TODO: Replace with actual API call when backend is ready
      return {
        items: [] as Product[],
        total: 0,
        page: filters.page || 1,
        pageSize: 12,
      };
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ page: 1 });
    setSearchQuery('');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover Content</h1>
          <p className="text-gray-400">
            Explore amazing content from creators around the world
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for content..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                data-testid="search-bar"
              />
              {/* Autocomplete dropdown - placeholder for future implementation */}
              {searchQuery && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 hidden"
                  data-testid="autocomplete-dropdown"
                >
                  <div className="p-2">
                    <div 
                      className="px-4 py-2 hover:bg-gray-700 rounded cursor-pointer"
                      data-testid="autocomplete-item"
                    >
                      {searchQuery}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
              data-testid="filter-button"
            >
              Filters
            </button>
          </div>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Content Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Content Type
                </label>
                <div className="space-y-2">
                  {['VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE'].map((type) => (
                    <label key={type} className="flex items-center text-white">
                      <input
                        type="checkbox"
                        name="contentType"
                        value={type}
                        checked={filters.contentType === type}
                        onChange={(e) => handleFilterChange('contentType', e.target.checked ? type : undefined)}
                        className="mr-2"
                      />
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                </div>
              </div>

              {/* Creator Filter - placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Creator
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  data-testid="creator-filter"
                  onChange={(e) => handleFilterChange('creatorId', e.target.value || undefined)}
                  value={filters.creatorId || ''}
                >
                  <option value="">All Creators</option>
                  <option value="creator1" data-testid="creator-option">Creator 1</option>
                  <option value="creator2" data-testid="creator-option">Creator 2</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                data-testid="apply-filters"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                data-testid="clear-filters"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Featured Content Section */}
        <div className="mb-8" data-testid="featured-content">
          <h2 className="text-2xl font-bold text-white mb-4">Featured Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder featured content */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-3"></div>
              <h3 className="text-white font-semibold mb-1">Featured Item</h3>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Trending Content Section */}
        <div className="mb-8" data-testid="trending-content">
          <h2 className="text-2xl font-bold text-white mb-4">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder trending content */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="aspect-square bg-gradient-to-br from-pink-600 to-orange-600 rounded-lg mb-3"></div>
              <h3 className="text-white font-semibold mb-1">Trending Item</h3>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Search Results / Product Grid */}
        <div data-testid="search-results">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {filters.search ? `Results for "${filters.search}"` : 'All Content'}
            </h2>
            <p className="text-gray-400">
              {productsData?.total || 0} products found
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : productsData?.items && productsData.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsData.items.map((product) => (
                <div
                  key={product.productId}
                  onClick={() => handleProductClick(product.productId)}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                  data-testid="product-card"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600"></div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1" data-testid="product-title">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2" data-testid="creator-name">
                      {product.creatorName || 'Unknown Creator'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 font-semibold" data-testid="product-price">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-xs" data-testid="content-type">
                        {product.contentType || 'Content'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No products found</p>
              <button
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300"
              >
                Clear filters to see all content
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {productsData && productsData.total > productsData.pageSize && (
          <div className="mt-8 flex items-center justify-center space-x-4" data-testid="pagination">
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={(filters.page || 1) <= 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {filters.page || 1} of {Math.ceil(productsData.total / productsData.pageSize)}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={(filters.page || 1) >= Math.ceil(productsData.total / productsData.pageSize)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              data-testid="next-page"
            >
              Next
            </button>
          </div>
        )}

        {/* Creator Cards Section - placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Popular Creators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div
              className="bg-gray-800 rounded-lg p-6 text-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
              data-testid="creator-card"
            >
              <div className="text-6xl mb-3">👤</div>
              <h4 className="text-white font-semibold mb-1">Creator Name</h4>
              <p className="text-gray-400 text-sm">Category</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

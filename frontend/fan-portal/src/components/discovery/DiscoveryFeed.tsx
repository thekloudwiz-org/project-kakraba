import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner } from '@kakraba/shared';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import CreatorCard from './CreatorCard';
import ProductCard from './ProductCard';

type ViewMode = 'creators' | 'products' | 'content';

interface Creator {
  userId: string;
  id?: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  contentCount: number;
  categories?: string[];
}

interface Product {
  productId?: string;
  id?: string;
  title: string;
  description?: string;
  price?: number;
  thumbnailUrl?: string;
  isSubscriptionContent?: boolean;
  creatorName: string;
  creatorAvatar?: string;
  purchaseCount?: number;
}

interface Content {
  contentId?: string;
  id?: string;
  title: string;
  description?: string;
  contentType: string;
  thumbnailUrl?: string;
  price?: number;
  creatorName: string;
  creatorAvatar?: string;
}

interface FeaturedData {
  items: (Creator | Product | Content)[];
  total: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

interface SearchResults {
  items: (Creator | Product | Content)[];
  total: number;
}

interface Filters {
  contentType: string;
  priceRange: string;
  sortBy: string;
}

export default function DiscoveryFeed() {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    contentType: 'ALL',
    priceRange: 'ALL',
    sortBy: 'popular',
  });

  const { data: featuredData, isLoading: featuredLoading } = useQuery<FeaturedData>({
    queryKey: ['featured-content'],
    queryFn: async () => {
      const result = await api.content.getFeaturedContent();
      return result as FeaturedData;
    },
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchResults>({
    queryKey: ['search', viewMode, searchQuery, filters],
    queryFn: async () => {
      if (viewMode === 'creators') {
        const result = await api.creators.searchCreators({ query: searchQuery, ...filters }) as PaginatedResponse<Creator>;
        return { items: result.items, total: result.total };
      } else if (viewMode === 'products') {
        const result = await api.product.listProducts({}) as PaginatedResponse<Product>;
        return { items: result.items, total: result.total };
      } else {
        const result = await api.content.searchContent({ query: searchQuery, ...filters }) as PaginatedResponse<Content>;
        return { items: result.items, total: result.total };
      }
    },
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const isLoading = featuredLoading || searchLoading;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} placeholder="Search creators, products, or content..." />

      {/* View Mode Tabs */}
      <div className="flex items-center space-x-4 border-b border-gray-200">
        <button
          onClick={() => setViewMode('products')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'products'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setViewMode('creators')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'creators'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Creators
        </button>
        <button
          onClick={() => setViewMode('content')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'content'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Content
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        viewMode={viewMode}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div>
          {!searchQuery && featuredData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredData.items?.map((item: Creator | Product | Content) => {
                  if (viewMode === 'creators') {
                    const creator = item as Creator;
                    return <CreatorCard key={creator.userId || creator.id} creator={creator} />;
                  } else {
                    const product = item as Product | Content;
                    const key = 'productId' in product ? product.productId : 'contentId' in product ? product.contentId : product.id;
                    return <ProductCard key={key} product={product} />;
                  }
                })}
              </div>
            </div>
          )}

          {searchQuery && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Results {searchResults?.total && `(${searchResults.total})`}
              </h2>
              {searchResults?.items?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults?.items?.map((item: Creator | Product | Content) => {
                    if (viewMode === 'creators') {
                      const creator = item as Creator;
                      return <CreatorCard key={creator.userId || creator.id} creator={creator} />;
                    } else {
                      const product = item as Product | Content;
                      const key = 'productId' in product ? product.productId : 'contentId' in product ? product.contentId : product.id;
                      return <ProductCard key={key} product={product} />;
                    }
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

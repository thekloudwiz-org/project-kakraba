interface Filters {
  contentType: string;
  priceRange: string;
  sortBy: string;
}

interface FilterPanelProps {
  viewMode: 'creators' | 'products' | 'content';
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterPanel({ viewMode, filters, onFilterChange }: FilterPanelProps) {
  const handleFilterUpdate = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Content Type Filter */}
        {(viewMode === 'content' || viewMode === 'products') && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filters.contentType}
              onChange={(e) => handleFilterUpdate('contentType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="AUDIO">Audio</option>
              <option value="VIDEO">Video</option>
              <option value="PDF">Documents</option>
              <option value="IMAGE">Images</option>
            </select>
          </div>
        )}

        {/* Price Range Filter */}
        {viewMode === 'products' && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Price:</label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterUpdate('priceRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ALL">All Prices</option>
              <option value="FREE">Free</option>
              <option value="0-10">$0 - $10</option>
              <option value="10-25">$10 - $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50+">$50+</option>
            </select>
          </div>
        )}

        {/* Sort By Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            {viewMode === 'creators' && <option value="followers">Most Followers</option>}
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.contentType !== 'ALL' || filters.priceRange !== 'ALL' || filters.sortBy !== 'popular') && (
          <button
            onClick={() => onFilterChange({ contentType: 'ALL', priceRange: 'ALL', sortBy: 'popular' })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

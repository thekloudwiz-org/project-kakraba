import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner, Badge } from '@kakraba/shared';
import ProductEditor from './ProductEditor';

type SortBy = 'newest' | 'oldest' | 'price-low' | 'price-high';

export default function ProductCatalog() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const { data: productData, isLoading, refetch } = useQuery({
    queryKey: ['products', page, sortBy],
    queryFn: () => api.product.listProducts({
      page,
      limit: 12,
    }),
  });

  const handleEdit = (productId: string) => {
    setEditingProduct(productId);
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const products = productData?.items || [];
  const totalPages = Math.ceil((productData?.total || 0) / 12);

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {productData?.total || 0} product(s)
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortBy);
            setPage(1);
          }}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors"
            >
              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex-1">
                    {product.title}
                  </h3>
                  <Badge variant={product.isActive ? 'success' : 'default'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {product.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-semibold">${product.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <Badge variant="default">{product.productType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Access</span>
                    <span className="text-white">{product.accessType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Content Items</span>
                    <span className="text-white">{product.contentIds.length}</span>
                  </div>
                  {product.allowSubscription && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Subscription</span>
                      <Badge variant="success">Enabled</Badge>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created {new Date(product.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleEdit(product.productId)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProductEditor
          productId={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
}

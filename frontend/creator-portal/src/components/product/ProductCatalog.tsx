import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Spinner, Badge, Modal, Button, Toast } from '@kakraba/shared';
import ProductEditor from './ProductEditor';
import ProductDetails from './ProductDetails';

type SortBy = 'newest' | 'oldest' | 'price-low' | 'price-high';

export default function ProductCatalog() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: productData, isLoading, refetch } = useQuery({
    queryKey: ['products', page, sortBy],
    queryFn: () => api.product.listProducts({
      page,
      limit: 12,
    }),
  });

  const handleView = (productId: string) => {
    setViewingProduct(productId);
  };

  const handleEdit = (productId: string) => {
    setEditingProduct(productId);
  };

  const handleDelete = (productId: string) => {
    setDeletingProduct(productId);
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
    setToast({ message: 'Product updated successfully!', type: 'success' });
    refetch();
  };

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => api.product.deleteProduct(productId),
    onSuccess: () => {
      setDeletingProduct(null);
      setToast({ message: 'Product deleted successfully!', type: 'success' });
      refetch();
    },
    onError: (error) => {
      setToast({ message: error instanceof Error ? error.message : 'Failed to delete product', type: 'error' });
    },
  });

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct);
    }
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
        <div data-testid="product-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              data-testid="product-card"
              onClick={() => handleView(product.productId)}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors cursor-pointer"
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
                    <span data-testid="product-price" className="text-white font-semibold">${product.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <Badge variant="default">{product.productType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Access</span>
                    <span data-testid="access-type" className="text-white">{product.accessType}</span>
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
                <div className="flex items-center space-x-2">
                  <button
                    data-testid="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product.productId);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    data-testid="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.productId);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
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

      {/* Product Details Modal */}
      {viewingProduct && (
        <ProductDetails
          productId={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProductEditor
          productId={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleEditComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingProduct(null)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
          data-testid="toast"
        />
      )}
    </div>
  );
}

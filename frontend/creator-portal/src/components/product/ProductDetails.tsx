import { useQuery } from '@tanstack/react-query';
import { api, Modal, Spinner, Badge, Button } from '@kakraba/shared';

interface ProductDetailsProps {
  productId: string;
  onClose: () => void;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductDetails({ productId, onClose, onEdit, onDelete }: ProductDetailsProps) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.product.getProduct(productId),
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="Product Details" data-testid="product-details">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : product ? (
        <div className="space-y-4">
          {/* Product Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-white">{product.title}</h3>
              <Badge variant={product.isActive ? 'success' : 'default'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {product.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Description</h4>
                <p className="text-white">{product.description}</p>
              </div>
            )}
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Price</h4>
              <p className="text-2xl font-bold text-white">${product.price}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Product Type</h4>
              <Badge variant="default">{product.productType}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Access Type</h4>
              <p className="text-white">{product.accessType}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Content Items</h4>
              <p className="text-white">{product.contentIds?.length || 0}</p>
            </div>
            {product.downloadQuota && product.downloadQuota > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Download Quota</h4>
                <p className="text-white">{product.downloadQuota}</p>
              </div>
            )}
            {product.allowSubscription && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Subscription</h4>
                <Badge variant="success">Enabled</Badge>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Created</h4>
              <p className="text-white text-sm">
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Last Updated</h4>
              <p className="text-white text-sm">
                {new Date(product.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Content List */}
          {product.contentIds && product.contentIds.length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Included Content</h4>
              <div className="space-y-2">
                {product.contentIds.map((contentId: string, index: number) => (
                  <div
                    key={contentId}
                    className="px-3 py-2 bg-gray-700 rounded text-white text-sm"
                  >
                    Content {index + 1}: {contentId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
              {onEdit && (
                <Button
                  data-testid="edit-button"
                  onClick={() => {
                    onClose();
                    onEdit(productId);
                  }}
                  variant="secondary"
                >
                  Edit Product
                </Button>
              )}
              {onDelete && (
                <Button
                  data-testid="delete-button"
                  onClick={() => {
                    onClose();
                    onDelete(productId);
                  }}
                  variant="danger"
                >
                  Delete Product
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Product not found
        </div>
      )}
    </Modal>
  );
}

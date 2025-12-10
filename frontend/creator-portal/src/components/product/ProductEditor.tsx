import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Modal, Button, Spinner, Toast } from '@kakraba/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  price: z.number().min(0.99, 'Minimum price is $0.99').max(10000),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductEditorProps {
  productId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductEditor({ productId, onClose, onSave }: ProductEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.product.getProduct(productId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        price: product.price,
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      api.product.updateProduct(productId, data),
    onSuccess: () => {
      setToast({ message: 'Product updated successfully!', type: 'success' });
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    },
    onError: (error) => {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update product',
        type: 'error'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.product.deleteProduct(productId),
    onSuccess: () => {
      setToast({ message: 'Product deleted successfully!', type: 'success' });
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    },
    onError: (error) => {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to delete product',
        type: 'error'
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Product">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              {...register('title')}
              name="title"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Product title"
            />
            {errors.title && (
              <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              name="description"
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Product description"
            />
            {errors.description && (
              <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                {...register('price', { valueAsNumber: true })}
                name="price"
                type="number"
                step="0.01"
                min="0.99"
                max="10000"
                className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register('isActive')}
                type="checkbox"
              />
              <span className="text-white">Product is active</span>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Inactive products won't be visible to fans
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              data-testid="delete-button"
            >
              Delete Product
            </Button>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                type="button"
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
    </Modal>
  );
}

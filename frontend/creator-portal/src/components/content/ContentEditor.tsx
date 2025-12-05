import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Modal, Button, Input, Spinner } from '@kakraba/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface ContentEditorProps {
  contentId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ContentEditor({ contentId, onClose, onSave }: ContentEditorProps) {
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => api.content.getContent(contentId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
  });

  useEffect(() => {
    if (content) {
      reset({
        title: content.title,
        description: content.description || '',
      });
    }
  }, [content, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ContentFormData) =>
      api.content.updateContent(contentId, data),
    onSuccess: () => {
      onSave();
      onClose();
    },
  });

  const onSubmit = (data: ContentFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Content">
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
            <Input
              {...register('title')}
              placeholder="Content title"
              error={errors.title?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Content description (optional)"
            />
            {errors.description && (
              <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
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
        </form>
      )}
    </Modal>
  );
}

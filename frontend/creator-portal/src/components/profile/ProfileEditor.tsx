import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, useAuth, Button, Input, Spinner } from '@kakraba/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().max(500).optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditor() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.user.getProfile(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio || '',
        profileImageUrl: profile.profileImageUrl || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => api.user.updateProfile(data),
    onSuccess: () => {
      // Profile updated successfully
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Get presigned URL for upload
      const { url: uploadUrl, fileUrl: imageUrl } = await api.user.getAvatarUploadUrl();

      // Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Update form with new image URL
      setValue('profileImageUrl', imageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
            {profile?.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="profile-image-upload"
              className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer inline-block ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Change Image'}
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Max 5MB, JPG, PNG, or GIF
            </p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Display Name
        </label>
        <Input
          {...register('displayName')}
          placeholder="Your display name"
          error={errors.displayName?.message}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Tell your fans about yourself..."
        />
        {errors.bio && (
          <p className="text-sm text-red-400 mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          isLoading={updateMutation.isPending}
        >
          Save Changes
        </Button>
      </div>

      {updateMutation.isSuccess && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-green-400">
          Profile updated successfully!
        </div>
      )}
    </form>
  );
}

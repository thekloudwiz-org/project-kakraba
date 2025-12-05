import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, useAuth, Button, Input, Spinner } from '@kakraba/shared';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.userId],
    queryFn: () => api.user.getProfile(),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => api.user.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadUrl = await api.user.getAvatarUploadUrl();
      await fetch(uploadUrl.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      return api.user.updateProfile({ avatarUrl: uploadUrl.fileUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAvatarFile(null);
      setAvatarPreview(null);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            {/* Avatar Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarPreview || profile?.avatarUrl ? (
                    <img
                      src={avatarPreview || profile?.avatarUrl || ''}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-3xl text-white font-bold">
                        {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Choose Photo
                  </label>
                  {avatarFile && (
                    <Button
                      onClick={handleAvatarUpload}
                      isLoading={uploadAvatarMutation.isPending}
                      className="ml-2"
                      size="sm"
                    >
                      Upload
                    </Button>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    {...register('username')}
                    error={errors.username?.message}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    error={errors.email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              {updateProfileMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">
                    {updateProfileMutation.error?.message || 'Failed to update profile'}
                  </p>
                </div>
              )}

              {updateProfileMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600">Profile updated successfully!</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={updateProfileMutation.isPending}
                className="w-full"
              >
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

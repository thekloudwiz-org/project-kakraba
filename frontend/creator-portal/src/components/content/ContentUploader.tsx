import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { api, Spinner, Input, Button, Toast } from '@kakraba/shared';
import { useForm } from 'react-hook-form';

interface ContentUploaderProps {
  onUploadComplete?: (contentId: string) => void;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface SelectedFile {
  file: File;
  preview?: string;
}

interface MetadataForm {
  title: string;
  description: string;
}

const ALLOWED_FILE_TYPES = {
  'audio/*': ['.mp3', '.wav', '.m4a', '.flac'],
  'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
  'application/pdf': ['.pdf'],
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function ContentUploader({ onUploadComplete }: ContentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MetadataForm>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidType = Object.values(ALLOWED_FILE_TYPES)
      .flat()
      .some(ext => ext === fileExtension);

    if (!isValidType) {
      return 'Unsupported file type. Supported types: audio, video, PDF, images';
    }

    return null;
  };

  const uploadFile = useCallback(async (file: File, title: string, description: string) => {
    const uploadId = `${file.name}-${Date.now()}`;

    // Add to uploads map
    setUploads(prev => new Map(prev).set(uploadId, {
      filename: file.name,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Step 1: Get presigned URL
      const { uploadUrl, contentId, s3Key } = await api.content.getUploadUrl({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      // Step 2: Upload to S3
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads(prev => {
            const newMap = new Map(prev);
            const upload = newMap.get(uploadId);
            if (upload) {
              newMap.set(uploadId, { ...upload, progress });
            }
            return newMap;
          });
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Step 3: Create content record
      await api.content.createContent({
        contentId,
        title,
        description,
        contentType: file.type.startsWith('audio') ? 'AUDIO' :
                     file.type.startsWith('video') ? 'VIDEO' :
                     file.type === 'application/pdf' ? 'PDF' : 'IMAGE',
        s3Key,
        fileSize: file.size,
      });

      // Update status to success
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(uploadId, {
          filename: file.name,
          progress: 100,
          status: 'success',
        });
        return newMap;
      });

      // Show success toast
      setToast({ message: 'Content uploaded successfully!', type: 'success' });

      onUploadComplete?.(contentId);

      // Remove from list after 3 seconds
      setTimeout(() => {
        setUploads(prev => {
          const newMap = new Map(prev);
          newMap.delete(uploadId);
          return newMap;
        });
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(uploadId, {
          filename: file.name,
          progress: 0,
          status: 'error',
          error: errorMessage,
        });
        return newMap;
      });

      // Show error toast
      setToast({ message: errorMessage, type: 'error' });
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0]; // Only handle first file for now
    const validationError = validateFile(file);

    if (validationError) {
      const uploadId = `${file.name}-${Date.now()}`;
      setUploads(prev => new Map(prev).set(uploadId, {
        filename: file.name,
        progress: 0,
        status: 'error',
        error: validationError,
      }));
      return;
    }

    // Set selected file and pre-fill title from filename
    const titleFromFilename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    setSelectedFile({ file });
    reset({ title: titleFromFilename, description: '' });
  }, [reset]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length === 0) return;

    const rejection = fileRejections[0];
    const file = rejection.file;
    const uploadId = `${file.name}-${Date.now()}`;

    setUploads(prev => new Map(prev).set(uploadId, {
      filename: file.name,
      progress: 0,
      status: 'error',
      error: 'Unsupported file type. Supported types: audio, video, PDF, images',
    }));
  }, []);

  const onSubmitMetadata = async (data: MetadataForm) => {
    if (!selectedFile) return;

    setIsUploading(true);
    await uploadFile(selectedFile.file, data.title, data.description);
    setIsUploading(false);

    // Reset form
    setSelectedFile(null);
    reset();
  };

  const handleCancel = () => {
    setSelectedFile(null);
    reset();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: selectedFile !== null, // Disable when file is selected
  });

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            data-testid="upload-area"
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors
              ${isDragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isDragActive ? (
                <p className="text-lg text-purple-400">Drop files here...</p>
              ) : (
                <>
                  <p className="text-lg text-white">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported: Audio, Video, PDF, Images (max 500MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Metadata Form */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add Content Details
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Selected File:</p>
              <p className="text-white font-medium">{selectedFile.file.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitMetadata)} className="space-y-4">
              <div>
                <Input
                  {...register('title', { required: 'Title is required' })}
                  name="title"
                  type="text"
                  placeholder="Content Title"
                  error={errors.title?.message}
                  disabled={isUploading}
                />
              </div>

              <div>
                <textarea
                  {...register('description')}
                  name="description"
                  placeholder="Description (optional)"
                  rows={4}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  type="submit"
                  isLoading={isUploading}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Upload Content
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Upload Progress */}
      {uploads.size > 0 && (
        <div className="space-y-3" data-testid="upload-progress">
          <h3 className="text-sm font-semibold text-white">Uploads</h3>
          {Array.from(uploads.entries()).map(([id, upload]) => (
            <div
              key={id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white truncate flex-1">
                  {upload.filename}
                </span>
                {upload.status === 'uploading' && (
                  <Spinner className="w-4 h-4" />
                )}
                {upload.status === 'success' && (
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {upload.status === 'error' && (
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              {upload.status === 'uploading' && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}

              {upload.status === 'error' && upload.error && (
                <p className="text-sm text-red-400 mt-1">{upload.error}</p>
              )}

              {upload.status === 'success' && (
                <p className="text-sm text-green-400 mt-1">Upload complete!</p>
              )}
            </div>
          ))}
        </div>
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

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api, Spinner } from '@kakraba/shared';

interface ContentUploaderProps {
  onUploadComplete?: (contentId: string) => void;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ALLOWED_FILE_TYPES = {
  'audio/*': ['.mp3', '.wav', '.m4a', '.flac'],
  'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
  'application/pdf': ['.pdf'],
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function ContentUploader({ onUploadComplete }: ContentUploaderProps) {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());

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
      return 'File type not supported. Supported types: audio, video, PDF, images';
    }

    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const uploadId = `${file.name}-${Date.now()}`;
    
    // Add to uploads map
    setUploads(prev => new Map(prev).set(uploadId, {
      filename: file.name,
      progress: 0,
      status: 'uploading',
    }));

    try {
      // Step 1: Get presigned URL
      const { uploadUrl, contentId } = await api.content.getUploadUrl({
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
      const { s3Key } = await api.content.getUploadUrl({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      
      await api.content.createContent({
        contentId,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
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
      setUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(uploadId, {
          filename: file.name,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        });
        return newMap;
      });
    }
  }, [onUploadComplete]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        const uploadId = `${file.name}-${Date.now()}`;
        setUploads(prev => new Map(prev).set(uploadId, {
          filename: file.name,
          progress: 0,
          status: 'error',
          error: validationError,
        }));
        continue;
      }

      await uploadFile(file);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
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

      {/* Upload Progress */}
      {uploads.size > 0 && (
        <div className="space-y-3">
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
    </div>
  );
}

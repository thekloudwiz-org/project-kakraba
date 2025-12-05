import { useNavigate } from 'react-router-dom';
import ContentUploader from '../components/content/ContentUploader';

export default function ContentUploadPage() {
  const navigate = useNavigate();

  const handleUploadComplete = (contentId: string) => {
    console.log('Upload complete:', contentId);
    // Optionally navigate to content library or show success message
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Content</h1>
          <p className="text-gray-400">
            Upload your digital content to build your library
          </p>
        </div>

        <div className="max-w-4xl">
          <ContentUploader onUploadComplete={handleUploadComplete} />
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/content')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Content Library
          </button>
        </div>
      </div>
    </div>
  );
}

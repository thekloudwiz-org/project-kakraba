import { useNavigate } from 'react-router-dom';
import ContentLibrary from '../components/content/ContentLibrary';
import { Button } from '@kakraba/shared';

export default function ContentLibraryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Content Library</h1>
            <p className="text-gray-400">
              Manage your uploaded content
            </p>
          </div>
          <Button onClick={() => navigate('/content/upload')}>
            Upload Content
          </Button>
        </div>

        <ContentLibrary />
      </div>
    </div>
  );
}

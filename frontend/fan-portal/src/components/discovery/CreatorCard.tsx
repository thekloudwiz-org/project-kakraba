import { Badge } from '@kakraba/shared';
import { useNavigate } from 'react-router-dom';

interface CreatorCardProps {
  creator: {
    userId: string;
    username: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    followerCount: number;
    contentCount: number;
    categories?: string[];
  };
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/creators/${creator.userId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Avatar */}
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        {creator.avatarUrl ? (
          <img
            src={creator.avatarUrl}
            alt={creator.displayName || creator.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl font-bold text-purple-600">
            {(creator.displayName || creator.username).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Creator Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {creator.displayName || creator.username}
        </h3>
        <p className="text-sm text-gray-600 mb-3">@{creator.username}</p>

        {creator.bio && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{creator.bio}</p>
        )}

        {/* Categories */}
        {creator.categories && creator.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {creator.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" size="sm">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{creator.followerCount.toLocaleString()} followers</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>{creator.contentCount} items</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Badge } from '@kakraba/shared';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: {
    productId?: string;
    contentId?: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    price?: number;
    isSubscriptionContent?: boolean;
    creatorName: string;
    creatorAvatar?: string;
    contentType?: string;
    purchaseCount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (product.productId) {
      navigate(`/products/${product.productId}`);
    } else if (product.contentId) {
      navigate(`/content/${product.contentId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">
            {product.contentType === 'AUDIO' && '🎵'}
            {product.contentType === 'VIDEO' && '🎬'}
            {product.contentType === 'PDF' && '📄'}
            {product.contentType === 'IMAGE' && '🖼️'}
            {!product.contentType && '📦'}
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          {product.isSubscriptionContent ? (
            <Badge variant="success">Subscription</Badge>
          ) : product.price !== undefined && product.price > 0 ? (
            <Badge variant="default">${product.price}</Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>

        {/* Content Type Badge */}
        {product.contentType && (
          <div className="absolute top-2 left-2">
            <Badge variant="default">{product.contentType}</Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Creator Info */}
        <div className="flex items-center space-x-2 mb-3">
          {product.creatorAvatar ? (
            <img
              src={product.creatorAvatar}
              alt={product.creatorName}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {product.creatorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600">{product.creatorName}</span>
        </div>

        {/* Stats */}
        {product.purchaseCount !== undefined && (
          <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-200">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>{product.purchaseCount.toLocaleString()} purchases</span>
          </div>
        )}
      </div>
    </div>
  );
}

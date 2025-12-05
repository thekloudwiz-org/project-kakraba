import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, Button, Badge, Spinner, type User, type Product, type Content } from '@kakraba/shared';
import ProductCard from '../../components/discovery/ProductCard';

export default function CreatorProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: creator, isLoading: creatorLoading } = useQuery<User>({
    queryKey: ['creator', userId],
    queryFn: async () => {
      return await api.creators.getCreatorProfile(userId!);
    },
    enabled: !!userId,
  });

  const { data: creatorContent, isLoading: contentLoading } = useQuery<Content[]>({
    queryKey: ['creator-content', userId],
    queryFn: async () => {
      return await api.creators.getCreatorContent(userId!);
    },
    enabled: !!userId,
  });

  const { data: creatorProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['creator-products', userId],
    queryFn: async () => {
      return await api.creators.getCreatorProducts(userId!);
    },
    enabled: !!userId,
  });

  if (creatorLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h2>
          <p className="text-gray-600">The creator you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName || creator.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                  <span className="text-6xl font-bold text-purple-600">
                    {(creator.displayName || creator.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {creator.displayName || creator.username}
              </h1>
              <p className="text-xl text-purple-100 mb-4">@{creator.username}</p>

              {creator.bio && (
                <p className="text-lg mb-6 max-w-2xl">{creator.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-6">
                <div>
                  <div className="text-2xl font-bold">{creator.followerCount?.toLocaleString() || 0}</div>
                  <div className="text-purple-100">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{creator.contentCount || 0}</div>
                  <div className="text-purple-100">Content Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{creator.productCount || 0}</div>
                  <div className="text-purple-100">Products</div>
                </div>
              </div>

              {/* Categories */}
              {creator.categories && creator.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {creator.categories.map((category: string) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <Button variant="secondary" size="lg">
                  Follow
                </Button>
                {creator.subscriptionEnabled && (
                  <Button variant="default" size="lg">
                    Subscribe ${creator.subscriptionPrice}/month
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8">
        {/* Products */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : creatorProducts && creatorProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creatorProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No products available yet</p>
            </div>
          )}
        </section>

        {/* Content */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Content</h2>
          {contentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : creatorContent && creatorContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creatorContent.map((content) => (
                <ProductCard key={content.contentId} product={content} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No content available yet</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

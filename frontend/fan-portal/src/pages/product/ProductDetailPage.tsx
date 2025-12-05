import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tantml:react-query';
import { api, Button, Badge, Spinner } from '@kakraba/shared';

interface Review {
  reviewId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface IncludedContentItem {
  title: string;
  contentType?: string;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'details' | 'reviews'>('details');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.product.getProduct(productId!),
    enabled: !!productId,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['product-reviews', productId],
    queryFn: () => Promise.resolve([]), // TODO: Implement reviews API
    enabled: !!productId && selectedTab === 'reviews',
  });

  const handlePurchase = () => {
    navigate(`/checkout/product/${productId}`);
  };

  const handleSubscribe = () => {
    navigate(`/checkout/subscription/${product?.creatorId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Media */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl">📦</div>
              )}
            </div>

            {/* Preview Images/Content */}
            {product.previewImages && product.previewImages.length > 0 && (
              <div className="p-4 grid grid-cols-4 gap-2">
                {product.previewImages.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-75"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  
                  {/* Creator Info */}
                  <button
                    onClick={() => navigate(`/creators/${product.creatorId}`)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                  >
                    {product.creatorAvatar ? (
                      <img
                        src={product.creatorAvatar}
                        alt={product.creatorName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-medium">
                          {product.creatorName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{product.creatorName || 'Unknown'}</span>
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  {product.isSubscriptionContent ? (
                    <Badge variant="success" size="lg">Subscription</Badge>
                  ) : product.price > 0 ? (
                    <div className="text-3xl font-bold text-gray-900">${product.price}</div>
                  ) : (
                    <Badge variant="secondary" size="lg">Free</Badge>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.contentTypes?.map((type: string) => (
                  <Badge key={type} variant="default">{type}</Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span>{product.purchaseCount?.toLocaleString() || 0} purchases</span>
                </div>
                {product.rating && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Options */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Get Access</h3>
              
              {product.price > 0 && (
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">One-time Purchase</h4>
                    <p className="text-sm text-gray-600">Own this product forever</p>
                  </div>
                  <Button onClick={handlePurchase}>
                    Buy Now ${product.price}
                  </Button>
                </div>
              )}

              {product.isSubscriptionContent && (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Subscription Access</h4>
                    <p className="text-sm text-gray-600">Access all creator content</p>
                  </div>
                  <Button onClick={handleSubscribe} variant="secondary">
                    Subscribe ${product.subscriptionPrice}/mo
                  </Button>
                </div>
              )}

              {product.price === 0 && !product.isSubscriptionContent && (
                <Button onClick={handlePurchase} className="w-full" size="lg">
                  Get for Free
                </Button>
              )}
            </div>

            {/* What's Included */}
            {product.includedContent && product.includedContent.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {product.includedContent.map((item: IncludedContentItem, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('details')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  selectedTab === 'details'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setSelectedTab('reviews')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  selectedTab === 'reviews'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews {product.reviewCount && `(${product.reviewCount})`}
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 'details' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.reviewId} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{review.userName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

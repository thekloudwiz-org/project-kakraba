import { Button } from '@kakraba/shared';
import { useNavigate } from 'react-router-dom';

interface PurchaseConfirmationProps {
  purchaseData: any;
  itemDetails: any;
  onComplete?: () => void;
}

export default function PurchaseConfirmation({
  purchaseData,
  itemDetails,
  onComplete,
}: PurchaseConfirmationProps) {
  const navigate = useNavigate();

  const handleViewContent = () => {
    if (purchaseData.contentId) {
      navigate(`/content/${purchaseData.contentId}`);
    } else if (purchaseData.productId) {
      navigate(`/products/${purchaseData.productId}`);
    }
    onComplete?.();
  };

  const handleViewLibrary = () => {
    navigate('/library');
    onComplete?.();
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Purchase Complete!</h2>
        <p className="text-gray-600">
          Thank you for your purchase. Your content is now available.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            {itemDetails.thumbnailUrl && (
              <img
                src={itemDetails.thumbnailUrl}
                alt={itemDetails.title}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{itemDetails.title}</h4>
              {itemDetails.creatorName && (
                <p className="text-sm text-gray-600">by {itemDetails.creatorName}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-gray-900">{purchaseData.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">
                {new Date(purchaseData.purchaseDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                ${purchaseData.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={handleViewContent} className="w-full">
          View Content
        </Button>
        <Button onClick={handleViewLibrary} variant="secondary" className="w-full">
          Go to Library
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        A confirmation email has been sent to your email address
      </p>
    </div>
  );
}

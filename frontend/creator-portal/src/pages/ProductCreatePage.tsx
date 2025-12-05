import { useNavigate } from 'react-router-dom';
import ProductCreator from '../components/product/ProductCreator';

export default function ProductCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            ← Back to Products
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create Product</h1>
          <p className="text-gray-400">
            Package your content into products for sale
          </p>
        </div>

        <ProductCreator />
      </div>
    </div>
  );
}

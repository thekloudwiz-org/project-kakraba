import { useNavigate } from 'react-router-dom';
import ProductCatalog from '../components/product/ProductCatalog';
import { Button } from '@kakraba/shared';

export default function ProductCatalogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
            <p className="text-gray-400">
              Manage your products and pricing
            </p>
          </div>
          <Button onClick={() => navigate('/products/create')}>
            Create Product
          </Button>
        </div>

        <ProductCatalog />
      </div>
    </div>
  );
}

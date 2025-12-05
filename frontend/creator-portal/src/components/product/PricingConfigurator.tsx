import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';

interface PricingConfiguratorProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
}

export default function PricingConfigurator({ register, errors, watch }: PricingConfiguratorProps) {
  const accessType = watch('accessType');

  return (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Price (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.99"
            max="10000"
            className="w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="9.99"
          />
        </div>
        {errors.price?.message && (
          <p className="text-sm text-red-400 mt-1">{String(errors.price.message)}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Minimum: $0.99 | Maximum: $10,000
        </p>
      </div>

      {/* Access Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Access Type
        </label>
        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              {...register('accessType')}
              type="radio"
              value="PURCHASE"
              className="mt-1"
            />
            <div>
              <div className="text-white font-medium">One-time Purchase</div>
              <div className="text-sm text-gray-400">
                Customers own the content permanently
              </div>
            </div>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              {...register('accessType')}
              type="radio"
              value="RENTAL"
              className="mt-1"
            />
            <div>
              <div className="text-white font-medium">Rental</div>
              <div className="text-sm text-gray-400">
                Temporary access with download limits
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Download Quota (for rentals) */}
      {accessType === 'RENTAL' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Download Quota
          </label>
          <input
            {...register('downloadQuota', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="3"
          />
          {errors.downloadQuota?.message && (
            <p className="text-sm text-red-400 mt-1">{String(errors.downloadQuota.message)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Number of times content can be downloaded (0 = unlimited streaming only)
          </p>
        </div>
      )}

      {/* Subscription Option */}
      <div>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            {...register('allowSubscription')}
            type="checkbox"
            className="mt-1"
          />
          <div>
            <div className="text-white font-medium">Allow Subscription Access</div>
            <div className="text-sm text-gray-400">
              Let fans access this product through a monthly subscription
            </div>
          </div>
        </label>
      </div>

      {/* Product Type (auto-determined) */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-300">Product Type</div>
            <div className="text-xs text-gray-400 mt-1">
              Automatically determined by content selection
            </div>
          </div>
          <div className="text-white font-semibold">
            {watch('productType') === 'BUNDLE' ? 'Bundle' : 'Single Item'}
          </div>
        </div>
      </div>
    </div>
  );
}

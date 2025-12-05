import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, Button } from '@kakraba/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ContentSelector from './ContentSelector';
import PricingConfigurator from './PricingConfigurator';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  contentIds: z.array(z.string()).min(1, 'Select at least one content item'),
  price: z.number().min(0.99, 'Minimum price is $0.99').max(10000, 'Maximum price is $10,000'),
  accessType: z.enum(['PURCHASE', 'RENTAL']),
  downloadQuota: z.number().min(0).optional(),
  allowSubscription: z.boolean(),
  productType: z.enum(['SINGLE', 'BUNDLE']),
});

type ProductFormData = z.infer<typeof productSchema>;

type Step = 'details' | 'content' | 'pricing' | 'review';

export default function ProductCreator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      accessType: 'PURCHASE',
      allowSubscription: false,
      productType: 'SINGLE',
      downloadQuota: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.product.createProduct(data),
    onSuccess: () => {
      navigate('/products');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  const steps: Step[] = ['details', 'content', 'pricing', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleContentSelection = (contentIds: string[]) => {
    setSelectedContentIds(contentIds);
    setValue('contentIds', contentIds);
    setValue('productType', contentIds.length > 1 ? 'BUNDLE' : 'SINGLE');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStepIndex ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 ${
                    index < currentStepIndex ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Step 1: Product Details */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Product Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Describe your product"
              />
              {errors.description && (
                <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Content Selection */}
        {currentStep === 'content' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Select Content</h2>
            <ContentSelector
              selectedIds={selectedContentIds}
              onSelectionChange={handleContentSelection}
            />
            {errors.contentIds && (
              <p className="text-sm text-red-400 mt-2">{errors.contentIds.message}</p>
            )}
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 'pricing' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Pricing & Access</h2>
            <PricingConfigurator
              register={register}
              errors={errors}
              watch={watch}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Review & Create</h2>
            
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-400">Title</h3>
                <p className="text-white">{watch('title')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400">Description</h3>
                <p className="text-white">{watch('description')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400">Content Items</h3>
                <p className="text-white">{selectedContentIds.length} item(s) selected</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400">Price</h3>
                <p className="text-white">${watch('price')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400">Access Type</h3>
                <p className="text-white">{watch('accessType')}</p>
              </div>
              {watch('allowSubscription') && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Subscription</h3>
                  <p className="text-white">Enabled</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>

          {currentStep !== 'review' ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Product
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

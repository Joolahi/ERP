import { useState, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { Product, ProductCreate, ProductUpdate } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Kiinteät tuotekategoriat
const PRODUCT_CATEGORIES = ['AAA', 'AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

export const ProductForm = ({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductCreate>({
    item_number: '',
    description: null,
    category_code: null,
    standard_time_minutes: null,
    is_active: true,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEditMode = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        item_number: product.item_number,
        description: product.description,
        category_code: product.category_code,
        standard_time_minutes: product.standard_time_minutes,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: formData as ProductUpdate,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setFormData({
        item_number: '',
        description: null,
        category_code: null,
        standard_time_minutes: null,
        is_active: true,
      });
      onSuccess?.();
    } catch (error) {
      // Virhe käsitellään mutaatiossa
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === ''
            ? null
            : parseFloat(value)
          : value === ''
          ? null
          : value,
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Number */}
        <div>
          <label htmlFor="item_number" className="label">
            Tuotenumero *
          </label>
          <input
            type="text"
            id="item_number"
            name="item_number"
            value={formData.item_number}
            onChange={handleChange}
            required
            maxLength={100}
            disabled={isPending}
            className="input font-mono"
            placeholder="esim. ABC-001"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Yksilöllinen tuotenumero (A-Z, 0-9, -)
          </p>
        </div>

        {/* Category Code - Dropdown */}
        <div>
          <label htmlFor="category_code" className="label">
            Kategoria *
          </label>
          <select
            id="category_code"
            name="category_code"
            value={formData.category_code || ''}
            onChange={handleChange}
            required
            disabled={isPending}
            className="select"
          >
            <option value="">Valitse kategoria...</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-text-tertiary">
            Tuotekategoria (AAA = korkein, H = matalin)
          </p>
        </div>

        {/* Standard Time */}
        <div>
          <label htmlFor="standard_time_minutes" className="label">
            Standardiaika (min)
          </label>
          <input
            type="number"
            id="standard_time_minutes"
            name="standard_time_minutes"
            value={formData.standard_time_minutes || ''}
            onChange={handleChange}
            disabled={isPending}
            className="input"
            placeholder="0"
            min="0"
            step="0.01"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Valmistusaika minuutteina per kappale
          </p>
        </div>

        {/* Description (spans 2 columns on desktop) */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="label">
            Kuvaus
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            disabled={isPending}
            rows={3}
            className="input resize-none"
            placeholder="Tuotteen kuvaus ja lisätiedot..."
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Vapaamuotoinen kuvaus tuotteesta
          </p>
        </div>
      </div>

      {/* Active Checkbox */}
      <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-accon border border-neutral-800">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          disabled={isPending}
          className="checkbox"
        />
        <div className="flex-1">
          <label htmlFor="is_active" className="text-sm font-medium text-text cursor-pointer">
            Tuote on aktiivinen
          </label>
          <p className="text-xs text-text-tertiary mt-0.5">
            Aktiiviset tuotteet näkyvät järjestelmässä ja ovat tilattavissa
          </p>
        </div>
        {formData.is_active && (
          <span className="status-active"></span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary flex-1"
        >
          {isPending ? (
            <>
              <div className="spinner"></div>
              Tallennetaan...
            </>
          ) : isEditMode ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Päivitä tuote
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Luo tuote
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Peruuta
          </button>
        )}
      </div>
    </form>
  );
};
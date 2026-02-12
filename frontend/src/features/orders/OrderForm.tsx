import { useState, useEffect } from 'react';
import { useCreateOrder, useUpdateOrder } from '../../hooks/useOrders';
import { useActiveProducts } from '../../hooks/useProducts';
import { useActiveDepartments } from '../../hooks/useDepartments';
import type { Order, OrderCreate, OrderUpdate, OrderPriority } from '../../types';

interface OrderFormProps {
  order?: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRIORITY_OPTIONS: { value: OrderPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Matala', color: 'text-neutral-400' },
  { value: 'normal', label: 'Normaali', color: 'text-accon-400' },
  { value: 'high', label: 'Korkea', color: 'text-warning-400' },
  { value: 'urgent', label: 'Kiireellinen', color: 'text-danger-400' },
];

export const OrderForm = ({ order, onSuccess, onCancel }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderCreate>({
    order_number: '',
    product_id: 0,
    department_id: 0,
    quantity: 1,
    priority: 'normal',
    due_date: null,
    notes: null,
  });

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const { data: products, isLoading: loadingProducts } = useActiveProducts();
  const { data: departments, isLoading: loadingDepartments } = useActiveDepartments();

  const isEditMode = !!order;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (order) {
      setFormData({
        order_number: order.order_number,
        product_id: order.product_id,
        department_id: order.department_id,
        quantity: order.quantity,
        priority: order.priority,
        due_date: order.due_date,
        notes: order.notes,
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.product_id || formData.product_id === 0) {
      return;
    }
    if (!formData.department_id || formData.department_id === 0) {
      return;
    }
    if (formData.quantity < 1) {
      return;
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: order.id,
          data: formData as OrderUpdate,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setFormData({
        order_number: '',
        product_id: 0,
        department_id: 0,
        quantity: 1,
        priority: 'normal',
        due_date: null,
        notes: null,
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
        type === 'number'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value === ''
          ? null
          : value,
    }));
  };

  if (loadingProducts || loadingDepartments) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner w-8 h-8"></div>
        <p className="ml-3 text-text-secondary">Ladataan lomaketta...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Number */}
        <div>
          <label htmlFor="order_number" className="label">
            Tilausnumero *
          </label>
          <input
            type="text"
            id="order_number"
            name="order_number"
            value={formData.order_number}
            onChange={handleChange}
            required
            maxLength={50}
            disabled={isPending}
            className="input font-mono"
            placeholder="esim. ORD-2024-001"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Yksilöllinen tilausnumero
          </p>
        </div>

        {/* Product Selection */}
        <div>
          <label htmlFor="product_id" className="label">
            Tuote *
          </label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            disabled={isPending}
            className="select"
          >
            <option value={0}>Valitse tuote...</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.item_number} - {product.description || 'Ei kuvausta'}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-text-tertiary">
            Valmistettava tuote
          </p>
        </div>

        {/* Department Selection */}
        <div>
          <label htmlFor="department_id" className="label">
            Osasto *
          </label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            required
            disabled={isPending}
            className="select"
          >
            <option value={0}>Valitse osasto...</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.code} - {dept.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-text-tertiary">
            Valmistusosasto
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="label">
            Määrä (kpl) *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            disabled={isPending}
            className="input"
            placeholder="1"
            min="1"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Valmistettava kappalemäärä
          </p>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="label">
            Prioriteetti
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isPending}
            className="select"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-text-tertiary">
            Tilauksen kiireellisyys
          </p>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="label">
            Toimituspäivä
          </label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            value={formData.due_date || ''}
            onChange={handleChange}
            disabled={isPending}
            className="input"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Tavoiteltu valmistumisajankohta
          </p>
        </div>

        {/* Notes (spans 2 columns) */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="label">
            Huomautukset
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={isPending}
            rows={3}
            className="input resize-none"
            placeholder="Lisätiedot tilauksesta..."
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Vapaamuotoiset huomiot
          </p>
        </div>
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
              Päivitä tilaus
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Luo tilaus
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
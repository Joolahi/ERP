import { useState, useEffect } from 'react';
import { useCreateDepartment, useUpdateDepartment } from '../../hooks/useDepartments';
import type { Department, DepartmentCreate, DepartmentUpdate } from '../../types';

interface DepartmentFormProps {
  department?: Department;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DepartmentForm = ({
  department,
  onSuccess,
  onCancel,
}: DepartmentFormProps) => {
  const [formData, setFormData] = useState<DepartmentCreate>({
    code: '',
    name: '',
    display_order: null,
    color: '#0066ff',
    is_active: true,
  });

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isEditMode = !!department;

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code,
        name: department.name,
        display_order: department.display_order,
        color: department.color || '#0066ff',
        is_active: department.is_active,
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: department.id,
          data: formData as DepartmentUpdate,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setFormData({
        code: '',
        name: '',
        display_order: null,
        color: '#0066ff',
        is_active: true,
      });
      onSuccess?.();
    } catch (error) {
      // Virhe käsitellään mutaatiossa
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
            : parseInt(value)
          : value === ''
          ? null
          : value,
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code */}
        <div>
          <label htmlFor="code" className="label">
            Osaston koodi *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            maxLength={20}
            disabled={isPending}
            className="input font-mono"
            placeholder="esim. ASSEMBLY"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Yksilöllinen tunnus osastolle (A-Z, 0-9, _)
          </p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="label">
            Osaston nimi *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
            disabled={isPending}
            className="input"
            placeholder="esim. Kokoonpano"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Kuvaava nimi osastolle
          </p>
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="display_order" className="label">
            Näyttöjärjestys
          </label>
          <input
            type="number"
            id="display_order"
            name="display_order"
            value={formData.display_order ?? ''}
            onChange={handleChange}
            disabled={isPending}
            className="input"
            placeholder="0"
            min="0"
          />
          <p className="mt-1.5 text-xs text-text-tertiary">
            Pienempi numero näytetään ensin (0 = ensimmäinen)
          </p>
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="label">
            Tunnusväri
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color || '#0066ff'}
              onChange={handleChange}
              disabled={isPending}
              className="h-10 w-20 rounded-accon border-2 border-neutral-700 cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={formData.color || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setFormData((prev) => ({ ...prev, color: value || null }));
                }
              }}
              maxLength={7}
              disabled={isPending}
              className="input flex-1 font-mono"
              placeholder="#0066ff"
            />
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">
            Hex-värikoodi tunnistusta varten
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
            Osasto on aktiivinen
          </label>
          <p className="text-xs text-text-tertiary mt-0.5">
            Aktiiviset osastot näkyvät järjestelmässä ja ovat käytettävissä
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
              Päivitä osasto
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Luo osasto
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
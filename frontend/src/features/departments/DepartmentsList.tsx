import { useState } from 'react';
import {
  useDepartments,
  useDeleteDepartment,
  useDeactivateDepartment,
  useActivateDepartment,
} from './useDepartments';
import { Department } from '../../types';

interface DepartmentsListProps {
  onEdit?: (department: Department) => void;
  onView?: (department: Department) => void;
}

export const DepartmentsList = ({ onEdit, onView }: DepartmentsListProps) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    true
  );
  const pageSize = 20;

  const { data, isLoading, error } = useDepartments({
    search: search || undefined,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    is_active: isActiveFilter,
  });

  const deleteMutation = useDeleteDepartment();
  const deactivateMutation = useDeactivateDepartment();
  const activateMutation = useActivateDepartment();

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Haluatko varmasti poistaa osaston "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDeactivate = async (id: number) => {
    await deactivateMutation.mutateAsync(id);
  };

  const handleActivate = async (id: number) => {
    await activateMutation.mutateAsync(id);
  };

  if (error) {
    return (
      <div className="alert-danger">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">Virhe ladattaessa osastoja</p>
          <p className="text-sm opacity-90">Tarkista verkkoyhteytesi ja yritä uudelleen.</p>
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="card card-body">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Hae osastoja koodilla tai nimellä..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input pl-10"
              />
            </div>
          </div>

          <select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setIsActiveFilter(
                value === 'all' ? undefined : value === 'active'
              );
              setPage(1);
            }}
            className="select md:w-48"
          >
            <option value="all">Kaikki osastot</option>
            <option value="active">Aktiiviset</option>
            <option value="inactive">Ei-aktiiviset</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="bg-gradient-to-r from-accon-900/30 to-neutral-900/30">
            <tr>
              <th className="table-header">Koodi</th>
              <th className="table-header">Nimi</th>
              <th className="table-header">Väri</th>
              <th className="table-header">Järjestys</th>
              <th className="table-header">Tila</th>
              <th className="table-header text-right">Toiminnot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="table-cell text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="spinner w-8 h-8"></div>
                    <p className="text-text-secondary">Ladataan osastoja...</p>
                  </div>
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell text-center py-12">
                  <svg className="w-12 h-12 text-text-tertiary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-text-secondary">Ei osastoja</p>
                </td>
              </tr>
            ) : (
              data?.items.map((department) => (
                <tr
                  key={department.id}
                  className="table-row table-row-hover"
                >
                  <td className="table-cell">
                    <span className="font-mono font-semibold text-accon-400">
                      {department.code}
                    </span>
                  </td>
                  <td className="table-cell font-medium">{department.name}</td>
                  <td className="table-cell">
                    {department.color ? (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded border-2 border-neutral-700 shadow-inner"
                          style={{ backgroundColor: department.color }}
                        />
                        <span className="font-mono text-sm text-text-secondary">
                          {department.color}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {department.display_order !== null ? (
                      <span className="badge-neutral">{department.display_order}</span>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {department.is_active ? (
                      <span className="badge-success">
                        <span className="status-active"></span>
                        Aktiivinen
                      </span>
                    ) : (
                      <span className="badge-neutral">
                        <span className="status-inactive"></span>
                        Ei-aktiivinen
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(department)}
                          className="btn-ghost btn-sm"
                          title="Näytä tiedot"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(department)}
                          className="btn-ghost btn-sm"
                          title="Muokkaa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {department.is_active ? (
                        <button
                          onClick={() => handleDeactivate(department.id)}
                          className="btn-ghost btn-sm"
                          disabled={deactivateMutation.isPending}
                          title="Deaktivoi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(department.id)}
                          className="btn-ghost btn-sm text-success-400"
                          disabled={activateMutation.isPending}
                          title="Aktivoi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(department.id, department.name)}
                        className="btn-ghost btn-sm text-danger-400 hover:text-danger-300"
                        disabled={deleteMutation.isPending}
                        title="Poista"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Näytetään{' '}
              <span className="font-medium text-text">
                {(page - 1) * pageSize + 1}
              </span>{' '}
              -{' '}
              <span className="font-medium text-text">
                {Math.min(page * pageSize, data.total)}
              </span>{' '}
              yhteensä{' '}
              <span className="font-medium text-text">{data.total}</span>{' '}
              osastosta
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary btn-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Edellinen
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">
                Sivu <span className="font-medium text-text">{page}</span> /{' '}
                <span className="font-medium text-text">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="btn-secondary btn-sm"
              >
                Seuraava
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
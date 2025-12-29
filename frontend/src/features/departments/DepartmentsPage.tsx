import { useState } from 'react';
import { DepartmentsList } from './DepartmentsList';
import { DepartmentForm } from './DepartmentForm';
import { useDepartmentStats } from './useDepartments';
import type { Department } from '../../types';

export const DepartmentsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<
    Department | undefined
  >();

  const { data: stats } = useDepartmentStats();

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDepartment(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDepartment(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Osastot</h1>
            <p className="text-text-secondary">
              Hallinnoi tuotannon osastoja ja työvaiheita
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? 'btn-secondary' : 'btn-primary'}
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Sulje lomake
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Uusi osasto
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Osastoja yhteensä</p>
                <div className="w-10 h-10 bg-accon-900/40 rounded-lg flex items-center justify-center border border-accon-700/50">
                  <svg className="w-5 h-5 text-accon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="stat-value">{stats.total}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Aktiivisia</p>
                <div className="w-10 h-10 bg-success-900/40 rounded-lg flex items-center justify-center border border-success-700/50">
                  <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="stat-value text-success-400">{stats.active}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Ei-aktiivisia</p>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <p className="stat-value text-neutral-400">{stats.inactive}</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 card animate-fade-in">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-text">
              {editingDepartment ? 'Muokkaa osastoa' : 'Luo uusi osasto'}
            </h2>
          </div>
          <div className="card-body">
            <DepartmentForm
              department={editingDepartment}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* List */}
      <DepartmentsList onEdit={handleEdit} />
    </div>
  );
};
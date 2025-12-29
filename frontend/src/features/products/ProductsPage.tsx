import { useState } from 'react';
import { ProductsList } from './ProductsList';
import { ProductForm } from './ProductForm';
import { useProductStats } from './useProducts';
import type { Product } from '../../types';

export const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    Product | undefined
  >();

  const { data: stats } = useProductStats();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Tuotteet</h1>
            <p className="text-text-secondary">
              Hallinnoi tuotantotuotteita ja niiden tietoja
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
                Uusi tuote
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Tuotteita yhteensä</p>
                <div className="w-10 h-10 bg-accon-900/40 rounded-lg flex items-center justify-center border border-accon-700/50">
                  <svg className="w-5 h-5 text-accon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
              {editingProduct ? 'Muokkaa tuotetta' : 'Luo uusi tuote'}
            </h2>
          </div>
          <div className="card-body">
            <ProductForm
              product={editingProduct}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* List */}
      <ProductsList onEdit={handleEdit} />
    </div>
  );
};
import { useState } from 'react';
import { OrdersList } from './OrderList';
import { OrderForm } from './OrderForm';
import { useOrderStats } from '../../hooks/useOrders';
import type { Order } from '../../types';

export const OrdersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();

  const { data: stats } = useOrderStats();

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOrder(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Tilaukset</h1>
            <p className="text-text-secondary">
              Hallinnoi tuotantotilauksia ja niiden tilaa
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
                Uusi tilaus
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Tilauksia yhteensä</p>
                <div className="w-10 h-10 bg-accon-900/40 rounded-lg flex items-center justify-center border border-accon-700/50">
                  <svg className="w-5 h-5 text-accon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="stat-value">{stats.total}</p>
            </div>

            {/* Pending */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Odottaa</p>
                <div className="w-10 h-10 bg-warning-900/40 rounded-lg flex items-center justify-center border border-warning-700/50">
                  <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="stat-value text-warning-400">{stats.by_status.pending}</p>
            </div>

            {/* In Progress */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Työn alla</p>
                <div className="w-10 h-10 bg-accon-900/40 rounded-lg flex items-center justify-center border border-accon-700/50">
                  <svg className="w-5 h-5 text-accon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="stat-value text-accon-400">{stats.by_status.in_progress}</p>
            </div>

            {/* Completed */}
            <div className="stat-card">
              <div className="flex items-start justify-between mb-2">
                <p className="stat-label">Valmiit</p>
                <div className="w-10 h-10 bg-success-900/40 rounded-lg flex items-center justify-center border border-success-700/50">
                  <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="stat-value text-success-400">{stats.by_status.completed}</p>
            </div>

            {/* Overdue */}
            {stats.overdue_count > 0 && (
              <div className="stat-card bg-danger-900/10 border-danger-800/30">
                <div className="flex items-start justify-between mb-2">
                  <p className="stat-label">Myöhässä</p>
                  <div className="w-10 h-10 bg-danger-900/40 rounded-lg flex items-center justify-center border border-danger-700/50">
                    <svg className="w-5 h-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="stat-value text-danger-400">{stats.overdue_count}</p>
              </div>
            )}

            {/* Average Efficiency */}
            {stats.avg_efficiency !== null && (
              <div className="stat-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="stat-label">Keskim. tehokkuus</p>
                  <div className="w-10 h-10 bg-success-900/40 rounded-lg flex items-center justify-center border border-success-700/50">
                    <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="stat-value">{stats.avg_efficiency.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 card animate-fade-in">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-text">
              {editingOrder ? 'Muokkaa tilausta' : 'Luo uusi tilaus'}
            </h2>
          </div>
          <div className="card-body">
            <OrderForm
              order={editingOrder}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* List */}
      <OrdersList onEdit={handleEdit} />
    </div>
  );
};
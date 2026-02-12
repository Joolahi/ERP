import { useState } from 'react';
import {
  useOrders,
  useDeleteOrder,
  useStartOrder,
  useCompleteOrder,
  useCancelOrder,
  useReopenOrder,
} from '../../hooks/useOrders';
import type { Order, OrderStatus, OrderPriority } from '../../types';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

interface OrdersListProps {
  onEdit?: (order: Order) => void;
  onView?: (order: Order) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; badge: string }> = {
  pending: { label: 'Odottaa', badge: 'badge-warning' },
  in_progress: { label: 'Työn alla', badge: 'badge-primary' },
  completed: { label: 'Valmis', badge: 'badge-success' },
  cancelled: { label: 'Peruttu', badge: 'badge-neutral' },
};

const PRIORITY_CONFIG: Record<OrderPriority, { label: string; color: string }> = {
  low: { label: 'Matala', color: 'text-neutral-400' },
  normal: { label: 'Normaali', color: 'text-accon-400' },
  high: { label: 'Korkea', color: 'text-warning-400' },
  urgent: { label: 'Kiireellinen', color: 'text-danger-400' },
};

export const OrdersList = ({ onEdit, onView }: OrdersListProps) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | ''>('');
  const pageSize = 20;

  const { data, isLoading, error } = useOrders({
    search: search || undefined,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const deleteMutation = useDeleteOrder();
  const startMutation = useStartOrder();
  const completeMutation = useCompleteOrder();
  const cancelMutation = useCancelOrder();
  const reopenMutation = useReopenOrder();

  const handleDelete = async (id: number, orderNumber: string) => {
    if (window.confirm(`Haluatko varmasti poistaa tilauksen "${orderNumber}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleStart = async (id: number) => {
    await startMutation.mutateAsync(id);
  };

  const handleComplete = async (id: number) => {
    await completeMutation.mutateAsync(id);
  };

  const handleCancel = async (id: number) => {
    const reason = window.prompt('Syy peruutukselle (valinnainen):');
    if (reason !== null) {
      await cancelMutation.mutateAsync({ id, reason: reason || undefined });
    }
  };

  const handleReopen = async (id: number) => {
    await reopenMutation.mutateAsync(id);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy HH:mm', { locale: fi });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (order: Order) => {
    if (!order.due_date || order.status === 'completed' || order.status === 'cancelled') {
      return false;
    }
    return new Date(order.due_date) < new Date();
  };

  if (error) {
    return (
      <div className="alert-danger">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">Virhe ladattaessa tilauksia</p>
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
                placeholder="Hae tilauksia numerolla..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '');
              setPage(1);
            }}
            className="select md:w-48"
          >
            <option value="">Kaikki tilat</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as OrderPriority | '');
              setPage(1);
            }}
            className="select md:w-48"
          >
            <option value="">Kaikki prioriteetit</option>
            {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="bg-gradient-to-r from-accon-900/30 to-neutral-900/30">
            <tr>
              <th className="table-header">Tilausnumero</th>
              <th className="table-header">Tuote</th>
              <th className="table-header">Osasto</th>
              <th className="table-header">Määrä</th>
              <th className="table-header">Prioriteetti</th>
              <th className="table-header">Tila</th>
              <th className="table-header">Toimituspäivä</th>
              <th className="table-header text-right">Toiminnot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="spinner w-8 h-8"></div>
                    <p className="text-text-secondary">Ladataan tilauksia...</p>
                  </div>
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <svg className="w-12 h-12 text-text-tertiary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-text-secondary">Ei tilauksia</p>
                </td>
              </tr>
            ) : (
              data?.items.map((order) => (
                <tr
                  key={order.id}
                  className={`table-row table-row-hover ${
                    isOverdue(order) ? 'bg-danger-900/10' : ''
                  }`}
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-accon-400">
                        {order.order_number}
                      </span>
                      {isOverdue(order) && (
                        <svg className="w-4 h-4 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    {order.product ? (
                      <div>
                        <p className="font-mono text-sm text-accon-400">{order.product.item_number}</p>
                        <p className="text-xs text-text-tertiary line-clamp-1">
                          {order.product.description || 'Ei kuvausta'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-text-tertiary">ID: {order.product_id}</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {order.department ? (
                      <span className="badge-primary font-mono">
                        {order.department.code}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">ID: {order.department_id}</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold">{order.quantity}</span> kpl
                  </td>
                  <td className="table-cell">
                    <span className={`font-semibold ${PRIORITY_CONFIG[order.priority].color}`}>
                      {PRIORITY_CONFIG[order.priority].label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={STATUS_CONFIG[order.status].badge}>
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </td>
                  <td className="table-cell">
                    {order.due_date ? (
                      <span className={isOverdue(order) ? 'text-danger-400 font-semibold' : ''}>
                        {formatDate(order.due_date)}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(order)}
                          className="btn-ghost btn-sm"
                          title="Näytä tiedot"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStart(order.id)}
                          className="btn-ghost btn-sm text-accon-400"
                          disabled={startMutation.isPending}
                          title="Aloita"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleComplete(order.id)}
                          className="btn-ghost btn-sm text-success-400"
                          disabled={completeMutation.isPending}
                          title="Valmis"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'in_progress') && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="btn-ghost btn-sm text-warning-400"
                          disabled={cancelMutation.isPending}
                          title="Peru"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )}

                      {order.status === 'cancelled' && (
                        <button
                          onClick={() => handleReopen(order.id)}
                          className="btn-ghost btn-sm text-accon-400"
                          disabled={reopenMutation.isPending}
                          title="Avaa uudelleen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}

                      {onEdit && order.status !== 'completed' && (
                        <button
                          onClick={() => onEdit(order)}
                          className="btn-ghost btn-sm"
                          title="Muokkaa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(order.id, order.order_number)}
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
              tilauksesta
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
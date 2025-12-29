import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DepartmentsPage } from './features/departments';
import { ProductsPage } from './features/products';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="nav-container">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="logo-accon">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-accon">ERP 2.0</h1>
                <p className="text-xs text-accon-400">Accon Production System</p>
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              <Link
                to="/"
                className={isActive('/') ? 'nav-link-active' : 'nav-link'}
              >
                <svg className="w-5 h-5 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/departments"
                className={isActive('/departments') ? 'nav-link-active' : 'nav-link'}
              >
                <svg className="w-5 h-5 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Osastot
              </Link>
              <Link
                to="/products"
                className={isActive('/products') ? 'nav-link-active' : 'nav-link'}
              >
                <svg className="w-5 h-5 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Tuotteet
              </Link>
              <Link
                to="/orders"
                className={isActive('/orders') ? 'nav-link-active' : 'nav-link'}
              >
                <svg className="w-5 h-5 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tilaukset
              </Link>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <span className="status-active"></span>
            <span className="text-sm text-accon-300 font-medium">Järjestelmä aktiivinen</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          
          <main className="min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPagePlaceholder />} />
            </Routes>
          </main>
        </div>

        <Toaster 
          position="top-right" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: '#152238',
              border: '1px solid rgba(0, 102, 255, 0.3)',
              color: '#f1f5f9',
            },
          }}
        />
        
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const DashboardPage = () => (
  <div className="container mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gradient-accon mb-2">
        Tuotannon hallintajärjestelmä
      </h1>
      <p className="text-text-secondary text-lg">
        Accon Suomi Oy - Vasarakuja 19, 67100 Kokkola
      </p>
    </div>

    {/* Highlight Box */}
    <div className="highlight-box mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-accon-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-text mb-1">Tehokas tuotannonohjaus</h3>
          <p className="text-text-secondary">
            Modernilla ERP-järjestelmällä hallitset koko tuotantoprosessin osastoista ja tuotteista 
            tilausten seurantaan ja tehokkuuslaskentaan.
          </p>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="stat-label">Aktiiviset tilaukset</p>
            <p className="stat-value">24</p>
          </div>
          <div className="w-12 h-12 bg-accon-900/40 rounded-lg flex items-center justify-center border border-accon-700/50">
            <svg className="w-6 h-6 text-accon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <p className="stat-change-positive">+12% tästä viikosta</p>
        <div className="progress-bar mt-3">
          <div className="progress-fill" style={{ width: '68%' }}></div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="stat-label">Tuotantoaste</p>
            <p className="stat-value">87%</p>
          </div>
          <div className="w-12 h-12 bg-success-900/40 rounded-lg flex items-center justify-center border border-success-700/50">
            <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="stat-change-positive">+5% eilisestä</p>
        <div className="progress-bar mt-3">
          <div className="progress-fill" style={{ width: '87%' }}></div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="stat-label">Osastot käytössä</p>
            <p className="stat-value">6</p>
          </div>
          <div className="w-12 h-12 bg-accent-900/40 rounded-lg flex items-center justify-center border border-accent-700/50">
            <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <p className="text-accon-300 text-sm font-semibold">Kaikki aktiivisia</p>
        <div className="progress-bar mt-3">
          <div className="progress-fill" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="stat-label">Tuotteita varastossa</p>
            <p className="stat-value">342</p>
          </div>
          <div className="w-12 h-12 bg-warning-900/40 rounded-lg flex items-center justify-center border border-warning-700/50">
            <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <p className="text-text-tertiary text-sm">Aktiivisia tuotteita</p>
        <div className="progress-bar mt-3">
          <div className="progress-fill" style={{ width: '82%' }}></div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="card mb-8">
      <div className="card-header">
        <h2 className="text-xl font-bold text-text">Pika-toiminnot</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/departments" className="btn-primary justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Uusi osasto
          </Link>
          <Link to="/products" className="btn-primary justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Uusi tuote
          </Link>
          <button className="btn-secondary justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Raportit
          </button>
          <button className="btn-secondary justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Asetukset
          </button>
        </div>
      </div>
    </div>

    {/* System Status */}
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold text-text">Järjestelmän tila</h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-accon-900/10 rounded-lg border border-accon-800/30">
            <div className="flex items-center gap-3">
              <span className="status-active"></span>
              <span className="text-text font-medium">API-yhteys</span>
            </div>
            <span className="badge-success">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-accon-900/10 rounded-lg border border-accon-800/30">
            <div className="flex items-center gap-3">
              <span className="status-active"></span>
              <span className="text-text font-medium">Tietokanta</span>
            </div>
            <span className="badge-success">Toiminnassa</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-accon-900/10 rounded-lg border border-accon-800/30">
            <div className="flex items-center gap-3">
              <span className="status-active"></span>
              <span className="text-text font-medium">Tuotantolaitteet</span>
            </div>
            <span className="badge-success">6/6 aktiivisia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OrdersPagePlaceholder = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gradient-accon mb-4">Tilaukset</h1>
    <div className="card card-body">
      <p className="text-text-secondary">Tilaukset-sivu tulossa pian...</p>
    </div>
  </div>
);

export default App;
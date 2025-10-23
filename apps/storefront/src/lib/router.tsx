import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../components';
import { lazy, Suspense, useEffect } from 'react';
import SupportAssistant from '../components/organisms/SupportAssistant';

// Lazy load all pages except Catalog (entry point)
import Catalog from '../pages/catalog';
const Product = lazy(() => import('../pages/product'));
const Admin = lazy(() => import('../pages/AdminDashboard.tsx'));
const Cart = lazy(() => import('../pages/cart'));
const Checkout = lazy(() => import('../pages/checkout'));
const OrderStatus = lazy(() => import('../pages/OrderTracking.tsx'));

// Loading component with instant mount and smooth fade-in
function PageLoader() {
  return (
    <div className="animate-fadein w-full h-[50vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Route transition performance tracker
function RouteTracker() {
  const location = useLocation();
  
  useEffect(() => {
    const start = performance.now();
    
    // Mark the start of navigation
    performance.mark('route-change-start');
    
    // Use requestAnimationFrame to measure when the page is visually ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const end = performance.now();
        const duration = end - start;
        
        // Mark the end and measure
        performance.mark('route-change-end');
        performance.measure('route-change', 'route-change-start', 'route-change-end');
        
        // Log only in development
        if (import.meta.env.DEV) {
          console.log(`Route transition to ${location.pathname} took ${duration.toFixed(1)}ms`);
        }
      });
    });
  }, [location]);

  return null;
}

export default function AppRouter() {
  // SupportAssistant component handles support UI and interactions
  return (
    <HashRouter>
      <RouteTracker />
      <div className="min-h-screen w-full bg-gradient-to-b from-white via-sky-50 to-blue-100 text-slate-800">
        <Header />
        <div className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/p/:id" element={<Product />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderStatus />} />
            </Routes>
          </Suspense>
        </div>

        <SupportAssistant />
      </div>
    </HashRouter>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AdminLayout } from '@/layouts/AdminLayout';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/menu" element={<Navigate to="/categories" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

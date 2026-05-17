import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { UserDashboard } from './pages/user/UserDashboard';
import { Catalog } from './pages/user/Catalog';
import { BookDetail } from './pages/user/BookDetail';
import { MyLoans } from './pages/user/MyLoans';
import { Reservations } from './pages/user/Reservations';
import { MyPurchases } from './pages/user/MyPurchases';
import { Notifications } from './pages/user/Notifications';
import { UserProfile } from './pages/user/UserProfile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CatalogManagement } from './pages/admin/CatalogManagement';
import { LoansManagement } from './pages/admin/LoansManagement';
import { ReturnsMora } from './pages/admin/ReturnsMora';
import { ReservationsQueue } from './pages/admin/ReservationsQueue';
import { SalesManagement } from './pages/admin/SalesManagement';
import { Reports } from './pages/admin/Reports';
import { UserManagement } from './pages/admin/UserManagement';

export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { index: true, element: <UserDashboard /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'book/:bookId', element: <BookDetail /> },
      { path: 'loans', element: <MyLoans /> },
      { path: 'reservations', element: <Reservations /> },
      { path: 'purchases', element: <MyPurchases /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <UserProfile /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'catalog', element: <CatalogManagement /> },
      { path: 'loans', element: <LoansManagement /> },
      { path: 'returns', element: <ReturnsMora /> },
      { path: 'reservations', element: <ReservationsQueue /> },
      { path: 'sales', element: <SalesManagement /> },
      { path: 'reports', element: <Reports /> },
      { path: 'users', element: <UserManagement /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
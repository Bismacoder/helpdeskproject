import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout & Protected Route Guard
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';

// Shared Pages
import { Profile } from '../pages/Profile';
import { TicketDetails } from '../pages/TicketDetails';

// Requester Pages
import { RequesterDashboard } from '../pages/RequesterDashboard';
import { CreateTicket } from '../pages/CreateTicket';
import { MyTickets } from '../pages/MyTickets';

// Agent Pages
import { AgentDashboard } from '../pages/AgentDashboard';
import { AssignedTickets } from '../pages/AssignedTickets';
import { AgentTickets } from '../pages/AgentTickets';

// Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard';
import { AllTickets } from '../pages/AllTickets';
import { ManageCategories } from '../pages/ManageCategories';
import { ManageUsers } from '../pages/ManageUsers';

export const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // Root redirect helper
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/requester/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={getRootRedirect()} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? getRootRedirect() : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? getRootRedirect() : <Register />
        }
      />

      {/* Protected Routes inside App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Shared Protected Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />

        {/* Requester Routes */}
        <Route
          path="/requester/dashboard"
          element={
            <ProtectedRoute allowedRoles={['requester']}>
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute allowedRoles={['requester', 'admin', 'agent']}>
              <CreateTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/my"
          element={
            <ProtectedRoute allowedRoles={['requester']}>
              <MyTickets />
            </ProtectedRoute>
          }
        />

        {/* Agent Routes */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/assigned"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AssignedTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/tickets"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentTickets />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

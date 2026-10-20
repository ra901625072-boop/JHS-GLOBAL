import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from './Toast';

/**
 * Scoped root for Admin area.
 * Ensures AuthProvider and session initialization are only loaded
 * when navigating to admin routes, keeping the public buyer bundle ultra-lean.
 */
export const AdminRoot = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="admin-root min-h-screen antialiased flex flex-col" data-admin>
          <Outlet />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default AdminRoot;

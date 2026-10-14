import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

/**
 * Scoped root for Admin area.
 * Ensures AuthProvider and session initialization are only loaded
 * when navigating to admin routes, keeping the public buyer bundle ultra-lean.
 */
export const AdminRoot = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default AdminRoot;

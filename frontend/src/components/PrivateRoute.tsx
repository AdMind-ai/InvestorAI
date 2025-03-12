// src/components/PrivateRoute.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const auth = useContext(AuthContext);

  return auth?.token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
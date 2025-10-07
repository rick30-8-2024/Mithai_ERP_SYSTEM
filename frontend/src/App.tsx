import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Inventory from './components/Inventory';
import InventoryDetail from './components/InventoryDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard (will auto-redirect to login if not authenticated) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Inventory routes */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:code"
          element={
            <ProtectedRoute>
              <InventoryDetail />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

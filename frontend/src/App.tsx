import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Inventory from './components/Inventory';
import InventoryDetail from './components/InventoryDetail';
import RecipeManagement from './components/RecipeManagement';
import WorkOrder from './components/WorkOrder';
import KitchenDisplay from './components/KitchenDisplay';

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

        {/* Recipe Management route */}
        <Route
          path="/recipe-management"
          element={
            <ProtectedRoute>
              <RecipeManagement />
            </ProtectedRoute>
          }
        />

        {/* Work Order route */}
        <Route
          path="/work-order"
          element={
            <ProtectedRoute>
              <WorkOrder />
            </ProtectedRoute>
          }
        />

        {/* Kitchen Display route */}
        <Route
          path="/kitchen-display"
          element={
            <ProtectedRoute>
              <KitchenDisplay />
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

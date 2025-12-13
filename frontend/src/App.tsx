import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Inventory from './components/Inventory';
import InventoryDetail from './components/InventoryDetail';
import RecipeManagement from './components/RecipeManagement';
import WorkOrder from './components/WorkOrder';
import WorkOrders from './components/WorkOrders';
import KitchenDisplay from './components/KitchenDisplay';
import PurchaseOrder from './components/PurchaseOrder';
import SendToFactory from './components/SendToFactory';
import SalesOrder from './components/SalesOrder';
import SalesOrderApproval from './components/SalesOrderApproval';
import SalesOrderDispatch from './components/SalesOrderDispatch';
import GatePass from './components/GatePass';
import UserManagement from './components/UserManagement';
import CustomerManagement from './components/CustomerManagement';

function App() {
  return (
    <ThemeProvider>
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

          {/* My Work Orders route */}
          <Route
            path="/work-orders"
            element={
              <ProtectedRoute>
                <WorkOrders />
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

          {/* Purchase Order route */}
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />

          {/* Send to Factory route */}
          <Route
            path="/send-to-factory"
            element={
              <ProtectedRoute>
                <SendToFactory />
              </ProtectedRoute>
            }
          />

          {/* Sales Order route */}
          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute>
                <SalesOrder />
              </ProtectedRoute>
            }
          />

          {/* Sales Order Approval route */}
          <Route
            path="/sales-order-approval"
            element={
              <ProtectedRoute>
                <SalesOrderApproval />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-order-dispatch"
            element={
              <ProtectedRoute>
                <SalesOrderDispatch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gate-pass"
            element={
              <ProtectedRoute>
                <GatePass />
              </ProtectedRoute>
            }
          />

          {/* User Management route */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Customer Management route */}
          <Route
            path="/customer-management"
            element={
              <ProtectedRoute>
                <CustomerManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

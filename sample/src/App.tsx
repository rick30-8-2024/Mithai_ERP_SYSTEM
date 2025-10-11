import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { RawMaterials } from './components/RawMaterials';
import { FinishedGoods } from './components/FinishedGoods';
import { RecipeManagement } from './components/RecipeManagement';
import { WorkOrder } from './components/WorkOrder';
import { WorkOrders } from './components/WorkOrders';
import { KitchenDisplay } from './components/KitchenDisplay';
import { PurchaseOrder } from './components/PurchaseOrder';
import { SendToFactory } from './components/SendToFactory';
import { SalesOrder } from './components/SalesOrder';
import { SalesOrderApproval } from './components/SalesOrderApproval';
import { SalesOrderDispatch } from './components/SalesOrderDispatch';
import { GatePass } from './components/GatePass';
import { UserManagement } from './components/UserManagement';
import { Accounting } from './components/Accounting';
import { LogisticsRoutes } from './components/LogisticsRoutes';
import { QualityCheck } from './components/QualityCheck';
import { CustomerManagement } from './components/CustomerManagement';
import { PaymentTracking } from './components/PaymentTracking';
import { CRM } from './components/CRM';
import { Toaster } from './components/ui/sonner';

export type ModuleName = 
  | 'dashboard'
  | 'inventory'
  | 'rawMaterials'
  | 'finishedGoods'
  | 'recipeManagement'
  | 'workOrder'
  | 'workOrders'
  | 'kitchenDisplay'
  | 'purchaseOrder'
  | 'sendToFactory'
  | 'salesOrder'
  | 'salesOrderApproval'
  | 'salesOrderDispatch'
  | 'gatePass'
  | 'userManagement'
  | 'accounting'
  | 'logisticsRoutes'
  | 'qualityCheck'
  | 'customerManagement'
  | 'paymentTracking'
  | 'crm';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleName>('dashboard');
  const [currentUser] = useState('John Smith'); // Mock logged in user

  const navigateToModule = (module: ModuleName) => {
    setCurrentModule(module);
  };

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateToModule} currentUser={currentUser} />;
      case 'inventory':
        return <Inventory onNavigate={navigateToModule} />;
      case 'rawMaterials':
        return <RawMaterials onNavigate={navigateToModule} />;
      case 'finishedGoods':
        return <FinishedGoods onNavigate={navigateToModule} />;
      case 'recipeManagement':
        return <RecipeManagement onNavigate={navigateToModule} />;
      case 'workOrder':
        return <WorkOrder onNavigate={navigateToModule} />;
      case 'workOrders':
        return <WorkOrders onNavigate={navigateToModule} currentUser={currentUser} />;
      case 'kitchenDisplay':
        return <KitchenDisplay onNavigate={navigateToModule} />;
      case 'purchaseOrder':
        return <PurchaseOrder onNavigate={navigateToModule} />;
      case 'sendToFactory':
        return <SendToFactory onNavigate={navigateToModule} />;
      case 'salesOrder':
        return <SalesOrder onNavigate={navigateToModule} />;
      case 'salesOrderApproval':
        return <SalesOrderApproval onNavigate={navigateToModule} />;
      case 'salesOrderDispatch':
        return <SalesOrderDispatch onNavigate={navigateToModule} />;
      case 'gatePass':
        return <GatePass onNavigate={navigateToModule} />;
      case 'userManagement':
        return <UserManagement onNavigate={navigateToModule} />;
      case 'accounting':
        return <Accounting onNavigate={navigateToModule} />;
      case 'logisticsRoutes':
        return <LogisticsRoutes onNavigate={navigateToModule} />;
      case 'qualityCheck':
        return <QualityCheck onNavigate={navigateToModule} />;
      case 'customerManagement':
        return <CustomerManagement onNavigate={navigateToModule} />;
      case 'paymentTracking':
        return <PaymentTracking onNavigate={navigateToModule} />;
      case 'crm':
        return <CRM onNavigate={navigateToModule} />;
      default:
        return <Dashboard onNavigate={navigateToModule} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {renderCurrentModule()}
      <Toaster />
    </div>
  );
}
import React, { useState } from 'react';
import { ModuleName } from '../App';
import { 
  Package, 
  Wheat, 
  Cookie, 
  ChefHat, 
  ClipboardList, 
  Monitor, 
  ShoppingCart, 
  Factory, 
  Receipt, 
  CheckCircle, 
  Truck, 
  KeyRound, 
  Users, 
  Calculator, 
  Route, 
  Shield, 
  UserCheck, 
  CreditCard, 
  HeadphonesIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface DashboardProps {
  onNavigate: (module: ModuleName) => void;
  currentUser: string;
}

interface ModuleConfig {
  id: ModuleName;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function Dashboard({ onNavigate, currentUser }: DashboardProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const modules: ModuleConfig[] = [
    {
      id: 'inventory',
      title: 'Inventory',
      icon: <Package className="w-8 h-8" />,
      description: 'Manage stock levels',
      color: 'from-blue-400/20 to-blue-600/20'
    },
    {
      id: 'rawMaterials',
      title: 'Raw Materials',
      icon: <Wheat className="w-8 h-8" />,
      description: 'Track ingredients',
      color: 'from-green-400/20 to-green-600/20'
    },
    {
      id: 'finishedGoods',
      title: 'Finished Goods',
      icon: <Cookie className="w-8 h-8" />,
      description: 'Ready products',
      color: 'from-orange-400/20 to-orange-600/20'
    },
    {
      id: 'recipeManagement',
      title: 'Recipe Management',
      icon: <ChefHat className="w-8 h-8" />,
      description: 'Manage recipes',
      color: 'from-purple-400/20 to-purple-600/20'
    },
    {
      id: 'workOrder',
      title: 'Manage Work Orders',
      icon: <ClipboardList className="w-8 h-8" />,
      description: 'Production orders',
      color: 'from-red-400/20 to-red-600/20'
    },
    {
      id: 'workOrders',
      title: 'Work Orders',
      icon: <ClipboardList className="w-8 h-8" />,
      description: 'My assigned tasks',
      color: 'from-blue-400/20 to-blue-600/20'
    },
    {
      id: 'kitchenDisplay',
      title: 'Kitchen Display',
      icon: <Monitor className="w-8 h-8" />,
      description: 'Kitchen operations',
      color: 'from-yellow-400/20 to-yellow-600/20'
    },
    {
      id: 'purchaseOrder',
      title: 'Purchase Order',
      icon: <ShoppingCart className="w-8 h-8" />,
      description: 'Supplier orders',
      color: 'from-indigo-400/20 to-indigo-600/20'
    },
    {
      id: 'sendToFactory',
      title: 'Send to Factory',
      icon: <Factory className="w-8 h-8" />,
      description: 'Transfer to production',
      color: 'from-teal-400/20 to-teal-600/20'
    },
    {
      id: 'salesOrder',
      title: 'Sales Order',
      icon: <Receipt className="w-8 h-8" />,
      description: 'Customer orders',
      color: 'from-pink-400/20 to-pink-600/20'
    },
    {
      id: 'salesOrderApproval',
      title: 'Sales Order Approval',
      icon: <CheckCircle className="w-8 h-8" />,
      description: 'Approve orders',
      color: 'from-emerald-400/20 to-emerald-600/20'
    },
    {
      id: 'salesOrderDispatch',
      title: 'Sales Order Dispatch',
      icon: <Truck className="w-8 h-8" />,
      description: 'Dispatch orders',
      color: 'from-cyan-400/20 to-cyan-600/20'
    },
    {
      id: 'gatePass',
      title: 'Gate Pass/Inward',
      icon: <KeyRound className="w-8 h-8" />,
      description: 'Entry management',
      color: 'from-violet-400/20 to-violet-600/20'
    },
    {
      id: 'userManagement',
      title: 'User Management',
      icon: <Users className="w-8 h-8" />,
      description: 'Manage users',
      color: 'from-slate-400/20 to-slate-600/20'
    },
    {
      id: 'accounting',
      title: 'Accounting',
      icon: <Calculator className="w-8 h-8" />,
      description: 'Financial records',
      color: 'from-lime-400/20 to-lime-600/20'
    },
    {
      id: 'logisticsRoutes',
      title: 'Logistics & Routes',
      icon: <Route className="w-8 h-8" />,
      description: 'Delivery planning',
      color: 'from-amber-400/20 to-amber-600/20'
    },
    {
      id: 'qualityCheck',
      title: 'Quality Check',
      icon: <Shield className="w-8 h-8" />,
      description: 'Quality control',
      color: 'from-rose-400/20 to-rose-600/20'
    },
    {
      id: 'customerManagement',
      title: 'Customer Management',
      icon: <UserCheck className="w-8 h-8" />,
      description: 'Manage customers',
      color: 'from-sky-400/20 to-sky-600/20'
    },
    {
      id: 'paymentTracking',
      title: 'Payment Tracking',
      icon: <CreditCard className="w-8 h-8" />,
      description: 'Track payments',
      color: 'from-fuchsia-400/20 to-fuchsia-600/20'
    },
    {
      id: 'crm',
      title: 'CRM',
      icon: <HeadphonesIcon className="w-8 h-8" />,
      description: 'Customer relations',
      color: 'from-stone-400/20 to-stone-600/20'
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setShowUserDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
            Sweet Manufacturing MRP
          </h1>
          <p className="text-slate-600">Manufacturing Resource Planning Dashboard</p>
        </div>
        
        {/* User Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90 transition-all duration-200"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <span className="text-slate-700">{currentUser}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </Button>
          
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-100/80 rounded-none"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-slate-700">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {modules.map((module) => (
          <Card
            key={module.id}
            className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer rounded-2xl p-6"
            onClick={() => onNavigate(module.id)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-xl bg-slate-100/80 group-hover:bg-white/80 transition-colors duration-300">
                <div className="text-slate-600 group-hover:text-slate-700">
                  {module.icon}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-slate-900">
                  {module.title}
                </h3>
                <p className="text-sm text-slate-600 group-hover:text-slate-700">
                  {module.description}
                </p>
              </div>
            </div>
            
            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300" />
          </Card>
        ))}
      </div>
    </div>
  );
}
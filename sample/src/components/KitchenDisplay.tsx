import React, { useState, useEffect } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Monitor, Clock, ChefHat, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface KitchenDisplayProps {
  onNavigate: (module: ModuleName) => void;
}

interface WorkOrderItem {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  unit: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Ready' | 'Completed';
  estimatedTime: number; // in minutes
  startTime?: string;
  station: string;
  customer: string;
  notes?: string;
}

export function KitchenDisplay({ onNavigate }: KitchenDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock kitchen orders data
  const [orders, setOrders] = useState<WorkOrderItem[]>([
    {
      id: '1',
      orderNumber: 'WO-001',
      product: 'Chocolate Cake',
      quantity: 5,
      unit: 'pcs',
      priority: 'High',
      status: 'In Progress',
      estimatedTime: 45,
      startTime: '10:30',
      station: 'Baking Station 1',
      customer: 'Sweet Delights Bakery',
      notes: 'Extra chocolate frosting'
    },
    {
      id: '2',
      orderNumber: 'WO-002',
      product: 'Vanilla Cupcakes',
      quantity: 24,
      unit: 'pcs',
      priority: 'Medium',
      status: 'Pending',
      estimatedTime: 30,
      station: 'Baking Station 2',
      customer: 'City Mall Food Court'
    },
    {
      id: '3',
      orderNumber: 'WO-003',
      product: 'Strawberry Tart',
      quantity: 12,
      unit: 'pcs',
      priority: 'High',
      status: 'Ready',
      estimatedTime: 60,
      startTime: '09:45',
      station: 'Pastry Station',
      customer: 'Elite Restaurant'
    },
    {
      id: '4',
      orderNumber: 'WO-004',
      product: 'Chocolate Cookies',
      quantity: 100,
      unit: 'pcs',
      priority: 'Low',
      status: 'Pending',
      estimatedTime: 25,
      station: 'Baking Station 3',
      customer: 'School Cafeteria'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: WorkOrderItem['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus, 
            startTime: newStatus === 'In Progress' && !order.startTime 
              ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : order.startTime
          }
        : order
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <Timer className="w-4 h-4" />;
      case 'Ready':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'Pending');
  const inProgressOrders = orders.filter(order => order.status === 'In Progress');
  const readyOrders = orders.filter(order => order.status === 'Ready');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-100">
              <Monitor className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Kitchen Display System</h1>
              <p className="text-slate-600">Real-time production monitoring</p>
            </div>
          </div>
        </div>
        
        {/* Current Time */}
        <div className="text-right">
          <div className="text-2xl font-mono font-semibold text-slate-800">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-sm text-slate-600">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Kitchen Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pending Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-slate-800">Pending ({pendingOrders.length})</h2>
          </div>
          {pendingOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{order.product}</h3>
                  <p className="text-sm text-slate-600">{order.orderNumber}</p>
                </div>
                <Badge className={`text-xs rounded-lg ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-medium">{order.quantity} {order.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Station:</span>
                  <span className="font-medium">{order.station}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Est. Time:</span>
                  <span className="font-medium">{order.estimatedTime}min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Customer:</span>
                  <span className="font-medium">{order.customer}</span>
                </div>
                {order.notes && (
                  <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded-lg">
                    Note: {order.notes}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => updateOrderStatus(order.id, 'In Progress')}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Start Cooking
              </Button>
            </Card>
          ))}
        </div>

        {/* In Progress Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">In Progress ({inProgressOrders.length})</h2>
          </div>
          {inProgressOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl bg-blue-50/80 backdrop-blur-sm border-blue-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{order.product}</h3>
                  <p className="text-sm text-slate-600">{order.orderNumber}</p>
                </div>
                <Badge className={`text-xs rounded-lg ${getStatusColor(order.status)}`}>
                  <Timer className="w-3 h-3 mr-1" />
                  {order.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Started:</span>
                  <span className="font-medium">{order.startTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Est. Complete:</span>
                  <span className="font-medium text-blue-600">
                    {order.startTime && new Date(Date.now() + order.estimatedTime * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Station:</span>
                  <span className="font-medium">{order.station}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => updateOrderStatus(order.id, 'Ready')}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Ready
              </Button>
            </Card>
          ))}
        </div>

        {/* Ready Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-800">Ready ({readyOrders.length})</h2>
          </div>
          {readyOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl bg-green-50/80 backdrop-blur-sm border-green-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{order.product}</h3>
                  <p className="text-sm text-slate-600">{order.orderNumber}</p>
                </div>
                <Badge className={`text-xs rounded-lg ${getStatusColor(order.status)}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {order.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-medium">{order.quantity} {order.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Customer:</span>
                  <span className="font-medium">{order.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Station:</span>
                  <span className="font-medium">{order.station}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => updateOrderStatus(order.id, 'Completed')}
                className="w-full rounded-xl bg-slate-600 hover:bg-slate-700 text-white"
              >
                Mark Completed
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Receipt, Search, Plus, Filter, MoreVertical, Calendar, Package, DollarSign, Building2, User, Phone, Mail } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface SalesOrderProps {
  onNavigate: (module: ModuleName) => void;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  weightUnit: string;
  unitPrice: number;
  totalPrice: number;
}

interface SalesOrderData {
  id: string;
  orderNumber: string;
  customerCompany: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  customerAddress: string;
  orderDate: string;
  dueDate: string;
  deliveryDate?: string;
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  items: OrderItem[];
  notes: string;
  salesRep: string;
  discount: number;
  taxes: number;
  finalAmount: number;
}

export function SalesOrder({ onNavigate }: SalesOrderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByPayment, setFilterByPayment] = useState('All');

  // Mock sales order data
  const salesOrders: SalesOrderData[] = [
    {
      id: '1',
      orderNumber: 'SO-2025-001',
      customerCompany: 'Sweet Palace Distributors',
      customerName: 'Rajesh Gupta',
      customerContact: '+91 98765 43210',
      customerEmail: 'rajesh@sweetpalace.com',
      customerAddress: 'Shop 15, Gandhi Market, Mumbai - 400001',
      orderDate: '2025-01-15',
      dueDate: '2025-01-25',
      status: 'In Production',
      priority: 'High',
      totalAmount: 25000,
      paidAmount: 12500,
      paymentStatus: 'Partial',
      salesRep: 'Priya Sharma',
      discount: 1250,
      taxes: 3125,
      finalAmount: 26875,
      notes: 'Premium packaging required. Festival rush order.',
      items: [
        {
          id: '1',
          name: 'Pedha',
          quantity: 100,
          unit: 'pcs',
          weight: 25,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 12500
        },
        {
          id: '2',
          name: 'Kesar Pedha',
          quantity: 50,
          unit: 'pcs',
          weight: 12.5,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 10000
        },
        {
          id: '3',
          name: 'Barfi',
          quantity: 25,
          unit: 'pcs',
          weight: 12.5,
          weightUnit: 'kg',
          unitPrice: 100,
          totalPrice: 2500
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'SO-2025-002',
      customerCompany: 'Golden Sweets Pvt Ltd',
      customerName: 'Amit Singh',
      customerContact: '+91 98765 43211',
      customerEmail: 'amit@goldensweets.com',
      customerAddress: 'Plot 42, Industrial Area, Pune - 411001',
      orderDate: '2025-01-16',
      dueDate: '2025-01-28',
      status: 'Confirmed',
      priority: 'Medium',
      totalAmount: 45000,
      paidAmount: 45000,
      paymentStatus: 'Paid',
      salesRep: 'Vikram Reddy',
      discount: 2250,
      taxes: 5625,
      finalAmount: 48375,
      notes: 'Bulk order for chain stores. Standard packaging.',
      items: [
        {
          id: '4',
          name: 'Milk Cake',
          quantity: 150,
          unit: 'pcs',
          weight: 75,
          weightUnit: 'kg',
          unitPrice: 180,
          totalPrice: 27000
        },
        {
          id: '5',
          name: 'Pedha',
          quantity: 120,
          unit: 'pcs',
          weight: 30,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 15000
        },
        {
          id: '6',
          name: 'Malai Pedha',
          quantity: 20,
          unit: 'pcs',
          weight: 6,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 3000
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'SO-2025-003',
      customerCompany: 'Metro Retail Chain',
      customerName: 'Sneha Patel',
      customerContact: '+91 98765 43212',
      customerEmail: 'sneha@metroretail.com',
      customerAddress: 'Tower A, Business Park, Bangalore - 560001',
      orderDate: '2025-01-18',
      dueDate: '2025-01-22',
      deliveryDate: '2025-01-21',
      status: 'Delivered',
      priority: 'Urgent',
      totalAmount: 15000,
      paidAmount: 15000,
      paymentStatus: 'Paid',
      salesRep: 'Ravi Kumar',
      discount: 750,
      taxes: 1875,
      finalAmount: 16125,
      notes: 'Express delivery required. Premium customer.',
      items: [
        {
          id: '7',
          name: 'Kesar Pedha',
          quantity: 75,
          unit: 'pcs',
          weight: 18.75,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 15000
        }
      ]
    },
    {
      id: '4',
      orderNumber: 'SO-2025-004',
      customerCompany: 'Traditional Foods Co.',
      customerName: 'Manoj Agarwal',
      customerContact: '+91 98765 43213',
      customerEmail: 'manoj@traditionalfoods.com',
      customerAddress: '123 Old City, Delhi - 110001',
      orderDate: '2025-01-17',
      dueDate: '2025-01-30',
      status: 'Pending',
      priority: 'Low',
      totalAmount: 32000,
      paidAmount: 0,
      paymentStatus: 'Pending',
      salesRep: 'Kavita Joshi',
      discount: 1600,
      taxes: 4000,
      finalAmount: 34400,
      notes: 'New customer. Credit approval required.',
      items: [
        {
          id: '8',
          name: 'Barfi',
          quantity: 200,
          unit: 'pcs',
          weight: 100,
          weightUnit: 'kg',
          unitPrice: 100,
          totalPrice: 20000
        },
        {
          id: '9',
          name: 'Milk Cake',
          quantity: 80,
          unit: 'pcs',
          weight: 40,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 12000
        }
      ]
    },
    {
      id: '5',
      orderNumber: 'SO-2025-005',
      customerCompany: 'Royal Confectionery',
      customerName: 'Deepak Sharma',
      customerContact: '+91 98765 43214',
      customerEmail: 'deepak@royalconfectionery.com',
      customerAddress: 'Shop 8, Sweet Market, Jaipur - 302001',
      orderDate: '2025-01-19',
      dueDate: '2025-01-26',
      status: 'Ready for Dispatch',
      priority: 'High',
      totalAmount: 28000,
      paidAmount: 14000,
      paymentStatus: 'Partial',
      salesRep: 'Anita Verma',
      discount: 1400,
      taxes: 3500,
      finalAmount: 30100,
      notes: 'Festival season order. High priority dispatch.',
      items: [
        {
          id: '10',
          name: 'Pedha',
          quantity: 80,
          unit: 'pcs',
          weight: 20,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 10000
        },
        {
          id: '11',
          name: 'Malai Pedha',
          quantity: 60,
          unit: 'pcs',
          weight: 18,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 9000
        },
        {
          id: '12',
          name: 'Kesar Pedha',
          quantity: 45,
          unit: 'pcs',
          weight: 11.25,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 9000
        }
      ]
    },
    {
      id: '6',
      orderNumber: 'SO-2025-006',
      customerCompany: 'Fresh Foods Ltd',
      customerName: 'Suresh Reddy',
      customerContact: '+91 98765 43215',
      customerEmail: 'suresh@freshfoods.com',
      customerAddress: 'Warehouse 12, Food Hub, Chennai - 600001',
      orderDate: '2025-01-12',
      dueDate: '2025-01-20',
      status: 'Overdue',
      priority: 'Urgent',
      totalAmount: 18000,
      paidAmount: 0,
      paymentStatus: 'Overdue',
      salesRep: 'Rajesh Kumar',
      discount: 900,
      taxes: 2250,
      finalAmount: 19350,
      notes: 'Payment overdue. Follow up required.',
      items: [
        {
          id: '13',
          name: 'Barfi',
          quantity: 120,
          unit: 'pcs',
          weight: 60,
          weightUnit: 'kg',
          unitPrice: 100,
          totalPrice: 12000
        },
        {
          id: '14',
          name: 'Milk Cake',
          quantity: 40,
          unit: 'pcs',
          weight: 20,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 6000
        }
      ]
    }
  ];

  const statuses = ['All', 'Pending', 'Confirmed', 'In Production', 'Ready for Dispatch', 'Dispatched', 'Delivered', 'Cancelled', 'Overdue'];
  const paymentStatuses = ['All', 'Pending', 'Partial', 'Paid', 'Overdue'];

  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterByStatus === 'All' || order.status === filterByStatus;
    const matchesPayment = filterByPayment === 'All' || order.paymentStatus === filterByPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ready for Dispatch':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Production':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Dispatched':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const totalOrders = salesOrders.length;
  const pendingOrders = salesOrders.filter(order => ['Pending', 'Confirmed'].includes(order.status)).length;
  const inProductionOrders = salesOrders.filter(order => order.status === 'In Production').length;
  const completedOrders = salesOrders.filter(order => ['Delivered', 'Dispatched'].includes(order.status)).length;
  const totalValue = salesOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  const overdueOrders = salesOrders.filter(order => order.status === 'Overdue' || order.paymentStatus === 'Overdue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-100">
            <Receipt className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Sales Order Management</h1>
            <p className="text-slate-600">Manage customer sales orders and deliveries</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalOrders}</div>
            <div className="text-sm text-slate-600">Total Orders</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-600">{pendingOrders}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-purple-600">{inProductionOrders}</div>
            <div className="text-sm text-slate-600">In Production</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{completedOrders}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">{overdueOrders}</div>
            <div className="text-sm text-slate-600">Overdue</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-pink-600">₹{totalValue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by order number, customer, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={filterByPayment}
            onChange={(e) => setFilterByPayment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Payments' : status}</option>
            ))}
          </select>
          <Button className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Sales Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">
                  {order.customerCompany}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <User className="w-3 h-3 text-slate-400" />
                  <p className="text-sm text-slate-600">{order.customerName}</p>
                </div>
                <p className="text-xs text-slate-500">{order.orderNumber}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={`text-xs rounded-lg ${getStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Priority</span>
                <Badge className={`text-xs rounded-lg ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Due Date</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800">{order.dueDate}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-slate-600">Ordered Items:</span>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-600">
                        {item.quantity} {item.unit} ({item.weight} {item.weightUnit})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Weight</span>
                <span className="text-sm font-medium text-slate-800">
                  {order.items.reduce((sum, item) => sum + item.weight, 0)} kg
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Amount</span>
                <span className="text-sm font-medium text-slate-800">
                  ₹{order.finalAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Payment</span>
                  <Badge className={`text-xs rounded-lg ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress</span>
                    <span>{Math.round((order.paidAmount / order.finalAmount) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(order.paidAmount / order.finalAmount) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Paid: ₹{order.paidAmount.toLocaleString()}</span>
                    <span>Balance: ₹{(order.finalAmount - order.paidAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{order.customerAddress.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{order.customerContact}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Sales Rep: {order.salesRep}</span>
                  <span>Order: {order.orderDate}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No sales orders found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or create a new order</p>
        </div>
      )}
    </div>
  );
}
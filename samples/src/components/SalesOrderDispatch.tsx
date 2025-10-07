import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Truck, Search, Plus, Filter, MoreVertical, Calendar, Package, MapPin, User, Phone, Building2, Pause, MessageSquare, AlertTriangle, Navigation, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

interface SalesOrderDispatchProps {
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

interface DispatchOrderData {
  id: string;
  orderNumber: string;
  customerCompany: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  deliveryAddress: string;
  orderDate: string;
  approvedDate: string;
  dueDate: string;
  dispatchDate?: string;
  estimatedDeliveryDate: string;
  status: 'Ready for Dispatch' | 'Packaging' | 'Dispatched' | 'In Transit' | 'Delivered' | 'On Hold' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  finalAmount: number;
  items: OrderItem[];
  notes: string;
  salesRep: string;
  dispatchTeam?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  trackingNumber?: string;
  specialInstructions: string;
  deliveryType: 'Standard' | 'Express' | 'Same Day' | 'Scheduled';
  distance: string;
  estimatedTravelTime: string;
  onHoldReason?: string;
  onHoldBy?: string;
  onHoldDate?: string;
}

export function SalesOrderDispatch({ onNavigate }: SalesOrderDispatchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByPriority, setFilterByPriority] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrderData | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);

  // Mock dispatch orders data
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrderData[]>([
    {
      id: '1',
      orderNumber: 'SO-2025-001',
      customerCompany: 'Sweet Palace Distributors',
      customerName: 'Rajesh Gupta',
      customerContact: '+91 98765 43210',
      customerEmail: 'rajesh@sweetpalace.com',
      deliveryAddress: 'Shop 15, Gandhi Market, Mumbai - 400001, Maharashtra',
      orderDate: '2025-01-15',
      approvedDate: '2025-01-16',
      dueDate: '2025-01-25',
      estimatedDeliveryDate: '2025-01-24',
      status: 'Ready for Dispatch',
      priority: 'High',
      totalAmount: 25000,
      finalAmount: 26875,
      salesRep: 'Priya Sharma',
      specialInstructions: 'Handle with care. Premium packaging required.',
      deliveryType: 'Express',
      distance: '15 km',
      estimatedTravelTime: '45 mins',
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
      orderNumber: 'SO-2025-005',
      customerCompany: 'Royal Confectionery',
      customerName: 'Deepak Sharma',
      customerContact: '+91 98765 43214',
      customerEmail: 'deepak@royalconfectionery.com',
      deliveryAddress: 'Shop 8, Sweet Market, Jaipur - 302001, Rajasthan',
      orderDate: '2025-01-19',
      approvedDate: '2025-01-20',
      dueDate: '2025-01-26',
      dispatchDate: '2025-01-23',
      estimatedDeliveryDate: '2025-01-24',
      status: 'Dispatched',
      priority: 'High',
      totalAmount: 28000,
      finalAmount: 30100,
      salesRep: 'Anita Verma',
      dispatchTeam: 'Team B',
      vehicleNumber: 'RJ-14-AB-5678',
      driverName: 'Ramesh Singh',
      driverContact: '+91 98765 00003',
      trackingNumber: 'TRK-SO-001-2025',
      specialInstructions: 'Festival season order. Handle with extra care.',
      deliveryType: 'Standard',
      distance: '280 km',
      estimatedTravelTime: '5 hours',
      notes: 'Festival season order. High priority dispatch.',
      items: [
        {
          id: '4',
          name: 'Pedha',
          quantity: 80,
          unit: 'pcs',
          weight: 20,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 10000
        },
        {
          id: '5',
          name: 'Malai Pedha',
          quantity: 60,
          unit: 'pcs',
          weight: 18,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 9000
        },
        {
          id: '6',
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
      id: '3',
      orderNumber: 'SO-2025-009',
      customerCompany: 'Sweet Corner Distributors',
      customerName: 'Vikash Kumar',
      customerContact: '+91 98765 43218',
      customerEmail: 'vikash@sweetcorner.com',
      deliveryAddress: 'Plot 8, Industrial Area, Pune - 411033, Maharashtra',
      orderDate: '2025-01-18',
      approvedDate: '2025-01-19',
      dueDate: '2025-01-28',
      dispatchDate: '2025-01-21',
      estimatedDeliveryDate: '2025-01-22',
      status: 'Delivered',
      priority: 'Medium',
      totalAmount: 45000,
      finalAmount: 48375,
      salesRep: 'Neha Patel',
      dispatchTeam: 'Team A',
      vehicleNumber: 'MH-12-CD-9012',
      driverName: 'Sunil Patil',
      driverContact: '+91 98765 00004',
      trackingNumber: 'TRK-SO-002-2025',
      specialInstructions: 'Regular monthly order. Standard handling.',
      deliveryType: 'Standard',
      distance: '150 km',
      estimatedTravelTime: '3 hours',
      notes: 'Regular monthly order. Standard terms.',
      items: [
        {
          id: '7',
          name: 'Traditional Pedha',
          quantity: 180,
          unit: 'pcs',
          weight: 45,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 22500
        },
        {
          id: '8',
          name: 'Milk Cake',
          quantity: 125,
          unit: 'pcs',
          weight: 62.5,
          weightUnit: 'kg',
          unitPrice: 180,
          totalPrice: 22500
        }
      ]
    },
    {
      id: '4',
      orderNumber: 'SO-2025-012',
      customerCompany: 'Metro Retail Chain',
      customerName: 'Sneha Patel',
      customerContact: '+91 98765 43212',
      customerEmail: 'sneha@metroretail.com',
      deliveryAddress: 'Tower A, Business Park, Bangalore - 560001, Karnataka',
      orderDate: '2025-01-21',
      approvedDate: '2025-01-22',
      dueDate: '2025-01-29',
      estimatedDeliveryDate: '2025-01-26',
      status: 'Packaging',
      priority: 'Urgent',
      totalAmount: 35000,
      finalAmount: 37625,
      salesRep: 'Ravi Kumar',
      specialInstructions: 'Express delivery required. Premium customer.',
      deliveryType: 'Same Day',
      distance: '25 km',
      estimatedTravelTime: '1 hour',
      notes: 'Express delivery required. Premium customer.',
      items: [
        {
          id: '9',
          name: 'Kesar Pedha',
          quantity: 75,
          unit: 'pcs',
          weight: 18.75,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 15000
        },
        {
          id: '10',
          name: 'Premium Barfi',
          quantity: 100,
          unit: 'pcs',
          weight: 50,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 20000
        }
      ]
    },
    {
      id: '5',
      orderNumber: 'SO-2025-008',
      customerCompany: 'Festival Foods Ltd',
      customerName: 'Priyanka Shah',
      customerContact: '+91 98765 43217',
      customerEmail: 'priyanka@festivalfoods.com',
      deliveryAddress: 'Unit 12, Food Court Plaza, Delhi - 110025, NCR',
      orderDate: '2025-01-19',
      approvedDate: '2025-01-20',
      dueDate: '2025-02-05',
      dispatchDate: '2025-01-24',
      estimatedDeliveryDate: '2025-01-27',
      status: 'In Transit',
      priority: 'Urgent',
      totalAmount: 125000,
      finalAmount: 134375,
      salesRep: 'Rohit Sharma',
      dispatchTeam: 'Team C',
      vehicleNumber: 'DL-10-EF-3456',
      driverName: 'Manoj Kumar',
      driverContact: '+91 98765 00005',
      trackingNumber: 'TRK-SO-003-2025',
      specialInstructions: 'Urgent order for festival season. Temperature controlled transport.',
      deliveryType: 'Express',
      distance: '1400 km',
      estimatedTravelTime: '24 hours',
      notes: 'Urgent order for festival season. Requires immediate approval for production scheduling.',
      items: [
        {
          id: '11',
          name: 'Milk Cake',
          quantity: 300,
          unit: 'pcs',
          weight: 150,
          weightUnit: 'kg',
          unitPrice: 180,
          totalPrice: 54000
        },
        {
          id: '12',
          name: 'Pedha',
          quantity: 250,
          unit: 'pcs',
          weight: 62.5,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 31250
        },
        {
          id: '13',
          name: 'Special Barfi',
          quantity: 160,
          unit: 'pcs',
          weight: 80,
          weightUnit: 'kg',
          unitPrice: 250,
          totalPrice: 40000
        }
      ]
    },
    {
      id: '6',
      orderNumber: 'SO-2025-013',
      customerCompany: 'City Sweets Network',
      customerName: 'Arun Mehta',
      customerContact: '+91 98765 43221',
      customerEmail: 'arun@citysweets.com',
      deliveryAddress: 'Central Mall, Sector 18, Noida - 201301, Uttar Pradesh',
      orderDate: '2025-01-20',
      approvedDate: '2025-01-21',
      dueDate: '2025-01-30',
      estimatedDeliveryDate: '2025-01-28',
      status: 'On Hold',
      priority: 'Medium',
      totalAmount: 42000,
      finalAmount: 45150,
      salesRep: 'Kavita Joshi',
      specialInstructions: 'Mall delivery requires coordination with security.',
      deliveryType: 'Scheduled',
      distance: '1200 km',
      estimatedTravelTime: '20 hours',
      notes: 'Mall delivery. Coordinate with security for access.',
      onHoldReason: 'Customer requested to delay delivery due to mall renovation work.',
      onHoldBy: 'John Smith',
      onHoldDate: '2025-01-22',
      items: [
        {
          id: '14',
          name: 'Assorted Pedha',
          quantity: 150,
          unit: 'pcs',
          weight: 37.5,
          weightUnit: 'kg',
          unitPrice: 140,
          totalPrice: 21000
        },
        {
          id: '15',
          name: 'Mixed Barfi',
          quantity: 100,
          unit: 'pcs',
          weight: 50,
          weightUnit: 'kg',
          unitPrice: 210,
          totalPrice: 21000
        }
      ]
    }
  ]);

  const statuses = ['All', 'Ready for Dispatch', 'Packaging', 'Dispatched', 'In Transit', 'Delivered', 'On Hold', 'Delayed'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredOrders = dispatchOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterByStatus === 'All' || order.status === filterByStatus;
    const matchesPriority = filterByPriority === 'All' || order.priority === filterByPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dispatched':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready for Dispatch':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Packaging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delayed':
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

  const getDeliveryTypeColor = (type: string) => {
    switch (type) {
      case 'Same Day':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Express':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Standard':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Transit':
        return <Navigation className="w-4 h-4 text-blue-600" />;
      case 'Dispatched':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'Ready for Dispatch':
        return <Package className="w-4 h-4 text-cyan-600" />;
      case 'Packaging':
        return <Package className="w-4 h-4 text-yellow-600" />;
      case 'On Hold':
        return <Pause className="w-4 h-4 text-orange-600" />;
      case 'Delayed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const handlePutOnHold = (order: DispatchOrderData) => {
    setSelectedOrder(order);
    setHoldReason('');
    setIsHoldDialogOpen(true);
  };

  const confirmPutOnHold = () => {
    if (!selectedOrder || !holdReason.trim()) return;

    const updatedOrders = dispatchOrders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: 'On Hold' as const,
          onHoldReason: holdReason,
          onHoldBy: 'John Smith', // Current user
          onHoldDate: new Date().toISOString().split('T')[0]
        };
      }
      return order;
    });

    setDispatchOrders(updatedOrders);
    setIsHoldDialogOpen(false);
    setSelectedOrder(null);
    setHoldReason('');
  };

  // Calculate statistics
  const totalOrders = dispatchOrders.length;
  const readyForDispatch = dispatchOrders.filter(order => order.status === 'Ready for Dispatch').length;
  const inTransit = dispatchOrders.filter(order => ['Dispatched', 'In Transit'].includes(order.status)).length;
  const delivered = dispatchOrders.filter(order => order.status === 'Delivered').length;
  const packaging = dispatchOrders.filter(order => order.status === 'Packaging').length;
  const onHold = dispatchOrders.filter(order => order.status === 'On Hold').length;
  const totalValue = dispatchOrders.reduce((sum, order) => sum + order.finalAmount, 0);

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
          <div className="p-2 rounded-xl bg-cyan-100">
            <Truck className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Sales Order Dispatch</h1>
            <p className="text-slate-600">Manage order dispatch and delivery</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalOrders}</div>
            <div className="text-sm text-slate-600">Total Orders</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-cyan-600">{readyForDispatch}</div>
            <div className="text-sm text-slate-600">Ready</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-600">{packaging}</div>
            <div className="text-sm text-slate-600">Packaging</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-purple-600">{inTransit}</div>
            <div className="text-sm text-slate-600">In Transit</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{delivered}</div>
            <div className="text-sm text-slate-600">Delivered</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{onHold}</div>
            <div className="text-sm text-slate-600">On Hold</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-cyan-600">₹{totalValue.toLocaleString()}</div>
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
            value={filterByPriority}
            onChange={(e) => setFilterByPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority === 'All' ? 'All Priorities' : priority}</option>
            ))}
          </select>
          <Button className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Dispatch
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
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Priority</span>
                <Badge className={`text-xs rounded-lg ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Delivery Type</span>
                <Badge className={`text-xs rounded-lg ${getDeliveryTypeColor(order.deliveryType)}`}>
                  {order.deliveryType}
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
                <span className="text-sm text-slate-600">Items for Dispatch:</span>
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

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{order.deliveryAddress.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{order.customerContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Distance:</span>
                  <span className="text-slate-800">{order.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Travel Time:</span>
                  <span className="text-slate-800">{order.estimatedTravelTime}</span>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tracking:</span>
                      <span className="font-medium text-slate-800">{order.trackingNumber}</span>
                    </div>
                    {order.vehicleNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Vehicle:</span>
                        <span className="text-slate-800">{order.vehicleNumber}</span>
                      </div>
                    )}
                    {order.driverName && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Driver:</span>
                        <span className="text-slate-800">{order.driverName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.onHoldReason && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <Pause className="w-3 h-3 text-orange-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="text-orange-700 font-medium">On Hold by {order.onHoldBy}</p>
                      <p className="text-slate-600 mt-1">{order.onHoldReason}</p>
                      <p className="text-slate-500 mt-1">Date: {order.onHoldDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.specialInstructions && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs">
                    <span className="text-slate-600 font-medium">Special Instructions:</span>
                    <p className="text-slate-700 mt-1">{order.specialInstructions}</p>
                  </div>
                </div>
              )}

              {(order.status === 'Ready for Dispatch' || order.status === 'Packaging') && (
                <div className="pt-3 border-t border-slate-200">
                  <Button 
                    onClick={() => handlePutOnHold(order)}
                    variant="outline"
                    className="w-full rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50"
                    size="sm"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Put on Hold
                  </Button>
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Sales Rep: {order.salesRep}</span>
                  <span>Est. Delivery: {order.estimatedDeliveryDate}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No dispatch orders found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or check back later for new orders</p>
        </div>
      )}

      {/* Put on Hold Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Put Dispatch on Hold</DialogTitle>
            <DialogDescription>
              Please provide a reason for putting this dispatch order on hold.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-800 mb-2">Order Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-medium">Customer:</span> {selectedOrder.customerCompany}</p>
                  <p><span className="font-medium">Amount:</span> ₹{selectedOrder.finalAmount.toLocaleString()}</p>
                  <p><span className="font-medium">Due Date:</span> {selectedOrder.dueDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Hold (Required)
                </label>
                <Textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="Please specify the reason for putting this dispatch on hold..."
                  className="rounded-xl"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsHoldDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPutOnHold}
              className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!holdReason.trim()}
            >
              Put on Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
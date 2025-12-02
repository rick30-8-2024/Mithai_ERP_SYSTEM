import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Truck, Search, Plus, Filter, MoreVertical, Calendar, Package, MapPin, User, Phone, Building2, Pause, MessageSquare, AlertTriangle, Navigation, CheckCircle, ClipboardList, ChevronRight, ChevronLeft, Cookie, Box, Clock, X, Printer, FileText, Receipt } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

interface SalesOrderDispatchProps {
  onNavigate: (module: ModuleName) => void;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  dispatchedQuantity?: number; // Track how much has already been dispatched
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
  status: 'Ready for Dispatch' | 'Packaging' | 'Partially Fulfilled' | 'Dispatched' | 'In Transit' | 'Delivered' | 'On Hold' | 'Delayed';
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

interface WorkOrderData {
  id: string;
  workOrderNumber: string;
  recipeName: string;
  batchSize: number;
  targetQuantity: number;
  actualQuantity: number;
  status: 'In Progress' | 'Completed' | 'Scheduled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledDate: string;
  completedDate?: string;
  assignedWorker: string;
}

interface FinishedGoodData {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

interface SkuAssignment {
  id: string;
  skuAssigned: string;
  quantityAssigned: number;
}

interface ItemInventory {
  itemId: string;
  skuAssignments: SkuAssignment[];
}

interface LogisticsEntry {
  id: string;
  transportService: string;
  otherTransportService: string;
  vehicleNumber: string;
  comments: string;
  itemAllocations: Record<string, number>; // itemId -> quantity allocated to this vehicle
}

export function SalesOrderDispatch({ onNavigate }: SalesOrderDispatchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByPriority, setFilterByPriority] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrderData | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Complete Dispatch Dialog State
  const [isCompleteDispatchDialogOpen, setIsCompleteDispatchDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('inventory');
  const [itemInventories, setItemInventories] = useState<Record<string, ItemInventory>>({});
  const [logisticsEntries, setLogisticsEntries] = useState<LogisticsEntry[]>([]);
  const [transportService, setTransportService] = useState('');
  const [otherTransportService, setOtherTransportService] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [logisticsComments, setLogisticsComments] = useState('');

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

  // Mock work orders data
  const workOrders: WorkOrderData[] = [
    {
      id: '1',
      workOrderNumber: 'WO-2025-001',
      recipeName: 'Pedha',
      batchSize: 5,
      targetQuantity: 200,
      actualQuantity: 200,
      status: 'In Progress',
      priority: 'High',
      scheduledDate: '2025-10-10',
      assignedWorker: 'Ramesh Kumar'
    },
    {
      id: '2',
      workOrderNumber: 'WO-2025-002',
      recipeName: 'Kesar Pedha',
      batchSize: 3,
      targetQuantity: 120,
      actualQuantity: 120,
      status: 'In Progress',
      priority: 'Urgent',
      scheduledDate: '2025-10-10',
      assignedWorker: 'Suresh Patel'
    },
    {
      id: '3',
      workOrderNumber: 'WO-2025-003',
      recipeName: 'Milk Cake',
      batchSize: 4,
      targetQuantity: 150,
      actualQuantity: 150,
      status: 'Scheduled',
      priority: 'Medium',
      scheduledDate: '2025-10-11',
      assignedWorker: 'Vijay Singh'
    },
    {
      id: '4',
      workOrderNumber: 'WO-2025-004',
      recipeName: 'Barfi',
      batchSize: 2,
      targetQuantity: 80,
      actualQuantity: 80,
      status: 'Completed',
      priority: 'High',
      scheduledDate: '2025-10-09',
      completedDate: '2025-10-10',
      assignedWorker: 'Manoj Sharma'
    },
    {
      id: '5',
      workOrderNumber: 'WO-2025-005',
      recipeName: 'Special Barfi',
      batchSize: 3,
      targetQuantity: 100,
      actualQuantity: 100,
      status: 'Completed',
      priority: 'Urgent',
      scheduledDate: '2025-10-09',
      completedDate: '2025-10-09',
      assignedWorker: 'Rajesh Gupta'
    },
    {
      id: '6',
      workOrderNumber: 'WO-2025-006',
      recipeName: 'Malai Pedha',
      batchSize: 2,
      targetQuantity: 60,
      actualQuantity: 60,
      status: 'In Progress',
      priority: 'Medium',
      scheduledDate: '2025-10-10',
      assignedWorker: 'Anil Kumar'
    }
  ];

  // Mock finished goods data
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodData[]>([
    {
      id: '1',
      name: 'Pedha',
      sku: 'PD-001',
      currentStock: 240,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-10'
    },
    {
      id: '2',
      name: 'Kesar Pedha',
      sku: 'KP-002',
      currentStock: 85,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-10'
    },
    {
      id: '3',
      name: 'Milk Cake',
      sku: 'MC-003',
      currentStock: 180,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-09'
    },
    {
      id: '4',
      name: 'Barfi',
      sku: 'BF-004',
      currentStock: 35,
      unit: 'pcs',
      status: 'Low Stock',
      lastUpdated: '2025-10-10'
    },
    {
      id: '5',
      name: 'Premium Barfi',
      sku: 'PBF-005',
      currentStock: 120,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-10'
    },
    {
      id: '6',
      name: 'Special Barfi',
      sku: 'SBF-006',
      currentStock: 160,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-09'
    },
    {
      id: '7',
      name: 'Malai Pedha',
      sku: 'MP-007',
      currentStock: 60,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-10'
    },
    {
      id: '8',
      name: 'Traditional Pedha',
      sku: 'TP-008',
      currentStock: 190,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-09'
    },
    {
      id: '9',
      name: 'Assorted Pedha',
      sku: 'AP-009',
      currentStock: 150,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-09'
    },
    {
      id: '10',
      name: 'Mixed Barfi',
      sku: 'MB-010',
      currentStock: 105,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-10-09'
    }
  ]);

  const statuses = ['All', 'Ready for Dispatch', 'Packaging', 'Dispatched', 'In Transit', 'Delivered', 'On Hold', 'Delayed'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  // Transport services options
  const transportServices = [
    'Blue Dart',
    'DTDC',
    'Delhivery',
    'FedEx',
    'India Post',
    'Professional Couriers',
    'Gati',
    'Other'
  ];

  // Filter work orders for active and recently completed (last 24 hours)
  const getRelevantWorkOrders = () => {
    const now = new Date('2025-10-10'); // Current date
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return workOrders.filter(wo => {
      if (wo.status === 'In Progress' || wo.status === 'Scheduled') {
        return true;
      }
      if (wo.status === 'Completed' && wo.completedDate) {
        const completedDate = new Date(wo.completedDate);
        return completedDate >= yesterday;
      }
      return false;
    });
  };

  // Get unique product names from dispatch orders that need dispatching
  const getProductsNeedingDispatch = () => {
    const products = new Set<string>();
    dispatchOrders
      .filter(order => ['Ready for Dispatch', 'Packaging'].includes(order.status))
      .forEach(order => {
        order.items.forEach(item => products.add(item.name));
      });
    return Array.from(products);
  };

  // Filter finished goods based on what's needed for dispatch
  const getRelevantFinishedGoods = () => {
    const neededProducts = getProductsNeedingDispatch();
    return finishedGoods.filter(fg => 
      neededProducts.some(product => 
        fg.name.toLowerCase().includes(product.toLowerCase()) || 
        product.toLowerCase().includes(fg.name.toLowerCase())
      )
    );
  };

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

  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Low Stock':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handlePrintGatePass = (order: DispatchOrderData) => {
    toast.success(`Printing Gate Pass for ${order.orderNumber}`);
    // TODO: Implement actual Gate Pass printing functionality
    console.log('Print Gate Pass for order:', order);
  };

  const handlePrintChalaan = (order: DispatchOrderData) => {
    toast.success(`Printing Chalaan for ${order.orderNumber}`);
    // TODO: Implement actual Chalaan printing functionality
    console.log('Print Chalaan for order:', order);
  };

  const handlePrintEWayBill = (order: DispatchOrderData) => {
    toast.success(`Printing eWay Bill for ${order.orderNumber}`);
    // TODO: Implement actual eWay Bill printing functionality
    console.log('Print eWay Bill for order:', order);
  };

  const handleCompleteDispatch = (order: DispatchOrderData) => {
    setSelectedOrder(order);
    setCurrentTab('inventory');
    // Initialize item inventories with one empty SKU assignment for each item
    const initialInventories: Record<string, ItemInventory> = {};
    order.items.forEach(item => {
      // Only create assignment for remaining quantity
      const remainingQty = item.quantity - (item.dispatchedQuantity || 0);
      if (remainingQty > 0) {
        initialInventories[item.id] = {
          itemId: item.id,
          skuAssignments: [{
            id: `${item.id}-0`,
            skuAssigned: '',
            quantityAssigned: 0
          }]
        };
      }
    });
    setItemInventories(initialInventories);
    
    // Initialize one logistics entry
    const initialAllocations: Record<string, number> = {};
    order.items.forEach(item => {
      initialAllocations[item.id] = 0;
    });
    
    setLogisticsEntries([{
      id: 'logistics-0',
      transportService: '',
      otherTransportService: '',
      vehicleNumber: '',
      comments: '',
      itemAllocations: initialAllocations
    }]);
    
    setTransportService('');
    setOtherTransportService('');
    setVehicleNumber('');
    setLogisticsComments('');
    setIsCompleteDispatchDialogOpen(true);
  };

  const addSkuAssignment = (itemId: string) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      const newId = `${itemId}-${currentAssignments.length}`;
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: [
            ...currentAssignments,
            {
              id: newId,
              skuAssigned: '',
              quantityAssigned: 0
            }
          ]
        }
      };
    });
  };

  const removeSkuAssignment = (itemId: string, assignmentId: string) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      // Don't allow removing if it's the last assignment
      if (currentAssignments.length <= 1) return prev;
      
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: currentAssignments.filter(sa => sa.id !== assignmentId)
        }
      };
    });
  };

  const updateSkuAssignment = (itemId: string, assignmentId: string, field: 'skuAssigned' | 'quantityAssigned', value: string | number) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: currentAssignments.map(sa => 
            sa.id === assignmentId 
              ? { ...sa, [field]: value }
              : sa
          )
        }
      };
    });
  };

  const getTotalAssignedQuantity = (itemId: string): number => {
    const assignments = itemInventories[itemId]?.skuAssignments || [];
    return assignments.reduce((sum, sa) => sum + (sa.quantityAssigned || 0), 0);
  };

  const addLogisticsEntry = () => {
    if (!selectedOrder) return;
    
    const initialAllocations: Record<string, number> = {};
    selectedOrder.items.forEach(item => {
      initialAllocations[item.id] = 0;
    });
    
    const newEntry: LogisticsEntry = {
      id: `logistics-${logisticsEntries.length}`,
      transportService: '',
      otherTransportService: '',
      vehicleNumber: '',
      comments: '',
      itemAllocations: initialAllocations
    };
    
    setLogisticsEntries([...logisticsEntries, newEntry]);
  };

  const removeLogisticsEntry = (entryId: string) => {
    if (logisticsEntries.length <= 1) return;
    setLogisticsEntries(logisticsEntries.filter(entry => entry.id !== entryId));
  };

  const updateLogisticsEntry = (entryId: string, field: keyof LogisticsEntry, value: any) => {
    setLogisticsEntries(logisticsEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  const updateItemAllocation = (entryId: string, itemId: string, quantity: number) => {
    setLogisticsEntries(logisticsEntries.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            itemAllocations: {
              ...entry.itemAllocations,
              [itemId]: quantity
            }
          }
        : entry
    ));
  };

  const getTotalAllocatedForItem = (itemId: string): number => {
    return logisticsEntries.reduce((sum, entry) => 
      sum + (entry.itemAllocations[itemId] || 0), 0
    );
  };

  const isInventoryValid = () => {
    if (!selectedOrder) return false;
    
    // Check if at least one item has a valid assignment
    let hasAtLeastOneAssignment = false;
    
    for (const item of selectedOrder.items) {
      const alreadyDispatched = item.dispatchedQuantity || 0;
      const remainingToDispatch = item.quantity - alreadyDispatched;
      
      // Skip fully dispatched items
      if (remainingToDispatch <= 0) continue;
      
      const totalAssigned = getTotalAssignedQuantity(item.id);
      const assignments = itemInventories[item.id]?.skuAssignments || [];
      
      // Check for over-assignment
      if (totalAssigned > remainingToDispatch) return false;
      
      // Check if there are any valid assignments (SKU selected and quantity > 0)
      const validAssignments = assignments.filter(sa => 
        sa.skuAssigned && sa.quantityAssigned > 0
      );
      
      if (validAssignments.length > 0) {
        hasAtLeastOneAssignment = true;
      }
      
      // Check that all filled assignments are complete (if SKU is selected, quantity must be > 0 and vice versa)
      const hasInvalidAssignments = assignments.some(sa => 
        (sa.skuAssigned && !sa.quantityAssigned) || 
        (!sa.skuAssigned && sa.quantityAssigned > 0)
      );
      
      if (hasInvalidAssignments) return false;
    }
    
    return hasAtLeastOneAssignment;
  };

  const isLogisticsValid = () => {
    if (!selectedOrder) return false;
    
    // Check if all logistics entries have required fields and valid allocations
    const allEntriesValid = logisticsEntries.every(entry => {
      const hasTransport = entry.transportService === 'Other' 
        ? entry.otherTransportService.trim() !== '' 
        : entry.transportService !== '';
      const hasVehicle = entry.vehicleNumber.trim() !== '';
      const hasAllocations = Object.values(entry.itemAllocations).some(qty => qty > 0);
      return hasTransport && hasVehicle && hasAllocations;
    });
    
    if (!allEntriesValid) return false;
    
    // Check that allocated quantities don't exceed assigned quantities for each item
    // and at least one item has allocation
    let hasAtLeastOneAllocation = false;
    
    for (const item of selectedOrder.items) {
      const alreadyDispatched = item.dispatchedQuantity || 0;
      const remainingToDispatch = item.quantity - alreadyDispatched;
      
      // Skip fully dispatched items
      if (remainingToDispatch <= 0) continue;
      
      const totalAssigned = getTotalAssignedQuantity(item.id);
      const totalAllocated = getTotalAllocatedForItem(item.id);
      
      // Check for over-allocation (can't allocate more than assigned)
      if (totalAllocated > totalAssigned) return false;
      
      if (totalAllocated > 0) {
        hasAtLeastOneAllocation = true;
      }
    }
    
    return hasAtLeastOneAllocation;
  };

  const isCompleteDispatchValid = () => {
    return isInventoryValid() && isLogisticsValid();
  };

  const confirmCompleteDispatch = () => {
    if (!selectedOrder || !isCompleteDispatchValid()) return;

    // Deduct inventory from finished goods
    const updatedFinishedGoods = finishedGoods.map(fg => {
      let deduction = 0;
      Object.values(itemInventories).forEach(inventory => {
        inventory.skuAssignments.forEach(assignment => {
          if (assignment.skuAssigned === fg.sku) {
            deduction += assignment.quantityAssigned;
          }
        });
      });
      
      if (deduction > 0) {
        const newStock = fg.currentStock - deduction;
        return {
          ...fg,
          currentStock: newStock,
          status: newStock === 0 ? 'Out of Stock' as const : newStock < 50 ? 'Low Stock' as const : 'In Stock' as const,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return fg;
    });

    setFinishedGoods(updatedFinishedGoods);

    // Update order status to Dispatched
    const finalTransportService = transportService === 'Other' ? otherTransportService : transportService;
    const trackingNumber = `TRK-${selectedOrder.orderNumber}-${new Date().getFullYear()}`;
    
    const updatedOrders = dispatchOrders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: 'Dispatched' as const,
          dispatchDate: new Date().toISOString().split('T')[0],
          vehicleNumber: vehicleNumber,
          trackingNumber: trackingNumber,
          dispatchTeam: finalTransportService,
          notes: order.notes + (logisticsComments ? `\n\nLogistics: ${logisticsComments}` : '')
        };
      }
      return order;
    });

    setDispatchOrders(updatedOrders);
    setIsCompleteDispatchDialogOpen(false);
    setSelectedOrder(null);
    setItemInventories({});
    setTransportService('');
    setOtherTransportService('');
    setVehicleNumber('');
    setLogisticsComments('');
  };

  // Calculate statistics
  const totalOrders = dispatchOrders.length;
  const readyForDispatch = dispatchOrders.filter(order => order.status === 'Ready for Dispatch').length;
  const inTransit = dispatchOrders.filter(order => ['Dispatched', 'In Transit'].includes(order.status)).length;
  const delivered = dispatchOrders.filter(order => order.status === 'Delivered').length;
  const packaging = dispatchOrders.filter(order => order.status === 'Packaging').length;
  const onHold = dispatchOrders.filter(order => order.status === 'On Hold').length;
  const totalValue = dispatchOrders.reduce((sum, order) => sum + order.finalAmount, 0);

  const relevantWorkOrders = getRelevantWorkOrders();
  const relevantFinishedGoods = getRelevantFinishedGoods();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 md:p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
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

      <div className="flex">
        {/* Left Sidebar - Work Orders */}
        <div 
          className={`${
            leftSidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 border-r border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">Work Orders</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSidebarOpen(false)}
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                {relevantWorkOrders.map(wo => (
                  <Card 
                    key={wo.id} 
                    className="rounded-xl bg-white border-slate-200 p-3 hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{wo.recipeName}</p>
                          <p className="text-xs text-slate-500">{wo.workOrderNumber}</p>
                        </div>
                        <Badge className={`text-xs rounded-lg ${getWorkOrderStatusColor(wo.status)}`}>
                          {wo.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Quantity:</span>
                          <span className="font-medium text-slate-800">{wo.actualQuantity} pcs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Worker:</span>
                          <span className="text-slate-800">{wo.assignedWorker}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Date:</span>
                          <span className="text-slate-800">{wo.scheduledDate}</span>
                        </div>
                        {wo.completedDate && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Completed:</span>
                            <span className="text-green-700">{wo.completedDate}</span>
                          </div>
                        )}
                      </div>

                      <Badge className={`text-xs rounded-lg ${getPriorityColor(wo.priority)}`}>
                        {wo.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-600 space-y-1">
                <p>Active: {relevantWorkOrders.filter(wo => wo.status === 'In Progress').length}</p>
                <p>Completed (24h): {relevantWorkOrders.filter(wo => wo.status === 'Completed').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle button when left sidebar is closed */}
        {!leftSidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftSidebarOpen(true)}
            className="absolute left-0 top-32 rounded-r-lg bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90 z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem 
                        onClick={() => handlePrintGatePass(order)}
                        className="rounded-lg cursor-pointer"
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Print Gate Pass
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handlePrintChalaan(order)}
                        className="rounded-lg cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Print Chalaan
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handlePrintEWayBill(order)}
                        className="rounded-lg cursor-pointer"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print eWay Bill
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
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

                  {(order.status === 'Ready for Dispatch' || order.status === 'Packaging' || order.status === 'Partially Fulfilled') && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      {order.status !== 'Partially Fulfilled' && (
                        <Button 
                          onClick={() => handlePutOnHold(order)}
                          variant="outline"
                          className="w-full rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50"
                          size="sm"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Put on Hold
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleCompleteDispatch(order)}
                        className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {order.status === 'Partially Fulfilled' ? 'Continue Dispatch' : 'Complete Dispatch'}
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Sales Rep: {order.salesRep}</span>
                      <span>Est. Delivery: {order.estimatedDeliveryDate}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Status</span>
                        <span className="text-slate-800">{order.status}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Priority</span>
                        <span className="text-slate-800">{order.priority}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Delivery Type</span>
                        <span className="text-slate-800">{order.deliveryType}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Due Date</span>
                        <span className="text-slate-800">{order.dueDate}</span>
                      </div>
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
        </div>

        {/* Right Sidebar - Finished Goods Inventory */}
        <div 
          className={`${
            rightSidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 border-l border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-slate-800">Inventory</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebarOpen(false)}
                className="rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-800">
                Showing items relevant to current dispatch orders
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-3">
                {relevantFinishedGoods.map(fg => (
                  <Card 
                    key={fg.id} 
                    className="rounded-xl bg-white border-slate-200 p-3 hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{fg.name}</p>
                          <p className="text-xs text-slate-500">{fg.sku}</p>
                        </div>
                        <Badge className={`text-xs rounded-lg ${getStockStatusColor(fg.status)}`}>
                          {fg.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Current Stock:</span>
                          <span className="font-semibold text-slate-800 text-base">
                            {fg.currentStock} {fg.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Last Updated:</span>
                          <span className="text-slate-800">{fg.lastUpdated}</span>
                        </div>
                      </div>

                      {fg.status === 'Low Stock' && (
                        <div className="pt-2 mt-2 border-t border-orange-200">
                          <div className="flex items-center gap-1 text-orange-700">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Stock running low</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-600 space-y-1">
                <p>Total Items: {relevantFinishedGoods.length}</p>
                <p>Low Stock: {relevantFinishedGoods.filter(fg => fg.status === 'Low Stock').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle button when right sidebar is closed */}
        {!rightSidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightSidebarOpen(true)}
            className="absolute right-0 top-32 rounded-l-lg bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

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

      {/* Complete Dispatch Dialog */}
      <Dialog open={isCompleteDispatchDialogOpen} onOpenChange={setIsCompleteDispatchDialogOpen}>
        <DialogContent className="rounded-2xl max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.status === 'Partially Fulfilled' ? 'Continue Dispatch' : 'Complete Dispatch'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.status === 'Partially Fulfilled' 
                ? 'Complete the remaining items for this partially fulfilled order.' 
                : 'Assign inventory and logistics details to complete this dispatch order.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              {/* Order Summary - Always visible */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-slate-800 mb-2">Order Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-medium">Customer:</span> {selectedOrder.customerCompany}</p>
                  <p><span className="font-medium">Amount:</span> ₹{selectedOrder.finalAmount.toLocaleString()}</p>
                  {selectedOrder.items.some(item => (item.dispatchedQuantity || 0) > 0) && (
                    <p className="text-amber-700 font-medium">
                      ⚠️ Partial Fulfillment - Some items already dispatched
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="inventory" className="rounded-lg">
                  <Package className="w-4 h-4 mr-2" />
                  Inventory Assignment
                </TabsTrigger>
                <TabsTrigger value="logistics" className="rounded-lg" disabled={!isInventoryValid()}>
                  <Truck className="w-4 h-4 mr-2" />
                  Logistics Details
                </TabsTrigger>
              </TabsList>

              {/* Tab: Inventory Assignment */}
              <TabsContent value="inventory" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Assign one or more SKUs for each item to be dispatched. You can dispatch partial quantities - remaining items can be dispatched later.
                </p>
                
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => {
                    const alreadyDispatched = item.dispatchedQuantity || 0;
                    const remainingToDispatch = item.quantity - alreadyDispatched;
                    
                    // Skip items that are fully dispatched
                    if (remainingToDispatch <= 0) return null;
                    
                    const totalAssigned = getTotalAssignedQuantity(item.id);
                    const remaining = remainingToDispatch - totalAssigned;
                    const isComplete = totalAssigned === remainingToDispatch;
                    const isOverAssigned = totalAssigned > remainingToDispatch;
                    
                    return (
                      <Card key={item.id} className="rounded-xl bg-white border-slate-200 p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-800">{item.name}</h4>
                              <p className="text-sm text-slate-600">
                                Total Ordered: {item.quantity} {item.unit}
                              </p>
                              {alreadyDispatched > 0 && (
                                <p className="text-xs text-blue-600">
                                  Already Dispatched: {alreadyDispatched} {item.unit}
                                </p>
                              )}
                              <p className="text-sm font-medium text-slate-800">
                                Remaining: {remainingToDispatch} {item.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                isComplete ? 'text-green-700' : 
                                isOverAssigned ? 'text-red-700' : 
                                'text-amber-700'
                              }`}>
                                {totalAssigned} / {remainingToDispatch} {item.unit}
                              </div>
                              {remaining > 0 && (
                                <div className="text-xs text-amber-600">
                                  {remaining} remaining
                                </div>
                              )}
                              {isOverAssigned && (
                                <div className="text-xs text-red-600">
                                  {Math.abs(remaining)} over
                                </div>
                              )}
                            </div>
                          </div>

                          {/* SKU Assignments List */}
                          <div className="space-y-3">
                            {itemInventories[item.id]?.skuAssignments.map((assignment, index) => (
                              <div key={assignment.id} className="space-y-2 p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-slate-700">SKU #{index + 1}</span>
                                  {itemInventories[item.id].skuAssignments.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSkuAssignment(item.id, assignment.id)}
                                      className="h-6 w-6 p-0 rounded-lg hover:bg-red-50"
                                    >
                                      <X className="w-3 h-3 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`sku-${assignment.id}`} className="text-xs">
                                      SKU <span className="text-red-600">*</span>
                                    </Label>
                                    <select
                                      id={`sku-${assignment.id}`}
                                      value={assignment.skuAssigned}
                                      onChange={(e) => updateSkuAssignment(item.id, assignment.id, 'skuAssigned', e.target.value)}
                                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs mt-1"
                                    >
                                      <option value="">Select SKU...</option>
                                      {finishedGoods
                                        .filter(fg => 
                                          fg.name.toLowerCase().includes(item.name.toLowerCase()) || 
                                          item.name.toLowerCase().includes(fg.name.toLowerCase())
                                        )
                                        .map(fg => (
                                          <option key={fg.sku} value={fg.sku}>
                                            {fg.sku} - {fg.name} (Avail: {fg.currentStock})
                                          </option>
                                        ))
                                      }
                                    </select>
                                  </div>

                                  <div>
                                    <Label htmlFor={`qty-${assignment.id}`} className="text-xs">
                                      Quantity <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                      id={`qty-${assignment.id}`}
                                      type="number"
                                      min="0"
                                      value={assignment.quantityAssigned || ''}
                                      onChange={(e) => updateSkuAssignment(item.id, assignment.id, 'quantityAssigned', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                      className="rounded-lg mt-1 text-xs"
                                    />
                                  </div>
                                </div>

                                {assignment.skuAssigned && assignment.quantityAssigned > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
                                    ✓ {assignment.quantityAssigned} {item.unit} from {assignment.skuAssigned}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add Another SKU Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSkuAssignment(item.id)}
                            className="w-full rounded-lg border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="w-3 h-3 mr-2" />
                            Add Another SKU
                          </Button>

                          {/* Status Summary */}
                          {isComplete && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800">
                              ✓ Full quantity assigned: {remainingToDispatch} {item.unit}
                            </div>
                          )}
                          {!isComplete && !isOverAssigned && totalAssigned > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
                              ℹ️ Partial assignment: {totalAssigned} of {remainingToDispatch} {item.unit}
                            </div>
                          )}
                          {isOverAssigned && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-800">
                              ⚠️ Over-assigned by {Math.abs(remaining)} {item.unit}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Tab: Logistics Details */}
              <TabsContent value="logistics" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Allocate assigned inventory across one or more vehicles. Only allocated quantities will be dispatched in this shipment.
                </p>

                <div className="space-y-4">
                  {logisticsEntries.map((entry, entryIndex) => (
                    <Card key={entry.id} className="rounded-xl bg-white border-slate-200 p-4">
                      <div className="space-y-4">
                        {/* Entry Header */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-800">
                            Vehicle #{entryIndex + 1}
                          </h4>
                          {logisticsEntries.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLogisticsEntry(entry.id)}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                        {/* Transport Details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">
                              Transport Service <span className="text-red-600">*</span>
                            </Label>
                            <select
                              value={entry.transportService}
                              onChange={(e) => updateLogisticsEntry(entry.id, 'transportService', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm mt-1"
                            >
                              <option value="">Select...</option>
                              {transportServices.map(service => (
                                <option key={service} value={service}>{service}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label className="text-sm">
                              Vehicle Number <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={entry.vehicleNumber}
                              onChange={(e) => updateLogisticsEntry(entry.id, 'vehicleNumber', e.target.value)}
                              placeholder="e.g., MH-12-AB-1234"
                              className="rounded-lg mt-1"
                            />
                          </div>
                        </div>

                        {entry.transportService === 'Other' && (
                          <div>
                            <Label className="text-sm">
                              Specify Transport Service <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={entry.otherTransportService}
                              onChange={(e) => updateLogisticsEntry(entry.id, 'otherTransportService', e.target.value)}
                              placeholder="Enter transport service name..."
                              className="rounded-lg mt-1"
                            />
                          </div>
                        )}

                        {/* Item Allocations */}
                        <div>
                          <Label className="text-sm mb-2 block">Item Allocation</Label>
                          <div className="space-y-2">
                            {selectedOrder.items.map(item => {
                              const alreadyDispatched = item.dispatchedQuantity || 0;
                              const remainingToDispatch = item.quantity - alreadyDispatched;
                              
                              // Skip fully dispatched items
                              if (remainingToDispatch <= 0) return null;
                              
                              const totalAssigned = getTotalAssignedQuantity(item.id);
                              const alreadyAllocated = getTotalAllocatedForItem(item.id) - (entry.itemAllocations[item.id] || 0);
                              const available = totalAssigned - alreadyAllocated;
                              
                              return (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                    <p className="text-xs text-slate-600">
                                      Available: {available} {item.unit}
                                    </p>
                                  </div>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={available + (entry.itemAllocations[item.id] || 0)}
                                    value={entry.itemAllocations[item.id] || ''}
                                    onChange={(e) => updateItemAllocation(entry.id, item.id, parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-24 rounded-lg text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Comments */}
                        <div>
                          <Label className="text-sm">Additional Comments</Label>
                          <Textarea
                            value={entry.comments}
                            onChange={(e) => updateLogisticsEntry(entry.id, 'comments', e.target.value)}
                            placeholder="Any additional logistics details..."
                            className="rounded-xl mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Add Another Vehicle Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLogisticsEntry}
                    className="w-full rounded-lg border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Vehicle (Partial Delivery)
                  </Button>
                </div>

                {/* Allocation Summary */}
                <Card className="rounded-xl bg-blue-50 border-blue-200 p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Dispatch Summary</h4>
                  <div className="space-y-1 text-sm">
                    {selectedOrder.items.map(item => {
                      const alreadyDispatched = item.dispatchedQuantity || 0;
                      const remainingToDispatch = item.quantity - alreadyDispatched;
                      
                      // Skip fully dispatched items
                      if (remainingToDispatch <= 0) return null;
                      
                      const totalAssigned = getTotalAssignedQuantity(item.id);
                      const totalAllocated = getTotalAllocatedForItem(item.id);
                      const isComplete = totalAllocated === totalAssigned && totalAssigned > 0;
                      
                      return (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-blue-800">{item.name}:</span>
                          <div className="text-right">
                            <div className={isComplete && totalAllocated === remainingToDispatch ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                              {totalAllocated} {item.unit} in this shipment
                              {isComplete && totalAllocated === remainingToDispatch && ' ✓'}
                            </div>
                            {totalAllocated < remainingToDispatch && totalAllocated > 0 && (
                              <div className="text-xs text-slate-600">
                                ({remainingToDispatch - totalAllocated} will remain for later)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCompleteDispatchDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            
            {currentTab === 'inventory' ? (
              <Button 
                onClick={() => setCurrentTab('logistics')}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!isInventoryValid()}
              >
                Next: Logistics
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentTab('inventory')}
                  className="rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={confirmCompleteDispatch}
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                  disabled={!isCompleteDispatchValid()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Dispatch
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, ShoppingCart, Search, Plus, Filter, MoreVertical, Calendar, Truck, Package, Clock, MapPin, Phone, Mail, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface PurchaseOrderProps {
  onNavigate: (module: ModuleName) => void;
}

interface PurchaseOrderItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good';
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  supplier: string;
  supplierContact: string;
  supplierEmail: string;
  brand: string;
  grade: string;
  description: string;
  packingWeight: number;
  packingUnit: string;
  expectedInwardDate: string;
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered' | 'Delayed';
  qualityStatus: 'Pending' | 'Approved' | 'Rejected';
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierContact: string;
  supplierEmail: string;
  supplierAddress: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Partially Received' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  paidAmount: number;
  paymentTerms: string;
  items: PurchaseOrderItem[];
  notes: string;
  approvedBy: string;
  createdBy: string;
}

export function PurchaseOrder({ onNavigate }: PurchaseOrderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterBySupplier, setFilterBySupplier] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Mock purchase orders data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      poNumber: 'PO-2025-001',
      supplier: 'Amul Dairy Co-op',
      supplierContact: '+91 98765 43210',
      supplierEmail: 'orders@amul.coop',
      supplierAddress: 'Anand, Gujarat 388001',
      orderDate: '2025-01-15',
      expectedDeliveryDate: '2025-01-22',
      status: 'Confirmed',
      priority: 'High',
      totalAmount: 45750.00,
      paidAmount: 0,
      paymentTerms: '30 Days',
      approvedBy: 'Amit Singh',
      createdBy: 'Priya Sharma',
      notes: 'Urgent requirement for festival production',
      items: [
        {
          id: '1',
          name: 'Milk Solids',
          type: 'Raw Material',
          category: 'Dairy Product',
          quantity: 500,
          unit: 'kg',
          rate: 225.00,
          totalAmount: 112500.00,
          supplier: 'Amul Dairy Co-op',
          supplierContact: '+91 98765 43210',
          supplierEmail: 'orders@amul.coop',
          brand: 'Amul',
          grade: 'Premium',
          description: 'High-quality milk solids for sweet production',
          packingWeight: 25,
          packingUnit: 'kg/bag',
          expectedInwardDate: '2025-01-22',
          deliveryStatus: 'In Transit',
          qualityStatus: 'Pending'
        },
        {
          id: '2',
          name: 'Milk',
          type: 'Raw Material',
          category: 'Dairy Product',
          quantity: 200,
          unit: 'L',
          rate: 80.00,
          totalAmount: 16000.00,
          supplier: 'Amul Dairy Co-op',
          supplierContact: '+91 98765 43210',
          supplierEmail: 'orders@amul.coop',
          brand: 'Amul',
          grade: 'Full Cream',
          description: 'Fresh full cream milk for production',
          packingWeight: 1,
          packingUnit: 'L/packet',
          expectedInwardDate: '2025-01-22',
          deliveryStatus: 'In Transit',
          qualityStatus: 'Pending'
        }
      ]
    },
    {
      id: '2',
      poNumber: 'PO-2025-002',
      supplier: 'Bajaj Hindusthan Sugar',
      supplierContact: '+91 98765 43211',
      supplierEmail: 'sales@bajajsugar.com',
      supplierAddress: 'Pune, Maharashtra 411001',
      orderDate: '2025-01-16',
      expectedDeliveryDate: '2025-01-25',
      status: 'Sent',
      priority: 'Medium',
      totalAmount: 31250.00,
      paidAmount: 0,
      paymentTerms: '45 Days',
      approvedBy: 'Amit Singh',
      createdBy: 'Rajesh Kumar',
      notes: 'Regular monthly sugar procurement',
      items: [
        {
          id: '3',
          name: 'Sugar',
          type: 'Raw Material',
          category: 'Sweetener',
          quantity: 1000,
          unit: 'kg',
          rate: 31.25,
          totalAmount: 31250.00,
          supplier: 'Bajaj Hindusthan Sugar',
          supplierContact: '+91 98765 43211',
          supplierEmail: 'sales@bajajsugar.com',
          brand: 'Shakti Bhog',
          grade: 'Refined',
          description: 'Premium refined sugar for sweet manufacturing',
          packingWeight: 50,
          packingUnit: 'kg/bag',
          expectedInwardDate: '2025-01-25',
          deliveryStatus: 'Pending',
          qualityStatus: 'Pending'
        }
      ]
    },
    {
      id: '3',
      poNumber: 'PO-2025-003',
      supplier: 'Dalda Foods Ltd',
      supplierContact: '+91 98765 43212',
      supplierEmail: 'orders@dalda.com',
      supplierAddress: 'Mumbai, Maharashtra 400001',
      orderDate: '2025-01-12',
      expectedDeliveryDate: '2025-01-20',
      actualDeliveryDate: '2025-01-19',
      status: 'Completed',
      priority: 'Low',
      totalAmount: 18750.00,
      paidAmount: 18750.00,
      paymentTerms: 'Advance Payment',
      approvedBy: 'Amit Singh',
      createdBy: 'Priya Sharma',
      notes: 'Quality checked and approved',
      items: [
        {
          id: '4',
          name: 'Vanaspati Ghee',
          type: 'Raw Material',
          category: 'Cooking Fat',
          quantity: 100,
          unit: 'kg',
          rate: 187.50,
          totalAmount: 18750.00,
          supplier: 'Dalda Foods Ltd',
          supplierContact: '+91 98765 43212',
          supplierEmail: 'orders@dalda.com',
          brand: 'Dalda',
          grade: 'Commercial',
          description: 'Premium vanaspati ghee for sweet preparation',
          packingWeight: 15,
          packingUnit: 'kg/tin',
          expectedInwardDate: '2025-01-20',
          deliveryStatus: 'Delivered',
          qualityStatus: 'Approved'
        }
      ]
    },
    {
      id: '4',
      poNumber: 'PO-2025-004',
      supplier: 'Traditional Sweets Factory',
      supplierContact: '+91 98765 43213',
      supplierEmail: 'orders@traditionalsweets.com',
      supplierAddress: 'Agra, Uttar Pradesh 282001',
      orderDate: '2025-01-17',
      expectedDeliveryDate: '2025-01-28',
      status: 'Confirmed',
      priority: 'Medium',
      totalAmount: 75000.00,
      paidAmount: 25000.00,
      paymentTerms: '50% Advance, 50% on Delivery',
      approvedBy: 'Sneha Patel',
      createdBy: 'Vikram Gupta',
      notes: 'Bulk order for festival season',
      items: [
        {
          id: '5',
          name: 'Pedha',
          type: 'Finished Good',
          category: 'Traditional Sweet',
          quantity: 200,
          unit: 'pcs',
          rate: 125.00,
          totalAmount: 25000.00,
          supplier: 'Traditional Sweets Factory',
          supplierContact: '+91 98765 43213',
          supplierEmail: 'orders@traditionalsweets.com',
          brand: 'Royal Sweets',
          grade: 'Premium',
          description: 'Premium quality pedha for retail',
          packingWeight: 250,
          packingUnit: 'g/box',
          expectedInwardDate: '2025-01-28',
          deliveryStatus: 'Pending',
          qualityStatus: 'Pending'
        },
        {
          id: '6',
          name: 'Barfi',
          type: 'Finished Good',
          category: 'Traditional Sweet',
          quantity: 150,
          unit: 'pcs',
          rate: 200.00,
          totalAmount: 30000.00,
          supplier: 'Traditional Sweets Factory',
          supplierContact: '+91 98765 43213',
          supplierEmail: 'orders@traditionalsweets.com',
          brand: 'Royal Sweets',
          grade: 'Premium',
          description: 'Premium silver barfi for special occasions',
          packingWeight: 500,
          packingUnit: 'g/box',
          expectedInwardDate: '2025-01-28',
          deliveryStatus: 'Pending',
          qualityStatus: 'Pending'
        },
        {
          id: '7',
          name: 'Kesar Pedha',
          type: 'Finished Good',
          category: 'Premium Sweet',
          quantity: 100,
          unit: 'pcs',
          rate: 200.00,
          totalAmount: 20000.00,
          supplier: 'Traditional Sweets Factory',
          supplierContact: '+91 98765 43213',
          supplierEmail: 'orders@traditionalsweets.com',
          brand: 'Royal Sweets',
          grade: 'Premium Plus',
          description: 'Saffron pedha with premium ingredients',
          packingWeight: 250,
          packingUnit: 'g/box',
          expectedInwardDate: '2025-01-28',
          deliveryStatus: 'Pending',
          qualityStatus: 'Pending'
        }
      ]
    }
  ]);

  const statuses = ['All', 'Draft', 'Sent', 'Confirmed', 'Partially Received', 'Completed', 'Cancelled'];
  const suppliers = ['All', 'Amul Dairy Co-op', 'Bajaj Hindusthan Sugar', 'Dalda Foods Ltd', 'Traditional Sweets Factory'];

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterByStatus === 'All' || order.status === filterByStatus;
    const matchesSupplier = filterBySupplier === 'All' || order.supplier === filterBySupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Partially Received':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Transit':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Delayed':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQualityStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate statistics
  const totalOrders = purchaseOrders.length;
  const confirmedOrders = purchaseOrders.filter(order => order.status === 'Confirmed').length;
  const completedOrders = purchaseOrders.filter(order => order.status === 'Completed').length;
  const pendingOrders = purchaseOrders.filter(order => ['Draft', 'Sent'].includes(order.status)).length;
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

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
          <div className="p-2 rounded-xl bg-indigo-100">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Purchase Order Management</h1>
            <p className="text-slate-600">Manage supplier purchase orders and incoming materials</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalOrders}</div>
            <div className="text-sm text-slate-600">Total Orders</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{pendingOrders}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{confirmedOrders}</div>
            <div className="text-sm text-slate-600">Confirmed</div>
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
            <div className="text-lg font-semibold text-indigo-600">₹{totalValue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by PO number, supplier, or item..."
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
            value={filterBySupplier}
            onChange={(e) => setFilterBySupplier(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 overflow-hidden">
            <div className="p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800">{order.poNumber}</h3>
                    <Badge className={`text-xs rounded-lg ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <Badge className={`text-xs rounded-lg ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-2">{order.supplier}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Order: {order.orderDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Expected: {order.expectedDeliveryDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {order.items.length} items
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-800 mb-1">
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    Paid: ₹{order.paidAmount.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="rounded-lg"
                    >
                      {expandedOrder === order.id ? 'Hide Items' : 'View Items'}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Payment Progress</span>
                  <span>{Math.round((order.paidAmount / order.totalAmount) * 100)}%</span>
                </div>
                <Progress 
                  value={(order.paidAmount / order.totalAmount) * 100} 
                  className="h-2"
                />
              </div>

              {/* Supplier Contact */}
              <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {order.supplierContact}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {order.supplierEmail}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {order.supplierAddress}
                </div>
              </div>

              {/* Expanded Items */}
              {expandedOrder === order.id && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-medium text-slate-800 mb-4">Order Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <Card key={item.id} className="rounded-xl border-slate-200 p-4 bg-slate-50/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-slate-800">{item.name}</h5>
                            <p className="text-sm text-slate-600">{item.category}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs rounded-lg ${
                              item.type === 'Raw Material' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                          >
                            {item.type}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Quantity</span>
                            <span className="font-medium text-slate-800">{item.quantity} {item.unit}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Rate</span>
                            <span className="text-slate-800">₹{item.rate.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total</span>
                            <span className="font-medium text-slate-800">₹{item.totalAmount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Brand</span>
                            <span className="text-slate-800">{item.brand}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Grade</span>
                            <span className="text-slate-800">{item.grade}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-slate-600">Packing</span>
                            <span className="text-slate-800">{item.packingWeight} {item.packingUnit}</span>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-slate-600">Expected Date</span>
                            <span className="font-medium text-slate-800">{item.expectedInwardDate}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Delivery</span>
                            <div className="flex items-center gap-1">
                              {getDeliveryStatusIcon(item.deliveryStatus)}
                              <span className="text-sm text-slate-800">{item.deliveryStatus}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Quality</span>
                            <div className="flex items-center gap-1">
                              {getQualityStatusIcon(item.qualityStatus)}
                              <span className="text-sm text-slate-800">{item.qualityStatus}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-600">{item.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <h5 className="font-medium text-slate-800 mb-2">Notes</h5>
                      <p className="text-sm text-slate-600">{order.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between text-sm text-slate-600">
                    <span>Created by: {order.createdBy}</span>
                    <span>Approved by: {order.approvedBy}</span>
                    <span>Payment Terms: {order.paymentTerms}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No purchase orders found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or create a new purchase order</p>
        </div>
      )}
    </div>
  );
}
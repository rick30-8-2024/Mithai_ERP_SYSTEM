import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, CheckCircle, Search, Filter, MoreVertical, Calendar, User, Phone, Building2, X, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface SalesOrderApprovalProps {
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
  submittedDate: string;
  submittedBy: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Revision Required';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  discount: number;
  taxes: number;
  finalAmount: number;
  items: OrderItem[];
  notes: string;
  salesRep: string;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: string;
  approvalComments?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

export function SalesOrderApproval({ onNavigate }: SalesOrderApprovalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByPriority, setFilterByPriority] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderData | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock sales order data for approval
  const [salesOrders, setSalesOrders] = useState<SalesOrderData[]>([
    {
      id: '1',
      orderNumber: 'SO-2025-007',
      customerCompany: 'Deluxe Sweets Emporium',
      customerName: 'Arjun Mehta',
      customerContact: '+91 98765 43216',
      customerEmail: 'arjun@deluxesweets.com',
      customerAddress: 'Shop 25, Commercial Complex, Mumbai - 400015',
      orderDate: '2025-01-20',
      dueDate: '2025-01-30',
      submittedDate: '2025-01-20',
      submittedBy: 'Kiran Desai',
      status: 'Pending Approval',
      priority: 'High',
      totalAmount: 85000,
      discount: 4250,
      taxes: 10625,
      finalAmount: 91375,
      salesRep: 'Kiran Desai',
      creditLimit: 200000,
      creditUsed: 125000,
      paymentTerms: '30 Days Credit',
      notes: 'Large order for wedding season. Customer has excellent payment history.',
      items: [
        {
          id: '1',
          name: 'Kesar Pedha',
          quantity: 200,
          unit: 'pcs',
          weight: 50,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 40000
        },
        {
          id: '2',
          name: 'Malai Pedha',
          quantity: 150,
          unit: 'pcs',
          weight: 45,
          weightUnit: 'kg',
          unitPrice: 150,
          totalPrice: 22500
        },
        {
          id: '3',
          name: 'Premium Barfi',
          quantity: 100,
          unit: 'pcs',
          weight: 50,
          weightUnit: 'kg',
          unitPrice: 225,
          totalPrice: 22500
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'SO-2025-008',
      customerCompany: 'Festival Foods Ltd',
      customerName: 'Priyanka Shah',
      customerContact: '+91 98765 43217',
      customerEmail: 'priyanka@festivalfoods.com',
      customerAddress: 'Unit 12, Food Court Plaza, Delhi - 110025',
      orderDate: '2025-01-19',
      dueDate: '2025-02-05',
      submittedDate: '2025-01-19',
      submittedBy: 'Rohit Sharma',
      status: 'Pending Approval',
      priority: 'Urgent',
      totalAmount: 125000,
      discount: 6250,
      taxes: 15625,
      finalAmount: 134375,
      salesRep: 'Rohit Sharma',
      creditLimit: 150000,
      creditUsed: 95000,
      paymentTerms: '45 Days Credit',
      notes: 'Urgent order for festival season. Requires immediate approval for production scheduling.',
      items: [
        {
          id: '4',
          name: 'Milk Cake',
          quantity: 300,
          unit: 'pcs',
          weight: 150,
          weightUnit: 'kg',
          unitPrice: 180,
          totalPrice: 54000
        },
        {
          id: '5',
          name: 'Pedha',
          quantity: 250,
          unit: 'pcs',
          weight: 62.5,
          weightUnit: 'kg',
          unitPrice: 125,
          totalPrice: 31250
        },
        {
          id: '6',
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
      id: '3',
      orderNumber: 'SO-2025-009',
      customerCompany: 'Sweet Corner Distributors',
      customerName: 'Vikash Kumar',
      customerContact: '+91 98765 43218',
      customerEmail: 'vikash@sweetcorner.com',
      customerAddress: 'Plot 8, Industrial Area, Pune - 411033',
      orderDate: '2025-01-18',
      dueDate: '2025-01-28',
      submittedDate: '2025-01-18',
      submittedBy: 'Neha Patel',
      status: 'Approved',
      priority: 'Medium',
      totalAmount: 45000,
      discount: 2250,
      taxes: 5625,
      finalAmount: 48375,
      salesRep: 'Neha Patel',
      creditLimit: 100000,
      creditUsed: 35000,
      paymentTerms: '30 Days Credit',
      notes: 'Regular monthly order. Standard terms.',
      approvedBy: 'Amit Singh',
      approvedDate: '2025-01-19',
      approvalComments: 'Order approved. Customer has good credit standing.',
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
      orderNumber: 'SO-2025-010',
      customerCompany: 'New Customer Sweets',
      customerName: 'Rajesh Gupta',
      customerContact: '+91 98765 43219',
      customerEmail: 'rajesh@newcustomer.com',
      customerAddress: 'Shop 5, Market Street, Bangalore - 560012',
      orderDate: '2025-01-17',
      dueDate: '2025-01-27',
      submittedDate: '2025-01-17',
      submittedBy: 'Anita Sharma',
      status: 'Rejected',
      priority: 'Low',
      totalAmount: 75000,
      discount: 3750,
      taxes: 9375,
      finalAmount: 80625,
      salesRep: 'Anita Sharma',
      creditLimit: 50000,
      creditUsed: 0,
      paymentTerms: '15 Days Credit',
      notes: 'First order from new customer. Requesting extended credit terms.',
      rejectedBy: 'Priya Sharma',
      rejectedDate: '2025-01-18',
      rejectionReason: 'Credit limit insufficient for order value. Customer needs to provide bank guarantee or opt for advance payment.',
      items: [
        {
          id: '9',
          name: 'Premium Barfi',
          quantity: 200,
          unit: 'pcs',
          weight: 100,
          weightUnit: 'kg',
          unitPrice: 225,
          totalPrice: 45000
        },
        {
          id: '10',
          name: 'Kesar Pedha',
          quantity: 150,
          unit: 'pcs',
          weight: 37.5,
          weightUnit: 'kg',
          unitPrice: 200,
          totalPrice: 30000
        }
      ]
    },
    {
      id: '5',
      orderNumber: 'SO-2025-011',
      customerCompany: 'Wholesale Sweet Mart',
      customerName: 'Deepika Reddy',
      customerContact: '+91 98765 43220',
      customerEmail: 'deepika@wholesalemart.com',
      customerAddress: 'Warehouse 15, Distribution Hub, Chennai - 600032',
      orderDate: '2025-01-21',
      dueDate: '2025-02-10',
      submittedDate: '2025-01-21',
      submittedBy: 'Sunil Kumar',
      status: 'Pending Approval',
      priority: 'Medium',
      totalAmount: 95000,
      discount: 4750,
      taxes: 11875,
      finalAmount: 102125,
      salesRep: 'Sunil Kumar',
      creditLimit: 250000,
      creditUsed: 150000,
      paymentTerms: '45 Days Credit',
      notes: 'Bulk order for regional distribution. Customer requests special packaging.',
      items: [
        {
          id: '11',
          name: 'Assorted Pedha',
          quantity: 400,
          unit: 'pcs',
          weight: 100,
          weightUnit: 'kg',
          unitPrice: 140,
          totalPrice: 56000
        },
        {
          id: '12',
          name: 'Mixed Barfi',
          quantity: 200,
          unit: 'pcs',
          weight: 100,
          weightUnit: 'kg',
          unitPrice: 195,
          totalPrice: 39000
        }
      ]
    }
  ]);

  const statuses = ['All', 'Pending Approval', 'Approved', 'Rejected', 'Revision Required'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.salesRep.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterByStatus === 'All' || order.status === filterByStatus;
    const matchesPriority = filterByPriority === 'All' || order.priority === filterByPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Revision Required':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const handleApproveReject = (order: SalesOrderData, action: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setActionType(action);
    setComments('');
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedOrder || !actionType) return;

    const updatedOrders = salesOrders.map(order => {
      if (order.id === selectedOrder.id) {
        const currentDate = new Date().toISOString().split('T')[0];
        const updatedOrder = { ...order };
        
        if (actionType === 'approve') {
          updatedOrder.status = 'Approved';
          updatedOrder.approvedBy = 'John Smith'; // Current user
          updatedOrder.approvedDate = currentDate;
          updatedOrder.approvalComments = comments || 'Order approved';
        } else {
          updatedOrder.status = 'Rejected';
          updatedOrder.rejectedBy = 'John Smith'; // Current user
          updatedOrder.rejectedDate = currentDate;
          updatedOrder.rejectionReason = comments;
        }
        
        return updatedOrder;
      }
      return order;
    });

    setSalesOrders(updatedOrders);
    setIsDialogOpen(false);
    setSelectedOrder(null);
    setActionType(null);
    setComments('');
  };

  const getCreditUtilization = (order: SalesOrderData) => {
    return ((order.creditUsed + order.finalAmount) / order.creditLimit) * 100;
  };

  // Calculate statistics
  const totalOrders = salesOrders.length;
  const pendingOrders = salesOrders.filter(order => order.status === 'Pending Approval').length;
  const approvedOrders = salesOrders.filter(order => order.status === 'Approved').length;
  const rejectedOrders = salesOrders.filter(order => order.status === 'Rejected').length;
  const totalValue = salesOrders.filter(order => order.status !== 'Rejected').reduce((sum, order) => sum + order.finalAmount, 0);
  const urgentOrders = salesOrders.filter(order => order.priority === 'Urgent' && order.status === 'Pending Approval').length;

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
          <div className="p-2 rounded-xl bg-emerald-100">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Sales Order Approval</h1>
            <p className="text-slate-600">Review and approve sales orders</p>
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
            <div className="text-2xl font-semibold text-green-600">{approvedOrders}</div>
            <div className="text-sm text-slate-600">Approved</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">{rejectedOrders}</div>
            <div className="text-sm text-slate-600">Rejected</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{urgentOrders}</div>
            <div className="text-sm text-slate-600">Urgent</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-emerald-600">₹{totalValue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by order number, customer, or sales rep..."
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
                <span className="text-sm text-slate-600">Amount</span>
                <span className="text-sm font-medium text-slate-800">
                  ₹{order.finalAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Credit Utilization</span>
                  <span className="text-slate-800">{getCreditUtilization(order).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={getCreditUtilization(order)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Used: ₹{order.creditUsed.toLocaleString()}</span>
                  <span>Limit: ₹{order.creditLimit.toLocaleString()}</span>
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

              {order.status === 'Pending Approval' && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <Button 
                    onClick={() => handleApproveReject(order, 'approve')}
                    className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleApproveReject(order, 'reject')}
                    variant="outline"
                    className="w-full rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {order.status === 'Approved' && order.approvalComments && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3 h-3 text-green-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="text-green-700 font-medium">Approved by {order.approvedBy}</p>
                      <p className="text-slate-600 mt-1">{order.approvalComments}</p>
                      <p className="text-slate-500 mt-1">Date: {order.approvedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === 'Rejected' && order.rejectionReason && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="text-red-700 font-medium">Rejected by {order.rejectedBy}</p>
                      <p className="text-slate-600 mt-1">{order.rejectionReason}</p>
                      <p className="text-slate-500 mt-1">Date: {order.rejectedDate}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Sales Rep: {order.salesRep}</span>
                  <span>Submitted: {order.submittedDate}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No orders found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Sales Order' : 'Reject Sales Order'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Review the order details below and provide approval comments if needed.'
                : 'Please specify the reason for rejecting this sales order.'
              }
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

              {actionType === 'reject' && getCreditUtilization(selectedOrder) > 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Warning: This order would exceed 80% of the customer's credit limit.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {actionType === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add any comments for approval...' 
                      : 'Please specify the reason for rejection...'
                  }
                  className="rounded-xl"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              className={`rounded-lg ${
                actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
              disabled={actionType === 'reject' && !comments.trim()}
            >
              {actionType === 'approve' ? 'Approve Order' : 'Reject Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
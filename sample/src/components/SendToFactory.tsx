import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Factory, Search, Plus, Filter, MoreVertical, MapPin, Truck, Calendar, Package, ArrowRight, CheckCircle, Clock, AlertCircle, Building, Users, Scale } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';

interface SendToFactoryProps {
  onNavigate: (module: ModuleName) => void;
}

interface FactoryLocation {
  id: string;
  name: string;
  location: string;
  manager: string;
  contact: string;
  capacity: string;
  specialization: string[];
  distance: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

interface TransferItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good' | 'Inventory';
  category: string;
  currentStock: number;
  transferQuantity: number;
  unit: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedValue: number;
  requiresRefrigeration: boolean;
  expiryDate?: string;
  brand?: string;
  grade?: string;
}

interface Transfer {
  id: string;
  transferNumber: string;
  fromFactory: string;
  toFactory: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  requestedDate: string;
  scheduledDate: string;
  actualDeliveryDate?: string;
  estimatedDeliveryDate: string;
  transportMode: 'Truck' | 'Rail' | 'Air' | 'Combination';
  driverDetails?: string;
  vehicleNumber?: string;
  trackingNumber?: string;
  totalValue: number;
  items: TransferItem[];
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  completedBy?: string;
}

export function SendToFactory({ onNavigate }: SendToFactoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByFactory, setFilterByFactory] = useState('All');
  const [activeTab, setActiveTab] = useState('transfers');
  const [expandedTransfer, setExpandedTransfer] = useState<string | null>(null);

  // Mock factory locations
  const [factories] = useState<FactoryLocation[]>([
    {
      id: '1',
      name: 'Main Production Unit',
      location: 'Mumbai, Maharashtra',
      manager: 'Rajesh Kumar',
      contact: '+91 98765 43210',
      capacity: '5000 kg/day',
      specialization: ['Milk Products', 'Traditional Sweets'],
      distance: '0 km',
      status: 'Active'
    },
    {
      id: '2',
      name: 'North India Factory',
      location: 'Delhi, NCR',
      manager: 'Priya Sharma',
      contact: '+91 98765 43211',
      capacity: '3000 kg/day',
      specialization: ['Dry Fruits', 'Premium Sweets'],
      distance: '1,400 km',
      status: 'Active'
    },
    {
      id: '3',
      name: 'South Processing Center',
      location: 'Bangalore, Karnataka',
      manager: 'Suresh Reddy',
      contact: '+91 98765 43212',
      capacity: '4000 kg/day',
      specialization: ['Traditional Products', 'Regional Sweets'],
      distance: '840 km',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Western Distribution Hub',
      location: 'Pune, Maharashtra',
      manager: 'Amit Singh',
      contact: '+91 98765 43213',
      capacity: '2500 kg/day',
      specialization: ['Packaging', 'Quality Control'],
      distance: '150 km',
      status: 'Maintenance'
    }
  ]);

  // Mock transfer data
  const [transfers] = useState<Transfer[]>([
    {
      id: '1',
      transferNumber: 'TRF-2025-001',
      fromFactory: 'Main Production Unit',
      toFactory: 'North India Factory',
      status: 'In Transit',
      priority: 'High',
      requestedDate: '2025-01-15',
      scheduledDate: '2025-01-20',
      estimatedDeliveryDate: '2025-01-22',
      transportMode: 'Truck',
      driverDetails: 'Ram Singh - +91 98765 00001',
      vehicleNumber: 'MH-12-AB-1234',
      trackingNumber: 'TRK-001-2025',
      totalValue: 85000,
      requestedBy: 'Production Manager',
      approvedBy: 'Operations Head',
      notes: 'Urgent requirement for festival season production',
      items: [
        {
          id: '1',
          name: 'Milk Solids',
          type: 'Raw Material',
          category: 'Dairy Product',
          currentStock: 1000,
          transferQuantity: 500,
          unit: 'kg',
          priority: 'High',
          estimatedValue: 112500,
          requiresRefrigeration: true,
          expiryDate: '2025-02-15',
          brand: 'Amul',
          grade: 'Premium'
        },
        {
          id: '2',
          name: 'Sugar',
          type: 'Raw Material',
          category: 'Sweetener',
          currentStock: 2000,
          transferQuantity: 300,
          unit: 'kg',
          priority: 'Medium',
          estimatedValue: 9375,
          requiresRefrigeration: false,
          brand: 'Shakti Bhog',
          grade: 'Refined'
        }
      ]
    },
    {
      id: '2',
      transferNumber: 'TRF-2025-002',
      fromFactory: 'Main Production Unit',
      toFactory: 'South Processing Center',
      status: 'Pending Approval',
      priority: 'Medium',
      requestedDate: '2025-01-18',
      scheduledDate: '2025-01-25',
      estimatedDeliveryDate: '2025-01-27',
      transportMode: 'Rail',
      totalValue: 150000,
      requestedBy: 'Inventory Manager',
      notes: 'Regular weekly transfer for southern operations',
      items: [
        {
          id: '3',
          name: 'Pedha',
          type: 'Finished Good',
          category: 'Traditional Sweet',
          currentStock: 500,
          transferQuantity: 200,
          unit: 'pcs',
          priority: 'Medium',
          estimatedValue: 25000,
          requiresRefrigeration: true,
          expiryDate: '2025-01-30'
        },
        {
          id: '4',
          name: 'Barfi Mix',
          type: 'Finished Good',
          category: 'Traditional Sweet',
          currentStock: 300,
          transferQuantity: 150,
          unit: 'pcs',
          priority: 'Low',
          estimatedValue: 37500,
          requiresRefrigeration: true,
          expiryDate: '2025-02-05'
        }
      ]
    },
    {
      id: '3',
      transferNumber: 'TRF-2025-003',
      fromFactory: 'Western Distribution Hub',
      toFactory: 'Main Production Unit',
      status: 'Delivered',
      priority: 'Low',
      requestedDate: '2025-01-10',
      scheduledDate: '2025-01-15',
      estimatedDeliveryDate: '2025-01-16',
      actualDeliveryDate: '2025-01-15',
      transportMode: 'Truck',
      driverDetails: 'Shyam Gupta - +91 98765 00002',
      vehicleNumber: 'MH-14-CD-5678',
      trackingNumber: 'TRK-002-2025',
      totalValue: 45000,
      requestedBy: 'Quality Manager',
      approvedBy: 'Operations Head',
      completedBy: 'Receiving Manager',
      notes: 'Quality tested packaging materials',
      items: [
        {
          id: '5',
          name: 'Packaging Boxes',
          type: 'Inventory',
          category: 'Packaging Material',
          currentStock: 10000,
          transferQuantity: 5000,
          unit: 'pcs',
          priority: 'Low',
          estimatedValue: 25000,
          requiresRefrigeration: false
        },
        {
          id: '6',
          name: 'Labels & Stickers',
          type: 'Inventory',
          category: 'Packaging Material',
          currentStock: 20000,
          transferQuantity: 10000,
          unit: 'pcs',
          priority: 'Low',
          estimatedValue: 15000,
          requiresRefrigeration: false
        }
      ]
    }
  ]);

  const statuses = ['All', 'Draft', 'Pending Approval', 'Approved', 'In Transit', 'Delivered', 'Cancelled'];
  const factoryNames = ['All', ...factories.map(f => f.name)];

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterByStatus === 'All' || transfer.status === filterByStatus;
    const matchesFactory = filterByFactory === 'All' || 
                          transfer.fromFactory === filterByFactory || 
                          transfer.toFactory === filterByFactory;
    
    return matchesSearch && matchesStatus && matchesFactory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Approved':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending Approval':
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

  const getFactoryStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransferStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Transit':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'Pending Approval':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleTransferExpansion = (transferId: string) => {
    setExpandedTransfer(expandedTransfer === transferId ? null : transferId);
  };

  // Calculate statistics
  const totalTransfers = transfers.length;
  const activeTransfers = transfers.filter(t => ['Approved', 'In Transit'].includes(t.status)).length;
  const completedTransfers = transfers.filter(t => t.status === 'Delivered').length;
  const pendingTransfers = transfers.filter(t => ['Draft', 'Pending Approval'].includes(t.status)).length;
  const totalValue = transfers.reduce((sum, transfer) => sum + transfer.totalValue, 0);

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
          <div className="p-2 rounded-xl bg-teal-100">
            <Factory className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Send to Factory</h1>
            <p className="text-slate-600">Transfer materials between factories</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalTransfers}</div>
            <div className="text-sm text-slate-600">Total Transfers</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{pendingTransfers}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{activeTransfers}</div>
            <div className="text-sm text-slate-600">Active</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{completedTransfers}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-teal-600">₹{totalValue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="transfers" className="rounded-lg">Transfer Requests</TabsTrigger>
          <TabsTrigger value="factories" className="rounded-lg">Factory Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by transfer number, factory, or item..."
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
                value={filterByFactory}
                onChange={(e) => setFilterByFactory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
              >
                {factoryNames.map(factory => (
                  <option key={factory} value={factory}>{factory}</option>
                ))}
              </select>
              <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </div>
          </div>

          {/* Transfers List */}
          <div className="space-y-6">
            {filteredTransfers.map((transfer) => (
              <Card key={transfer.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 overflow-hidden">
                <div className="p-6">
                  {/* Transfer Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">{transfer.transferNumber}</h3>
                        <Badge className={`text-xs rounded-lg ${getStatusColor(transfer.status)}`}>
                          {getTransferStatusIcon(transfer.status)}
                          <span className="ml-1">{transfer.status}</span>
                        </Badge>
                        <Badge className={`text-xs rounded-lg ${getPriorityColor(transfer.priority)}`}>
                          {transfer.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-600">{transfer.fromFactory}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{transfer.toFactory}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Requested: {transfer.requestedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Expected: {transfer.estimatedDeliveryDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {transfer.items.length} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800 mb-1">
                        ₹{transfer.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {transfer.transportMode}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTransferExpansion(transfer.id)}
                          className="rounded-lg"
                        >
                          {expandedTransfer === transfer.id ? 'Hide Details' : 'View Details'}
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Transport Details */}
                  {transfer.vehicleNumber && (
                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                      <div>Vehicle: {transfer.vehicleNumber}</div>
                      {transfer.driverDetails && <div>Driver: {transfer.driverDetails}</div>}
                      {transfer.trackingNumber && <div>Tracking: {transfer.trackingNumber}</div>}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedTransfer === transfer.id && (
                    <div className="border-t border-slate-200 pt-6">
                      <h4 className="font-medium text-slate-800 mb-4">Transfer Items</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {transfer.items.map((item) => (
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
                                    : item.type === 'Finished Good'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {item.type}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Transfer Qty</span>
                                <span className="font-medium text-slate-800">{item.transferQuantity} {item.unit}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-slate-600">Available</span>
                                <span className="text-slate-800">{item.currentStock} {item.unit}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-slate-600">Priority</span>
                                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                  {item.priority}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-slate-600">Est. Value</span>
                                <span className="font-medium text-slate-800">₹{item.estimatedValue.toLocaleString()}</span>
                              </div>
                              
                              {item.brand && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Brand</span>
                                  <span className="text-slate-800">{item.brand}</span>
                                </div>
                              )}
                              
                              {item.grade && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Grade</span>
                                  <span className="text-slate-800">{item.grade}</span>
                                </div>
                              )}
                              
                              {item.expiryDate && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Expiry</span>
                                  <span className="text-slate-800">{item.expiryDate}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                {item.requiresRefrigeration && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Cold Chain
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {transfer.notes && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                          <h5 className="font-medium text-slate-800 mb-2">Notes</h5>
                          <p className="text-sm text-slate-600">{transfer.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between text-sm text-slate-600">
                        <span>Requested by: {transfer.requestedBy}</span>
                        {transfer.approvedBy && <span>Approved by: {transfer.approvedBy}</span>}
                        {transfer.completedBy && <span>Completed by: {transfer.completedBy}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredTransfers.length === 0 && (
            <div className="text-center py-12">
              <Factory className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No transfers found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or create a new transfer</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="factories" className="space-y-6">
          {/* Factory Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {factories.map((factory) => (
              <Card key={factory.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-100">
                      <Building className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{factory.name}</h3>
                      <p className="text-sm text-slate-600">{factory.location}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs rounded-lg ${getFactoryStatusColor(factory.status)}`}>
                    {factory.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Manager:</span>
                    <span className="text-slate-800">{factory.manager}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Capacity:</span>
                    <span className="text-slate-800">{factory.capacity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Distance:</span>
                    <span className="text-slate-800">{factory.distance}</span>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-2">Specialization:</p>
                    <div className="flex flex-wrap gap-1">
                      {factory.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Contact: {factory.contact}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
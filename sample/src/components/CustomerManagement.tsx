import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, UserCheck, Search, Plus, Filter, MoreVertical, Building2, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface CustomerManagementProps {
  onNavigate: (module: ModuleName) => void;
}

interface CustomerData {
  id: string;
  customerCode: string;
  companyName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  gstNumber: string;
  customerType: 'Distributor' | 'Retailer' | 'Wholesaler' | 'Corporate';
  status: 'Active' | 'Inactive' | 'Suspended';
  creditLimit: number;
  paymentTerms: string;
  registrationDate: string;
  lastOrderDate?: string;
  totalOrders: number;
  outstandingAmount: number;
  city: string;
  state: string;
  pincode: string;
}

export function CustomerManagement({ onNavigate }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock customer data
  const customers: CustomerData[] = [
    {
      id: '1',
      customerCode: 'CUST-001',
      companyName: 'Sweet Palace Distributors',
      contactPersonName: 'Rajesh Gupta',
      phoneNumber: '+91 98765 43210',
      email: 'rajesh@sweetpalace.com',
      deliveryAddress: 'Shop 15, Gandhi Market, Mumbai - 400001, Maharashtra',
      gstNumber: '27ABCDE1234F1Z5',
      customerType: 'Distributor',
      status: 'Active',
      creditLimit: 500000,
      paymentTerms: '30 Days',
      registrationDate: '2024-03-15',
      lastOrderDate: '2025-01-15',
      totalOrders: 45,
      outstandingAmount: 125000,
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    {
      id: '2',
      customerCode: 'CUST-002',
      companyName: 'Golden Sweets Pvt Ltd',
      contactPersonName: 'Amit Singh',
      phoneNumber: '+91 98765 43211',
      email: 'amit@goldensweets.com',
      deliveryAddress: 'Plot 42, Industrial Area, Pune - 411001, Maharashtra',
      gstNumber: '27FGHIJ5678K2L6',
      customerType: 'Wholesaler',
      status: 'Active',
      creditLimit: 750000,
      paymentTerms: '15 Days',
      registrationDate: '2024-01-20',
      lastOrderDate: '2025-01-16',
      totalOrders: 78,
      outstandingAmount: 0,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    {
      id: '3',
      customerCode: 'CUST-003',
      companyName: 'Metro Retail Chain',
      contactPersonName: 'Sneha Patel',
      phoneNumber: '+91 98765 43212',
      email: 'sneha@metroretail.com',
      deliveryAddress: 'Tower A, Business Park, Bangalore - 560001, Karnataka',
      gstNumber: '29KLMNO9012P3Q7',
      customerType: 'Corporate',
      status: 'Active',
      creditLimit: 1000000,
      paymentTerms: '45 Days',
      registrationDate: '2023-11-08',
      lastOrderDate: '2025-01-18',
      totalOrders: 156,
      outstandingAmount: 85000,
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    {
      id: '4',
      customerCode: 'CUST-004',
      companyName: 'Traditional Foods Co.',
      contactPersonName: 'Manoj Agarwal',
      phoneNumber: '+91 98765 43213',
      email: 'manoj@traditionalfoods.com',
      deliveryAddress: '123 Old City, Delhi - 110001, NCR',
      gstNumber: '07PQRST3456U4V8',
      customerType: 'Retailer',
      status: 'Inactive',
      creditLimit: 200000,
      paymentTerms: '15 Days',
      registrationDate: '2024-06-12',
      lastOrderDate: '2024-12-05',
      totalOrders: 12,
      outstandingAmount: 45000,
      city: 'Delhi',
      state: 'NCR',
      pincode: '110001'
    },
    {
      id: '5',
      customerCode: 'CUST-005',
      companyName: 'Royal Confectionery',
      contactPersonName: 'Deepak Sharma',
      phoneNumber: '+91 98765 43214',
      email: 'deepak@royalconfectionery.com',
      deliveryAddress: 'Shop 8, Sweet Market, Jaipur - 302001, Rajasthan',
      gstNumber: '08UVWXY7890Z5A9',
      customerType: 'Distributor',
      status: 'Active',
      creditLimit: 600000,
      paymentTerms: '30 Days',
      registrationDate: '2024-02-28',
      lastOrderDate: '2025-01-19',
      totalOrders: 67,
      outstandingAmount: 180000,
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    },
    {
      id: '6',
      customerCode: 'CUST-006',
      companyName: 'Fresh Foods Ltd',
      contactPersonName: 'Suresh Reddy',
      phoneNumber: '+91 98765 43215',
      email: 'suresh@freshfoods.com',
      deliveryAddress: 'Warehouse 12, Food Hub, Chennai - 600001, Tamil Nadu',
      gstNumber: '33BCDEF1234G6H0',
      customerType: 'Wholesaler',
      status: 'Suspended',
      creditLimit: 400000,
      paymentTerms: '7 Days',
      registrationDate: '2024-05-15',
      lastOrderDate: '2024-11-20',
      totalOrders: 23,
      outstandingAmount: 220000,
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    },
    {
      id: '7',
      customerCode: 'CUST-007',
      companyName: 'City Sweets Network',
      contactPersonName: 'Arun Mehta',
      phoneNumber: '+91 98765 43221',
      email: 'arun@citysweets.com',
      deliveryAddress: 'Central Mall, Sector 18, Noida - 201301, Uttar Pradesh',
      gstNumber: '09HIJKL5678M7N1',
      customerType: 'Retailer',
      status: 'Active',
      creditLimit: 300000,
      paymentTerms: '30 Days',
      registrationDate: '2024-08-10',
      lastOrderDate: '2025-01-20',
      totalOrders: 34,
      outstandingAmount: 65000,
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301'
    },
    {
      id: '8',
      customerCode: 'CUST-008',
      companyName: 'Festival Foods Ltd',
      contactPersonName: 'Priyanka Shah',
      phoneNumber: '+91 98765 43217',
      email: 'priyanka@festivalfoods.com',
      deliveryAddress: 'Unit 12, Food Court Plaza, Delhi - 110025, NCR',
      gstNumber: '07MNOPQ9012R8S2',
      customerType: 'Corporate',
      status: 'Active',
      creditLimit: 1500000,
      paymentTerms: '60 Days',
      registrationDate: '2023-09-25',
      lastOrderDate: '2025-01-19',
      totalOrders: 189,
      outstandingAmount: 320000,
      city: 'Delhi',
      state: 'NCR',
      pincode: '110025'
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'Distributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Wholesaler':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Retailer':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Corporate':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.status === 'Active').length;
  const inactiveCustomers = customers.filter(customer => customer.status === 'Inactive').length;
  const suspendedCustomers = customers.filter(customer => customer.status === 'Suspended').length;
  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);

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
          <div className="p-2 rounded-xl bg-sky-100">
            <UserCheck className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Customer Management</h1>
            <p className="text-slate-600">Manage customer information and relationships</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalCustomers}</div>
            <div className="text-sm text-slate-600">Total Customers</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{activeCustomers}</div>
            <div className="text-sm text-slate-600">Active</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-600">{inactiveCustomers}</div>
            <div className="text-sm text-slate-600">Inactive</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">{suspendedCustomers}</div>
            <div className="text-sm text-slate-600">Suspended</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-sky-600">₹{totalOutstanding.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Outstanding</div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by company, contact, customer code, email, GST, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{customer.companyName}</h3>
                <p className="text-sm text-slate-600">Code: {customer.customerCode}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Contact Person</span>
                <span className="text-sm font-medium text-slate-800">{customer.contactPersonName}</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{customer.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-start gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 mt-0.5" />
                  <span className="text-xs leading-tight">{customer.city}, {customer.state} - {customer.pincode}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">GST Number</span>
                <span className="text-xs font-mono text-slate-800">{customer.gstNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Customer Type</span>
                <Badge className={`text-xs rounded-lg ${getCustomerTypeColor(customer.customerType)}`}>
                  {customer.customerType}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Credit Limit</span>
                <span className="text-sm font-medium text-slate-800">
                  ₹{customer.creditLimit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Payment Terms</span>
                <span className="text-sm text-slate-600">{customer.paymentTerms}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Orders</span>
                <span className="text-sm font-medium text-slate-800">{customer.totalOrders}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Outstanding</span>
                <span className={`text-sm font-medium ${customer.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{customer.outstandingAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={`text-xs rounded-lg ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Registered: {customer.registrationDate}</span>
                  {customer.lastOrderDate && (
                    <span>Last Order: {customer.lastOrderDate}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No customers found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
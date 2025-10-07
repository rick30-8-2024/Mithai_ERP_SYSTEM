import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Users, Search, Plus, Filter, MoreVertical, Edit, Shield, Mail, Phone, Calendar, UserCheck, UserX, Crown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Select } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface UserManagementProps {
  onNavigate: (module: ModuleName) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: string[];
  joinedDate: string;
  lastLogin: string;
  isActive: boolean;
  avatar?: string;
}

export function UserManagement({ onNavigate }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRole, setFilterByRole] = useState('All');
  const [filterByDepartment, setFilterByDepartment] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Mock users data representing different roles in manufacturing
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@royalsweets.com',
      phone: '+91 9876543210',
      role: 'Admin',
      department: 'IT Administration',
      status: 'Active',
      permissions: ['All Access', 'User Management', 'System Configuration'],
      joinedDate: '2023-01-15',
      lastLogin: '2025-01-19 14:30',
      isActive: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@royalsweets.com',
      phone: '+91 9876543211',
      role: 'Production Manager',
      department: 'Production',
      status: 'Active',
      permissions: ['Work Orders', 'Recipe Management', 'Kitchen Display', 'Quality Check'],
      joinedDate: '2023-03-20',
      lastLogin: '2025-01-19 12:15',
      isActive: true
    },
    {
      id: '3',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@royalsweets.com',
      phone: '+91 9876543212',
      role: 'Kitchen Staff',
      department: 'Production',
      status: 'Active',
      permissions: ['Kitchen Display', 'Work Orders View'],
      joinedDate: '2023-05-10',
      lastLogin: '2025-01-19 11:45',
      isActive: true
    },
    {
      id: '4',
      name: 'Amit Singh',
      email: 'amit.singh@royalsweets.com',
      phone: '+91 9876543213',
      role: 'Inventory Manager',
      department: 'Inventory',
      status: 'Active',
      permissions: ['Inventory Management', 'Raw Materials', 'Finished Goods', 'Purchase Orders'],
      joinedDate: '2023-02-28',
      lastLogin: '2025-01-19 13:20',
      isActive: true
    },
    {
      id: '5',
      name: 'Sneha Patel',
      email: 'sneha.patel@royalsweets.com',
      phone: '+91 9876543214',
      role: 'Sales Manager',
      department: 'Sales',
      status: 'Active',
      permissions: ['Sales Orders', 'Customer Management', 'CRM', 'Sales Reports'],
      joinedDate: '2023-04-12',
      lastLogin: '2025-01-19 10:30',
      isActive: true
    },
    {
      id: '6',
      name: 'Vikram Gupta',
      email: 'vikram.gupta@royalsweets.com',
      phone: '+91 9876543215',
      role: 'Accountant',
      department: 'Finance',
      status: 'Active',
      permissions: ['Accounting', 'Payment Tracking', 'Financial Reports'],
      joinedDate: '2023-06-08',
      lastLogin: '2025-01-18 16:45',
      isActive: true
    },
    {
      id: '7',
      name: 'Anita Reddy',
      email: 'anita.reddy@royalsweets.com',
      phone: '+91 9876543216',
      role: 'Quality Inspector',
      department: 'Quality Assurance',
      status: 'Active',
      permissions: ['Quality Check', 'Finished Goods View', 'Reports'],
      joinedDate: '2023-07-22',
      lastLogin: '2025-01-19 09:15',
      isActive: true
    },
    {
      id: '8',
      name: 'Ravi Mehta',
      email: 'ravi.mehta@royalsweets.com',
      phone: '+91 9876543217',
      role: 'Logistics Coordinator',
      department: 'Logistics',
      status: 'Active',
      permissions: ['Logistics Routes', 'Gate Pass', 'Send to Factory', 'Dispatch'],
      joinedDate: '2023-08-15',
      lastLogin: '2025-01-19 08:30',
      isActive: true
    },
    {
      id: '9',
      name: 'Deepika Joshi',
      email: 'deepika.joshi@royalsweets.com',
      phone: '+91 9876543218',
      role: 'HR Manager',
      department: 'Human Resources',
      status: 'Active',
      permissions: ['User Management', 'Employee Records', 'Reports'],
      joinedDate: '2023-09-05',
      lastLogin: '2025-01-18 17:20',
      isActive: true
    },
    {
      id: '10',
      name: 'Manoj Yadav',
      email: 'manoj.yadav@royalsweets.com',
      phone: '+91 9876543219',
      role: 'Trainee',
      department: 'Production',
      status: 'Pending',
      permissions: ['Kitchen Display View'],
      joinedDate: '2025-01-10',
      lastLogin: 'Never',
      isActive: false
    }
  ]);

  const roles = ['All', 'Admin', 'Production Manager', 'Kitchen Staff', 'Inventory Manager', 'Sales Manager', 'Accountant', 'Quality Inspector', 'Logistics Coordinator', 'HR Manager', 'Trainee'];
  const departments = ['All', 'IT Administration', 'Production', 'Inventory', 'Sales', 'Finance', 'Quality Assurance', 'Logistics', 'Human Resources'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterByRole === 'All' || user.role === filterByRole;
    const matchesDepartment = filterByDepartment === 'All' || user.department === filterByDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4" />;
      case 'Production Manager':
      case 'Sales Manager':
      case 'HR Manager':
        return <Shield className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Production Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sales Manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inventory Manager':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'HR Manager':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Accountant':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Quality Inspector':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Logistics Coordinator':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Kitchen Staff':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Trainee':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive, status: user.isActive ? 'Inactive' : 'Active' }
        : user
    ));
  };

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const pendingUsers = users.filter(user => user.status === 'Pending').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;

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
          <div className="p-2 rounded-xl bg-slate-100">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">User Management</h1>
            <p className="text-slate-600">Manage system users, roles, and permissions</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalUsers}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{activeUsers}</div>
            <div className="text-sm text-slate-600">Active</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-600">{pendingUsers}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">{inactiveUsers}</div>
            <div className="text-sm text-slate-600">Inactive</div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterByRole}
            onChange={(e) => setFilterByRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterByDepartment}
            onChange={(e) => setFilterByDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <Button className="rounded-xl bg-slate-600 hover:bg-slate-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
            {/* User Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-800">{user.name}</h3>
                  <p className="text-sm text-slate-600">{user.department}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Role</span>
                <Badge className={`text-xs rounded-lg ${getRoleColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={`text-xs rounded-lg ${getStatusColor(user.status)}`}>
                  {user.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Joined: {user.joinedDate}</span>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-800">Permissions</span>
                  <span className="text-xs text-slate-500">{user.permissions.length} access</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.slice(0, 3).map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs rounded-lg">
                      {permission}
                    </Badge>
                  ))}
                  {user.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs rounded-lg">
                      +{user.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Account Status</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => toggleUserStatus(user.id)}
                      size="sm"
                    />
                    <span className="text-xs text-slate-500">
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2">
                Last login: {user.lastLogin}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No users found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
}
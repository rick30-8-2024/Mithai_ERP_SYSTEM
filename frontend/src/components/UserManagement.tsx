import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
} from 'lucide-react';
import { userManagementApi, type UserManagement } from '../lib/api';

function UserManagementComponent() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRole, setFilterByRole] = useState('');
  const [filterByDepartment, setFilterByDepartment] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'Trainee',
    department: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    permissions: [] as string[],
  });

  const roles = ['Admin', 'Production Manager', 'Kitchen Staff', 'Inventory Manager', 'Sales Manager', 'Accountant', 'Quality Inspector', 'Logistics Coordinator', 'HR Manager', 'Trainee'];
  const departments = ['IT Administration', 'Production', 'Inventory', 'Sales', 'Finance', 'Quality Assurance', 'Logistics', 'Human Resources'];
  
  // Available permission cards
  const availablePermissions = [
    'Inventory', 'Recipe Management', 'Work Order', 'Kitchen Display',
    'Purchase Order', 'Send to Factory', 'Sales Order', 'Sales Order Approval',
    'User Management', 'Customer Management', 'Accounting', 'Logistics & Routes',
    'Quality Check', 'Payment Tracking', 'CRM'
  ];

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterByRole, filterByDepartment, filterByStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementApi.list({
        query: searchTerm,
        role: filterByRole || null,
        department: filterByDepartment || null,
        status: filterByStatus || null,
      });
      setUsers(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await userManagementApi.create({
        ...formData,
        last_updated_by: localStorage.getItem('ERP_USERNAME') || undefined,
      });
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await userManagementApi.update({
        id: editingUser.id,
        ...formData,
        password: formData.password || undefined,
        last_updated_by: localStorage.getItem('ERP_USERNAME') || undefined,
      });
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userManagementApi.delete(id);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await userManagementApi.toggleStatus(id);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'Trainee',
      department: '',
      status: 'Active',
      permissions: [],
    });
  };

  const openEditModal = (user: UserManagement) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      status: user.status,
      permissions: user.permissions,
    });
    setShowAddModal(true);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Production Manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Sales Manager': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              padding: '8px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--fg)'
            }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} color="var(--fg)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} color="var(--fg)" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>User Management</h1>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                Manage system users, roles, and permissions
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#c00',
            }}
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{users.length}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Total Users</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {users.filter(u => u.status === 'Active').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Active</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {users.filter(u => u.status === 'Pending').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Pending</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
              {users.filter(u => u.status === 'Inactive').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Inactive</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 87%', minWidth: '250px' }}>
            <Search
              size={16}
              color="var(--muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
          <select
            value={filterByRole}
            onChange={(e) => setFilterByRole(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">All Roles</option>
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <select
            value={filterByDepartment}
            onChange={(e) => setFilterByDepartment(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setEditingUser(null);
              setShowAddModal(true);
            }}
            className="btn"
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <Plus size={16} color="var(--bg)" />
            Add User
          </button>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>Loading users...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{user.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{user.department || 'No Department'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn"
                      style={{
                        padding: '6px',
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--fg)'
                      }}
                      title="Edit User"
                    >
                      <Edit size={14} color="var(--fg)" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn"
                      style={{
                        padding: '6px',
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                      }}
                      title="Delete User"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className={getRoleColor(user.role)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {user.role}
                  </span>
                  <span className={getStatusColor(user.status)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {user.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="var(--fg)" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--fg)" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="var(--fg)" />
                    <span>Joined: {new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} color="var(--fg)" />
                      Permissions ({user.permissions.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.permissions.slice(0, 3).map(perm => (
                      <span
                        key={perm}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}
                      >
                        {perm}
                      </span>
                    ))}
                    {user.permissions.length > 3 && (
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        +{user.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(user.id)}
                  className="btn"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: user.isActive ? 'var(--bg)' : 'var(--fg)',
                    color: user.isActive ? 'var(--fg)' : 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => {
              setShowAddModal(false);
              setEditingUser(null);
              resetForm();
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingUser}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                    Permissions (Select which cards user can access)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availablePermissions.map(permission => (
                      <label
                        key={permission}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          background: formData.permissions.includes(permission) ? 'var(--fg)' : 'var(--bg)',
                          color: formData.permissions.includes(permission) ? 'var(--bg)' : 'var(--fg)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          style={{ cursor: 'pointer' }}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'var(--fg)',
                      color: 'var(--bg)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingUser(null);
                      resetForm();
                    }}
                    className="btn"
                    style={{
                      padding: '10px 20px',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementComponent;
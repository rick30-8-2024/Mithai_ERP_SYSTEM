import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  X,
  CreditCard,
} from 'lucide-react';
import { customerManagementApi, type CustomerManagement } from '../lib/api';

function CustomerManagementComponent() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByType, setFilterByType] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerManagement | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    contact_persons: [''] as string[],
    emails: [''] as string[],
    phones: [''] as string[],
    addresses: [{ address: '', city: '', state: '', pincode: '' }] as { address: string; city?: string; state?: string; pincode?: string }[],
    gstin: '',
    customer_type: 'Regular' as 'Regular' | 'Premium' | 'Wholesale' | 'Retail',
    status: 'Active' as 'Active' | 'Inactive' | 'Blocked',
    credit_limit: 0,
    outstanding_balance: 0,
    payment_terms: '',
    notes: '',
  });

  const customerTypes = ['Regular', 'Premium', 'Wholesale', 'Retail'];
  const statuses = ['Active', 'Inactive', 'Blocked'];

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterByType, filterByStatus]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerManagementApi.list({
        query: searchTerm,
        customer_type: filterByType || null,
        status: filterByStatus || null,
      });
      setCustomers(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const payload = {
        company_name: formData.company_name,
        contact_persons: formData.contact_persons.filter(c => c.trim()),
        emails: formData.emails.filter(e => e.trim()),
        phones: formData.phones.filter(p => p.trim()),
        addresses: formData.addresses.filter(a => a.address.trim()),
        gstin: formData.gstin,
        customer_type: formData.customer_type,
        status: formData.status,
        credit_limit: formData.credit_limit,
        outstanding_balance: formData.outstanding_balance,
        payment_terms: formData.payment_terms,
        notes: formData.notes,
        created_by: localStorage.getItem('ERP_USERNAME') || undefined,
        last_updated_by: localStorage.getItem('ERP_USERNAME') || undefined,
      };
      console.log('Frontend: Sending customer data:', JSON.stringify(payload, null, 2));
      await customerManagementApi.create(payload);
      setShowAddModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      console.error('Frontend: Error creating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    try {
      await customerManagementApi.update({
        id: editingCustomer.id,
        ...formData,
        last_updated_by: localStorage.getItem('ERP_USERNAME') || undefined,
      });
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerManagementApi.delete(id);
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_persons: [''],
      emails: [''],
      phones: [''],
      addresses: [{ address: '', city: '', state: '', pincode: '' }],
      gstin: '',
      customer_type: 'Regular',
      status: 'Active',
      credit_limit: 0,
      outstanding_balance: 0,
      payment_terms: '',
      notes: '',
    });
  };

  const openEditModal = (customer: CustomerManagement) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.companyName,
      contact_persons: customer.contactPersons.length > 0 ? customer.contactPersons : [''],
      emails: customer.emails.length > 0 ? customer.emails : [''],
      phones: customer.phones.length > 0 ? customer.phones : [''],
      addresses: customer.addresses.length > 0 ? customer.addresses : [{ address: '', city: '', state: '', pincode: '' }],
      gstin: customer.gstin || '',
      customer_type: customer.customerType,
      status: customer.status,
      credit_limit: customer.creditLimit,
      outstanding_balance: customer.outstandingBalance,
      payment_terms: customer.paymentTerms || '',
      notes: customer.notes || '',
    });
    setShowAddModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Wholesale': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Retail': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
            <UserCheck size={24} color="var(--fg)" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Customer Management</h1>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                Manage customer information and relationships
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
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{customers.length}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Total Customers</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {customers.filter(c => c.status === 'Active').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Active</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
              {customers.filter(c => c.customerType === 'Premium').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Premium</div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
              {customers.filter(c => c.customerType === 'Wholesale').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Wholesale</div>
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '87%',
                padding: '8px 12px 8px 36px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
          <select
            value={filterByType}
            onChange={(e) => setFilterByType(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">All Types</option>
            {customerTypes.map(type => <option key={type} value={type}>{type}</option>)}
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
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <button
            onClick={() => {
              resetForm();
              setEditingCustomer(null);
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
            Add Customer
          </button>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>Loading customers...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {customers.map(customer => (
              <div
                key={customer.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{customer.companyName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                      {customer.contactPersons.length > 0 && customer.contactPersons[0] ? customer.contactPersons[0] : 'No contact'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => openEditModal(customer)}
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
                      title="Edit Customer"
                    >
                      <Edit size={14} color="var(--fg)" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
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
                      title="Delete Customer"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className={getTypeColor(customer.customerType)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {customer.customerType}
                  </span>
                  <span className={getStatusColor(customer.status)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {customer.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '12px' }}>
                  {customer.emails.length > 0 && customer.emails[0] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--fg)" />
                      <span style={{ wordBreak: 'break-all' }}>{customer.emails[0]}</span>
                    </div>
                  )}
                  {customer.phones.length > 0 && customer.phones[0] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--fg)" />
                      <span>{customer.phones[0]}</span>
                    </div>
                  )}
                  {customer.addresses.length > 0 && customer.addresses[0]?.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="var(--fg)" />
                      <span>{customer.addresses[0].city}{customer.addresses[0].state ? `, ${customer.addresses[0].state}` : ''}</span>
                    </div>
                  )}
                  {customer.gstin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={14} color="var(--fg)" />
                      <span>GSTIN: {customer.gstin}</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Credit Limit</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CreditCard size={14} color="var(--fg)" />
                      ₹{customer.creditLimit.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Outstanding</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: customer.outstandingBalance > 0 ? '#ef4444' : '#10b981' }}>
                      ₹{customer.outstandingBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
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
              setEditingCustomer(null);
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
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    style={{
                      width: '94%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>
                      Contact Persons (Max 3)
                    </label>
                    {formData.contact_persons.length < 3 && (
                      <button
                        onClick={() => setFormData({ ...formData, contact_persons: [...formData.contact_persons, ''] })}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--fg)',
                          color: 'var(--bg)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>
                  {formData.contact_persons.map((contact, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => {
                          const newContacts = [...formData.contact_persons];
                          newContacts[idx] = e.target.value;
                          setFormData({ ...formData, contact_persons: newContacts });
                        }}
                        placeholder={`Contact Person ${idx + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      {formData.contact_persons.length > 1 && (
                        <button
                          onClick={() => {
                            const newContacts = formData.contact_persons.filter((_, i) => i !== idx);
                            setFormData({ ...formData, contact_persons: newContacts });
                          }}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={16} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>
                      Emails (Max 3)
                    </label>
                    {formData.emails.length < 3 && (
                      <button
                        onClick={() => setFormData({ ...formData, emails: [...formData.emails, ''] })}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--fg)',
                          color: 'var(--bg)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>
                  {formData.emails.map((email, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...formData.emails];
                          newEmails[idx] = e.target.value;
                          setFormData({ ...formData, emails: newEmails });
                        }}
                        placeholder={`Email ${idx + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      {formData.emails.length > 1 && (
                        <button
                          onClick={() => {
                            const newEmails = formData.emails.filter((_, i) => i !== idx);
                            setFormData({ ...formData, emails: newEmails });
                          }}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={16} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>
                      Phones (Max 3)
                    </label>
                    {formData.phones.length < 3 && (
                      <button
                        onClick={() => setFormData({ ...formData, phones: [...formData.phones, ''] })}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--fg)',
                          color: 'var(--bg)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>
                  {formData.phones.map((phone, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const newPhones = [...formData.phones];
                          newPhones[idx] = e.target.value;
                          setFormData({ ...formData, phones: newPhones });
                        }}
                        placeholder={`Phone ${idx + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      {formData.phones.length > 1 && (
                        <button
                          onClick={() => {
                            const newPhones = formData.phones.filter((_, i) => i !== idx);
                            setFormData({ ...formData, phones: newPhones });
                          }}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={16} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>
                      Addresses (Max 5)
                    </label>
                    {formData.addresses.length < 5 && (
                      <button
                        onClick={() => setFormData({ ...formData, addresses: [...formData.addresses, { address: '', city: '', state: '', pincode: '' }] })}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--fg)',
                          color: 'var(--bg)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>
                  {formData.addresses.map((addr, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Address {idx + 1}</span>
                        {formData.addresses.length > 1 && (
                          <button
                            onClick={() => {
                              const newAddresses = formData.addresses.filter((_, i) => i !== idx);
                              setFormData({ ...formData, addresses: newAddresses });
                            }}
                            style={{
                              padding: '4px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={16} color="#ef4444" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={addr.address}
                        onChange={(e) => {
                          const newAddresses = [...formData.addresses];
                          newAddresses[idx] = { ...newAddresses[idx], address: e.target.value };
                          setFormData({ ...formData, addresses: newAddresses });
                        }}
                        placeholder="Street Address"
                        rows={2}
                        style={{
                          width: '94%',
                          padding: '8px 12px',
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          resize: 'vertical',
                          marginBottom: '8px',
                        }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <input
                          type="text"
                          value={addr.city || ''}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[idx] = { ...newAddresses[idx], city: e.target.value };
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="City"
                          style={{
                            padding: '8px 12px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        />
                        <input
                          type="text"
                          value={addr.state || ''}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[idx] = { ...newAddresses[idx], state: e.target.value };
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="State"
                          style={{
                            padding: '8px 12px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        />
                        <input
                          type="text"
                          value={addr.pincode || ''}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[idx] = { ...newAddresses[idx], pincode: e.target.value };
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="Pincode"
                          style={{
                            padding: '8px 12px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      style={{
                        width: '87%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Customer Type
                    </label>
                    <select
                      value={formData.customer_type}
                      onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as any })}
                      style={{
                        width: '94%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      {customerTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      style={{
                        width: '87%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Credit Limit
                    </label>
                    <input
                      type="number"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '87%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Outstanding Balance
                    </label>
                    <input
                      type="number"
                      value={formData.outstanding_balance}
                      onChange={(e) => setFormData({ ...formData, outstanding_balance: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '82%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="e.g., Net 30 days"
                    style={{
                      width: '94%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    style={{
                      width: '94%',
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
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
                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCustomer(null);
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

export default CustomerManagementComponent;
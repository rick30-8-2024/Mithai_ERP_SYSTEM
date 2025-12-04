import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  Edit,
} from 'lucide-react';
import { salesOrdersApi, type SalesOrder, inventoryApi, type InventoryItem, customerManagementApi } from '../lib/api';

// Modal Component
type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
};

function Modal({ open, title, onClose, children, width = 800 }: ModalProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        overflow: "auto",
      }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: `min(${width}px, calc(100vw - 32px))`,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "var(--shadow)",
          maxHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--fg)",
              padding: 4,
            }}
            aria-label="Close"
          >
            <X width={20} height={20} />
          </button>
        </div>
        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// Form item type
interface FormItem {
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export default function SalesOrderComponent() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerCompany: '',
    customerName: '',
    customerContact: '',
    customerEmail: '',
    customerAddress: '',
    orderDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    salesRep: '',
    discount: 0,
    taxes: 0,
    notes: '',
  });
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [inventorySearchResults, setInventorySearchResults] = useState<{ [key: number]: InventoryItem[] }>({});
  const [searchingInventory, setSearchingInventory] = useState<{ [key: number]: boolean }>({});
  const [showInventoryDropdown, setShowInventoryDropdown] = useState<{ [key: number]: boolean }>({});
  
  const [companySearchResults, setCompanySearchResults] = useState<string[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [customerData, setCustomerData] = useState<{
    contactPersons: string[];
    emails: string[];
    phones: string[];
    addresses: string[];
  }>({
    contactPersons: [],
    emails: [],
    phones: [],
    addresses: [],
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');

  const statuses = ['All', 'Pending', 'Confirmed', 'In Production', 'Ready for Dispatch', 'Packaging', 'Partially Fulfilled', 'Dispatched', 'Delivered', 'Cancelled'];
  const statusesForEdit = ['Pending', 'Confirmed', 'In Production', 'Ready for Dispatch', 'Packaging', 'Partially Fulfilled', 'Dispatched', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['All', 'Pending', 'Partial', 'Paid', 'Overdue'];
  const paymentStatusesForEdit = ['Pending', 'Partial', 'Paid', 'Overdue'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];
  const prioritiesForEdit = ['Low', 'Medium', 'High', 'Urgent'];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ensure page is scrollable
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPayment, filterPriority]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await salesOrdersApi.list({
        query: searchTerm,
        status: filterStatus === 'All' ? null : filterStatus,
        payment_status: filterPayment === 'All' ? null : filterPayment,
        priority: filterPriority === 'All' ? null : filterPriority,
      });
      setOrders(response.items);
    } catch (error) {
      console.error('Failed to load sales orders:', error);
      alert('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadOrders();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales order?')) return;
    
    try {
      await salesOrdersApi.delete(id);
      alert('Sales order deleted successfully');
      loadOrders();
    } catch (error) {
      console.error('Failed to delete sales order:', error);
      alert('Failed to delete sales order');
    }
  };

  const openEditModal = (order: SalesOrder) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditPriority(order.priority);
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      setSubmitting(true);
      await salesOrdersApi.update({
        id: editingOrder.id,
        status: editStatus as any,
        payment_status: editPaymentStatus as any,
        priority: editPriority as any,
        last_updated_by: localStorage.getItem('ERP_USERNAME') || 'Admin',
      });
      alert('Order updated successfully');
      setShowEditModal(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#d4edda', fg: '#155724', border: '#c3e6cb' };
      case 'Ready for Dispatch':
      case 'Dispatched':
        return { bg: '#d1ecf1', fg: '#0c5460', border: '#bee5eb' };
      case 'In Production':
        return { bg: '#e7e3ff', fg: '#5a2d82', border: '#d6cdff' };
      case 'Confirmed':
        return { bg: '#cce5ff', fg: '#004085', border: '#b8daff' };
      case 'Pending':
        return { bg: '#fff3cd', fg: '#856404', border: '#ffeaa7' };
      case 'Cancelled':
        return { bg: '#f8d7da', fg: '#721c24', border: '#f5c6cb' };
      default:
        return { bg: '#e9ecef', fg: '#495057', border: '#dee2e6' };
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      customerCompany: '',
      customerName: '',
      customerContact: '',
      customerEmail: '',
      customerAddress: '',
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      priority: 'Medium',
      salesRep: '',
      discount: 0,
      taxes: 0,
      notes: '',
    });
    setFormItems([]);
    setCustomerData({
      contactPersons: [],
      emails: [],
      phones: [],
      addresses: [],
    });
    setCompanySearchResults([]);
  };

  const searchCompanies = async (query: string) => {
    if (!query || query.length < 2) {
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      return;
    }

    try {
      const response = await customerManagementApi.searchCompanies(query, 10);
      setCompanySearchResults(response.companies);
      setShowCompanyDropdown(true);
    } catch (error) {
      console.error('Failed to search companies:', error);
    }
  };

  const selectCompany = async (companyName: string) => {
    setFormData({ ...formData, customerCompany: companyName });
    setShowCompanyDropdown(false);
    setCompanySearchResults([]);

    try {
      const response = await customerManagementApi.getByCompany(companyName);
      setCustomerData({
        contactPersons: response.contact_persons,
        emails: response.emails,
        phones: response.phones,
        addresses: response.addresses,
      });

      if (response.contact_persons.length === 1) {
        setFormData(prev => ({ ...prev, customerName: response.contact_persons[0] }));
      }
      if (response.emails.length === 1) {
        setFormData(prev => ({ ...prev, customerEmail: response.emails[0] }));
      }
      if (response.phones.length === 1) {
        setFormData(prev => ({ ...prev, customerContact: response.phones[0] }));
      }
      if (response.addresses.length === 1) {
        setFormData(prev => ({ ...prev, customerAddress: response.addresses[0] }));
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    }
  };

  const addItem = () => {
    setFormItems([
      ...formItems,
      {
        name: '',
        quantity: 0,
        unit: 'kg',
        unit_price: 0,
        total_price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const searchInventory = async (query: string, index: number) => {
    if (!query || query.length < 2) {
      setInventorySearchResults({ ...inventorySearchResults, [index]: [] });
      setShowInventoryDropdown({ ...showInventoryDropdown, [index]: false });
      return;
    }

    try {
      setSearchingInventory({ ...searchingInventory, [index]: true });
      const response = await inventoryApi.list({
        query,
        limit: 10,
      });
      setInventorySearchResults({ ...inventorySearchResults, [index]: response.items });
      setShowInventoryDropdown({ ...showInventoryDropdown, [index]: true });
    } catch (error) {
      console.error('Failed to search inventory:', error);
    } finally {
      setSearchingInventory({ ...searchingInventory, [index]: false });
    }
  };

  const selectInventoryItem = (index: number, item: InventoryItem) => {
    console.log('Selecting inventory item:', {
      index,
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      cost_per_unit: item.cost_per_unit,
      currentItem: formItems[index]
    });

    const updatedItems = [...formItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      unit_price: item.cost_per_unit,
    };

    if (updatedItems[index].quantity > 0) {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    console.log('Updated item:', updatedItems[index]);
    
    setFormItems(updatedItems);
    setShowInventoryDropdown({ ...showInventoryDropdown, [index]: false });
    setInventorySearchResults({ ...inventorySearchResults, [index]: [] });
  };

  const updateItem = (index: number, field: keyof FormItem, value: any) => {
    const updatedItems = [...formItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setFormItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    const itemsTotal = formItems.reduce((sum, item) => sum + item.total_price, 0);
    return itemsTotal - formData.discount + formData.taxes;
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      setSubmitting(true);
      const username = localStorage.getItem('ERP_USERNAME') || 'Admin';
      const totalAmount = formItems.reduce((sum, item) => sum + item.total_price, 0);
      const finalAmount = totalAmount - formData.discount + formData.taxes;

      await salesOrdersApi.create({
        order_number: formData.orderNumber,
        customer_company: formData.customerCompany,
        customer_name: formData.customerName,
        customer_contact: formData.customerContact,
        customer_email: formData.customerEmail,
        customer_address: formData.customerAddress,
        order_date: formData.orderDate,
        due_date: formData.dueDate,
        status: 'Pending',
        priority: formData.priority,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_status: 'Pending',
        notes: formData.notes,
        sales_rep: formData.salesRep,
        discount: formData.discount,
        taxes: formData.taxes,
        final_amount: finalAmount,
        created_by: username,
        last_updated_by: username,
        items: formItems.map(item => ({
          ...item,
          weight: 0,
          weight_unit: 'kg',
        })),
      });

      alert('Sales order created successfully');
      setShowCreateModal(false);
      resetForm();
      loadOrders();
    } catch (error) {
      console.error('Failed to create sales order:', error);
      alert('Failed to create sales order: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#f8d7da', fg: '#721c24', border: '#f5c6cb' };
      case 'High':
        return { bg: '#ffe5d0', fg: '#8b4513', border: '#ffd6b3' };
      case 'Medium':
        return { bg: '#fff3cd', fg: '#856404', border: '#ffeaa7' };
      case 'Low':
        return { bg: '#d4edda', fg: '#155724', border: '#c3e6cb' };
      default:
        return { bg: '#e9ecef', fg: '#495057', border: '#dee2e6' };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return { bg: '#d4edda', fg: '#155724', border: '#c3e6cb' };
      case 'Partial':
        return { bg: '#fff3cd', fg: '#856404', border: '#ffeaa7' };
      case 'Pending':
        return { bg: '#d1ecf1', fg: '#0c5460', border: '#bee5eb' };
      case 'Overdue':
        return { bg: '#f8d7da', fg: '#721c24', border: '#f5c6cb' };
      default:
        return { bg: '#e9ecef', fg: '#495057', border: '#dee2e6' };
    }
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['Pending', 'Confirmed'].includes(o.status)).length;
  const inProductionOrders = orders.filter(o => o.status === 'In Production').length;
  const completedOrders = orders.filter(o => ['Delivered', 'Dispatched'].includes(o.status)).length;
  const totalValue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const overdueOrders = orders.filter(o => o.paymentStatus === 'Overdue').length;

  return (
    <div className="page" style={{ minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn"
          style={{
            background: 'var(--panel)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--fg)',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <ArrowLeft width={20} height={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt width={24} height={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Sales Order Management</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Manage customer sales orders and deliveries
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800 }}>{totalOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total Orders</div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: '#856404' }}>{pendingOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pending</div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: '#5a2d82' }}>{inProductionOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>In Production</div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: '#155724' }}>{completedOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Completed</div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: '#721c24' }}>{overdueOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Overdue</div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800 }}>₹{totalValue.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total Value</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              width={16}
              height={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '87%',
                padding: '10px 12px 10px 36px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{
              padding: '10px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {paymentStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Payments' : s}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '10px 12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {priorities.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn"
            style={{
              padding: '10px 16px',
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Plus width={16} height={16} />
            New Order
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Receipt width={48} height={48} style={{ margin: '0 auto 16px', color: 'var(--muted)' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--muted)' }}>No sales orders found</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            Try adjusting your filters or create a new order
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const statusColor = getStatusColor(order.status);
            const priorityColor = getPriorityColor(order.priority);
            const paymentColor = getPaymentStatusColor(order.paymentStatus);
            const paymentProgress = (order.paidAmount / order.finalAmount) * 100;

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 16,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
                      {order.customerCompany}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                      <User width={14} height={14} />
                      {order.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      {order.orderNumber}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEditModal(order)}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        background: '#e3f2fd',
                        border: '1px solid #1976d2',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title="Edit Order Status"
                    >
                      <Edit width={14} height={14} color="currentColor" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="btn"
                      style={{
                        padding: 8,
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: '#721c24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete Order"
                    >
                      <Trash2 width={16} height={16} color="currentColor" />
                    </button>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="btn"
                      style={{
                        padding: 8,
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: 'var(--fg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp width={16} height={16} color="currentColor" /> : <ChevronDown width={16} height={16} color="currentColor" />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Status</div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: statusColor.bg,
                        color: statusColor.fg,
                        border: `1px solid ${statusColor.border}`,
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {order.status}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Priority</div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: priorityColor.bg,
                        color: priorityColor.fg,
                        border: `1px solid ${priorityColor.border}`,
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {order.priority}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Payment Status</div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: paymentColor.bg,
                        color: paymentColor.fg,
                        border: `1px solid ${paymentColor.border}`,
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {order.paymentStatus}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Order Date</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{order.orderDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Due Date</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{order.dueDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Final Amount</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>₹{order.finalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Payment Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                        <span>Payment Progress</span>
                        <span>{Math.round(paymentProgress)}%</span>
                      </div>
                      <div style={{ height: 8, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${paymentProgress}%`,
                            height: '100%',
                            background: paymentColor.fg,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        <span>Paid: ₹{order.paidAmount.toLocaleString()}</span>
                        <span>Balance: ₹{(order.finalAmount - order.paidAmount).toLocaleString()}</span>
                      </div>
                    </div>
                    {order.paymentStatus !== 'Paid' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Mark this payment as complete?')) return;
                          try {
                            await salesOrdersApi.update({
                              id: order.id,
                              paid_amount: order.finalAmount,
                              payment_status: 'Paid',
                              last_updated_by: localStorage.getItem('ERP_USERNAME') || 'Admin',
                            });
                            alert('Payment marked as complete');
                            loadOrders();
                          } catch (error) {
                            console.error('Failed to update payment:', error);
                            alert('Failed to update payment status');
                          }
                        }}
                        style={{
                          marginLeft: 12,
                          padding: '8px 12px',
                          background: '#155724',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Items ({order.items.length})</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: 8,
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            <span>
                              {item.quantity} {item.unit} ({item.weight} {item.weightUnit})
                            </span>
                            <span>₹{item.totalPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
                      {order.customerContact && (
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 4 }}>
                            <Phone width={12} height={12} style={{ display: 'inline', marginRight: 4 }} />
                            Contact
                          </div>
                          <div>{order.customerContact}</div>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 4 }}>
                            <Mail width={12} height={12} style={{ display: 'inline', marginRight: 4 }} />
                            Email
                          </div>
                          <div>{order.customerEmail}</div>
                        </div>
                      )}
                      {order.customerAddress && (
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 4 }}>
                            <Building2 width={12} height={12} style={{ display: 'inline', marginRight: 4 }} />
                            Address
                          </div>
                          <div>{order.customerAddress}</div>
                        </div>
                      )}
                      {order.salesRep && (
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 4 }}>Sales Rep</div>
                          <div>{order.salesRep}</div>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: 12, padding: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Notes</div>
                        <div style={{ fontSize: 12 }}>{order.notes}</div>
                      </div>
                    )}

                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12 }}>
                      <div>
                        <div style={{ color: 'var(--muted)' }}>Total Amount</div>
                        <div style={{ fontWeight: 600 }}>₹{order.totalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--muted)' }}>Discount</div>
                        <div style={{ fontWeight: 600 }}>₹{order.discount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--muted)' }}>Taxes</div>
                        <div style={{ fontWeight: 600 }}>₹{order.taxes.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal open={showCreateModal} title="Create Sales Order" onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }} width={1200}>
          <form onSubmit={handleCreateOrder}>
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Customer Information */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Customer Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Order Number *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="SO-2025-001"
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Company Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.customerCompany}
                      onChange={(e) => {
                        setFormData({ ...formData, customerCompany: e.target.value });
                        searchCompanies(e.target.value);
                      }}
                      onFocus={() => {
                        if (formData.customerCompany.length >= 2) {
                          searchCompanies(formData.customerCompany);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowCompanyDropdown(false);
                        }, 200);
                      }}
                      placeholder="Start typing company name..."
                      style={{
                        width: '90%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                    {showCompanyDropdown && companySearchResults.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: '10%',
                          zIndex: 1000,
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          marginTop: 4,
                          maxHeight: 200,
                          overflowY: 'auto',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {companySearchResults.map((company, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectCompany(company)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border)',
                              fontSize: 13,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {company}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Contact Person *
                    </label>
                    {customerData.contactPersons.length > 0 ? (
                      <select
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select contact person</option>
                        {customerData.contactPersons.map((person, idx) => (
                          <option key={idx} value={person}>{person}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="John Doe"
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Contact Number
                    </label>
                    {customerData.phones.length > 0 ? (
                      <select
                        value={formData.customerContact}
                        onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select contact number</option>
                        {customerData.phones.map((phone, idx) => (
                          <option key={idx} value={phone}>{phone}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="tel"
                        value={formData.customerContact}
                        onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Email
                    </label>
                    {customerData.emails.length > 0 ? (
                      <select
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select email</option>
                        {customerData.emails.map((email, idx) => (
                          <option key={idx} value={email}>{email}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="contact@company.com"
                        style={{
                          width: '90%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Address
                    </label>
                    {customerData.addresses.length > 0 ? (
                      <select
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        style={{
                          width: '95%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select address</option>
                        {customerData.addresses.map((address, idx) => (
                          <option key={idx} value={address}>{address}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder="123 Main Street, City - 400001"
                        style={{
                          width: '95%',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Order Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Order Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Due Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Sales Representative
                    </label>
                    <input
                      type="text"
                      value={formData.salesRep}
                      onChange={(e) => setFormData({ ...formData, salesRep: e.target.value })}
                      placeholder="Sales Rep Name"
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Order Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--fg)',
                      color: 'var(--bg)',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Plus width={14} height={14} />
                    Add Item
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 16 }}>
                  {formItems.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 16,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: 12, alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            required
                            type="text"
                            placeholder="Search item name"
                            value={item.name}
                            onChange={(e) => {
                              updateItem(index, 'name', e.target.value);
                              searchInventory(e.target.value, index);
                            }}
                            onFocus={() => {
                              if (item.name.length >= 2) {
                                searchInventory(item.name, index);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowInventoryDropdown({ ...showInventoryDropdown, [index]: false });
                              }, 200);
                            }}
                            style={{
                              width: '90%',
                              padding: '6px 10px',
                              background: 'var(--panel)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              fontSize: 13,
                            }}
                          />
                          {showInventoryDropdown[index] && inventorySearchResults[index]?.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: 'var(--panel)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                marginTop: 4,
                                maxHeight: 200,
                                overflowY: 'auto',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              }}
                            >
                              {inventorySearchResults[index].map((invItem) => (
                                <div
                                  key={invItem.id}
                                  onClick={() => selectInventoryItem(index, invItem)}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border)',
                                    fontSize: 13,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  <div style={{ fontWeight: 600 }}>{invItem.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                                    {invItem.sku} | Stock: {invItem.current_stock} {invItem.unit} | ₹{invItem.cost_per_unit}/{invItem.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          required
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '90%',
                            padding: '6px 10px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        />
                        <input
                          required
                          type="text"
                          placeholder="Unit (kg/pcs)"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          style={{
                            width: '90%',
                            padding: '6px 10px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        />
                        <input
                          required
                          type="number"
                          placeholder="Unit price"
                          value={item.unit_price || ''}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '90%',
                            padding: '6px 10px',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>
                            ₹{item.total_price.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{
                              padding: 6,
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              cursor: 'pointer',
                              color: '#721c24',
                            }}
                          >
                            <Trash2 width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>
                      No items added. Click "Add Item" to add products to this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Financial Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.discount || ''}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Taxes (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.taxes || ''}
                      onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      style={{
                        width: '80%',
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Total Amount
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 700,
                    }}>
                      ₹{calculateTotalAmount().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes or instructions..."
                  rows={3}
                  style={{
                    width: '80%',
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formItems.length === 0}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--fg)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: (submitting || formItems.length === 0) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || formItems.length === 0) ? 0.5 : 1,
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {showEditModal && editingOrder && (
        <Modal open={showEditModal} title="Edit Sales Order" onClose={() => {
          setShowEditModal(false);
          setEditingOrder(null);
        }} width={600}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{
              padding: 16,
              background: 'var(--bg)',
              borderRadius: 10,
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{editingOrder.customerCompany}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{editingOrder.orderNumber}</div>
                </div>
                <div style={{ fontWeight: 600, color: '#00695c' }}>
                  ₹{editingOrder.finalAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Customer: </span>
                  <span style={{ fontWeight: 600 }}>{editingOrder.customerName}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Items: </span>
                  <span style={{ fontWeight: 600 }}>{editingOrder.items.length}</span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Order Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--panel)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {statusesForEdit.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div style={{ marginTop: 8, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 12 }}>
                <strong>Note:</strong> Change status to "Ready for Dispatch" or "Packaging" to make this order visible in Sales Order Dispatch module.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Payment Status
              </label>
              <select
                value={editPaymentStatus}
                onChange={(e) => setEditPaymentStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--panel)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {paymentStatusesForEdit.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--panel)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {prioritiesForEdit.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              paddingTop: 16,
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                }}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#00695c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Edit width={16} height={16} />
                {submitting ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  Calendar,
  Truck,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { purchaseOrdersApi, type PurchaseOrder } from '../lib/api';

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
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fg)",
            }}
          >
            <X width={20} height={20} />
          </button>
        </div>
        <div style={{ padding: 16, overflowY: "auto", flexGrow: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number | string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "var(--fg)" : "var(--panel)",
        backgroundImage: active
          ? undefined
          : "radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
        border: active ? "1.5px solid var(--fg)" : "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        boxShadow: active ? "var(--shadow)" : undefined,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: active ? "var(--bg)" : color,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: active ? "var(--bg)" : "var(--muted)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Completed':
      return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    case 'Confirmed':
      return { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' };
    case 'Partially Received':
      return { background: '#e9d5ff', color: '#6b21a8', border: '1px solid #c084fc' };
    case 'Sent':
      return { background: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' };
    case 'Draft':
      return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    case 'Cancelled':
      return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    default:
      return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    case 'High':
      return { background: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' };
    case 'Medium':
      return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
    case 'Low':
      return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    default:
      return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
  }
};

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterBySupplier, setFilterBySupplier] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    poNumber: '',
    supplier: '',
    supplierContact: '',
    supplierEmail: '',
    supplierAddress: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'Draft',
    priority: 'Medium',
    paymentTerms: '',
    notes: '',
  });
  const [formItems, setFormItems] = useState<Array<{
    name: string;
    type: string;
    category: string;
    quantity: number;
    unit: string;
    rate: number;
  }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Fetch purchase orders from API
  async function fetchPurchaseOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await purchaseOrdersApi.list({
        query: searchTerm,
        status: filterByStatus === 'All' ? null : filterByStatus,
        supplier: filterBySupplier === 'All' ? null : filterBySupplier,
        limit: 100,
        offset: 0,
      });
      setPurchaseOrders(res.items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPurchaseOrders();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterByStatus, filterBySupplier]);


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
    <div className="page" style={{ overflow: 'auto' }}>
      <style>{`
        [data-theme="dark"] select option {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        
        [data-theme="light"] select option {
          background-color: #ffffff;
          color: #000000;
        }
      `}</style>
      <main
        style={{
          minHeight: '100vh',
          padding: '24px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--fg)',
              }}
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft width={20} height={20} />
            </button>
            <div>
              <h1 className="title" style={{ margin: 0, textAlign: 'left', fontSize: 20 }}>
                Purchase Order Management
              </h1>
              <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 10 }}>
                Manage supplier purchase orders and incoming materials
              </div>
            </div>
          </div>

          <label className="switch" aria-label="Toggle light and dark mode" style={{ marginLeft: 16 }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              aria-checked={theme === 'dark'}
            />
            <span className="slider">
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  opacity: theme === 'dark' ? 1 : 0,
                  transition: 'opacity .25s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  opacity: theme === 'light' ? 1 : 0,
                  transition: 'opacity .25s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="4" />
                  <path
                    d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            </span>
          </label>
        </section>

        {/* Statistics Cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 18,
          }}
        >
          <StatCard label="Total Orders" value={totalOrders} color="#64748b" />
          <StatCard label="Pending" value={pendingOrders} color="#f97316" />
          <StatCard label="Confirmed" value={confirmedOrders} color="#3b82f6" />
          <StatCard label="Completed" value={completedOrders} color="#22c55e" />
          <StatCard label="Total Value" value={`₹${totalValue.toLocaleString()}`} color="#8b5cf6" />
        </section>

        {/* Search and Filters */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 18,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 300px', minWidth: '200px', position: 'relative' }}>
            <Search
              width={16}
              height={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PO number, supplier, or item..."
              aria-label="Search purchase orders"
              style={{
                width: '93%',
                background: 'transparent',
                color: 'var(--fg)',
                border: '1.5px solid var(--border)',
                padding: '10px 12px 10px 36px',
                borderRadius: 10,
                fontWeight: 500,
                outline: 'none',
              }}
            />
          </div>
          <select
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value)}
            aria-label="Filter by status"
            style={{
              flex: '0 0 auto',
              minWidth: '140px',
              background: 'transparent',
              color: 'var(--fg)',
              border: '1.5px solid var(--border)',
              padding: '10px 12px',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filterBySupplier}
            onChange={(e) => setFilterBySupplier(e.target.value)}
            aria-label="Filter by supplier"
            style={{
              flex: '0 0 auto',
              minWidth: '180px',
              background: 'transparent',
              color: 'var(--fg)',
              border: '1.5px solid var(--border)',
              padding: '10px 12px',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus width={16} height={16} />
            Create PO
          </button>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: 'var(--muted)', marginBottom: 12 }}>Loading purchase orders...</div>
        )}
        {error && (
          <div
            role="alert"
            style={{
              color: 'var(--bg)',
              background: 'var(--fg)',
              border: '1.5px solid var(--fg)',
              padding: '10px 12px',
              borderRadius: 10,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Purchase Orders List */}
        <div style={{ display: 'grid', gap: 18, paddingBottom: 24 }}>
          {!loading && filteredOrders.length === 0 ? (
            <div
              style={{
                color: 'var(--muted)',
                border: '1px dashed var(--border)',
                borderRadius: 12,
                padding: 18,
                textAlign: 'center',
              }}
            >
              No purchase orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const paymentProgress = (order.paidAmount / order.totalAmount) * 100;

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--panel)',
                    backgroundImage:
                      'radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow)',
                    padding: 18,
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3 style={{ fontWeight: 900, fontSize: 16, margin: 0 }}>
                          {order.poNumber}
                        </h3>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            ...getStatusStyles(order.status),
                          }}
                        >
                          {order.status}
                        </span>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            ...getPriorityStyles(order.priority),
                          }}
                        >
                          {order.priority}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: 'var(--fg)',
                          marginBottom: 4,
                        }}
                      >
                        <ShoppingCart width={16} height={16} style={{ color: 'var(--muted)' }} />
                        <span style={{ fontWeight: 600 }}>{order.supplier}</span>
                        <span style={{ color: 'var(--muted)' }}>•</span>
                        <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                          {order.items.length} items
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Paid: ₹{order.paidAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <InfoBox
                      label="Order Date"
                      value={order.orderDate}
                      icon={<Calendar width={14} height={14} />}
                    />
                    <InfoBox
                      label="Expected Delivery"
                      value={order.expectedDeliveryDate || '-'}
                      icon={<Truck width={14} height={14} />}
                    />
                    <InfoBox
                      label="Payment Terms"
                      value={order.paymentTerms || '-'}
                      icon={<Clock width={14} height={14} />}
                    />
                    <InfoBox label="Created By" value={order.createdBy || '-'} />
                  </div>

                  {/* Payment Progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                        Payment Progress
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>
                        {paymentProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        background: 'var(--bg)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${paymentProgress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Supplier Contact */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      fontSize: 12,
                      color: 'var(--muted)',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone width={14} height={14} />
                      {order.supplierContact}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail width={14} height={14} />
                      {order.supplierEmail}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin width={14} height={14} />
                      {order.supplierAddress}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    style={{
                      background: 'transparent',
                      color: 'var(--fg)',
                      border: '1.5px solid var(--border)',
                      padding: '8px 16px',
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp width={16} height={16} />
                        Hide Items
                      </>
                    ) : (
                      <>
                        <ChevronDown width={16} height={16} />
                        View Items
                      </>
                    )}
                  </button>

                  {/* Expanded Items */}
                  {isExpanded && (
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                      <h4 style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Order Items</h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: 12,
                        }}
                      >
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: 12,
                              padding: 14,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: 10,
                              }}
                            >
                              <div>
                                <h5 style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>
                                  {item.name}
                                </h5>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                                  {item.category}
                                </p>
                              </div>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 999,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background:
                                    item.type === 'Raw Material' ? '#dcfce7' : '#fed7aa',
                                  color: item.type === 'Raw Material' ? '#166534' : '#9a3412',
                                  border: `1px solid ${
                                    item.type === 'Raw Material' ? '#86efac' : '#fdba74'
                                  }`,
                                }}
                              >
                                {item.type}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Quantity</span>
                                <span style={{ fontWeight: 700 }}>
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Rate</span>
                                <span>₹{item.rate.toFixed(2)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Total</span>
                                <span style={{ fontWeight: 700 }}>
                                  ₹{item.totalAmount.toLocaleString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Brand</span>
                                <span>{item.brand}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Grade</span>
                                <span>{item.grade}</span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  paddingTop: 6,
                                  borderTop: '1px solid var(--border)',
                                }}
                              >
                                <span style={{ color: 'var(--muted)' }}>Expected</span>
                                <span style={{ fontWeight: 700 }}>{item.expectedInwardDate}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Delivery</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {item.deliveryStatus === 'Delivered' ? (
                                    <CheckCircle width={14} height={14} color="#22c55e" />
                                  ) : item.deliveryStatus === 'In Transit' ? (
                                    <Truck width={14} height={14} color="#3b82f6" />
                                  ) : item.deliveryStatus === 'Delayed' ? (
                                    <AlertCircle width={14} height={14} color="#f97316" />
                                  ) : (
                                    <Clock width={14} height={14} color="#64748b" />
                                  )}
                                  <span style={{ fontSize: 12 }}>{item.deliveryStatus}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)' }}>Quality</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {item.qualityStatus === 'Approved' ? (
                                    <CheckCircle width={14} height={14} color="#22c55e" />
                                  ) : item.qualityStatus === 'Rejected' ? (
                                    <XCircle width={14} height={14} color="#ef4444" />
                                  ) : (
                                    <Clock width={14} height={14} color="#64748b" />
                                  )}
                                  <span style={{ fontSize: 12 }}>{item.qualityStatus}</span>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: 10,
                                paddingTop: 10,
                                borderTop: '1px solid var(--border)',
                              }}
                            >
                              <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 12,
                            background: 'var(--bg)',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                          }}
                        >
                          <h5 style={{ margin: '0 0 6px 0', fontWeight: 800, fontSize: 13 }}>
                            Notes
                          </h5>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                            {order.notes}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: 'var(--muted)',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <span>Created by: {order.createdBy}</span>
                        <span>Approved by: {order.approvedBy}</span>
                        <span>Payment Terms: {order.paymentTerms}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Create Purchase Order Modal */}
        <Modal
          open={createModalOpen}
          title="Create New Purchase Order"
          onClose={() => {
            setCreateModalOpen(false);
            setFormData({
              poNumber: '',
              supplier: '',
              supplierContact: '',
              supplierEmail: '',
              supplierAddress: '',
              orderDate: new Date().toISOString().split('T')[0],
              expectedDeliveryDate: '',
              status: 'Draft',
              priority: 'Medium',
              paymentTerms: '',
              notes: '',
            });
            setFormItems([]);
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                const totalAmount = formItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
                await purchaseOrdersApi.create({
                  po_number: formData.poNumber,
                  supplier: formData.supplier,
                  supplier_contact: formData.supplierContact || undefined,
                  supplier_email: formData.supplierEmail || undefined,
                  supplier_address: formData.supplierAddress || undefined,
                  order_date: formData.orderDate,
                  expected_delivery_date: formData.expectedDeliveryDate || undefined,
                  status: formData.status as 'Draft' | 'Sent' | 'Confirmed',
                  priority: formData.priority as 'Low' | 'Medium' | 'High' | 'Urgent',
                  total_amount: totalAmount,
                  paid_amount: 0,
                  payment_terms: formData.paymentTerms || undefined,
                  notes: formData.notes || undefined,
                  created_by: 'Admin',
                  items: formItems.map(item => ({
                    name: item.name,
                    type: item.type,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    rate: item.rate,
                    total_amount: item.quantity * item.rate,
                    delivery_status: 'Pending',
                    quality_status: 'Pending',
                  })),
                });
                setCreateModalOpen(false);
                fetchPurchaseOrders();
                setFormData({
                  poNumber: '',
                  supplier: '',
                  supplierContact: '',
                  supplierEmail: '',
                  supplierAddress: '',
                  orderDate: new Date().toISOString().split('T')[0],
                  expectedDeliveryDate: '',
                  status: 'Draft',
                  priority: 'Medium',
                  paymentTerms: '',
                  notes: '',
                });
                setFormItems([]);
              } catch (err: any) {
                alert(err?.message || 'Failed to create purchase order');
              } finally {
                setSubmitting(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Basic Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  PO Number *
                </label>
                <input
                  required
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                  placeholder="PO-2025-001"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Order Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Supplier Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Supplier *
                </label>
                <input
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                  placeholder="Supplier Name"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Contact
                </label>
                <input
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.supplierEmail}
                  onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                  placeholder="supplier@example.com"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                Address
              </label>
              <input
                value={formData.supplierAddress}
                onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
                placeholder="Supplier Address"
              />
            </div>

            {/* Status and Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--fg)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Payment Terms and Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                Payment Terms
              </label>
              <input
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
                placeholder="e.g., 30 Days, Net 60"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--fg)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                placeholder="Additional notes..."
              />
            </div>

            {/* Items Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
                  Items
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormItems([...formItems, {
                      name: '',
                      type: 'Raw Material',
                      category: '',
                      quantity: 0,
                      unit: 'kg',
                      rate: 0,
                    }]);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Plus width={14} height={14} />
                  Add Item
                </button>
              </div>

              {formItems.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr 40px', 
                  gap: 8, 
                  marginBottom: 8,
                  alignItems: 'end',
                }}>
                  <input
                    required
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].name = e.target.value;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                    }}
                  />
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].type = e.target.value;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Finished Good">Finished Good</option>
                  </select>
                  <input
                    required
                    placeholder="Category"
                    value={item.category}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].category = e.target.value;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                    }}
                  />
                  <input
                    required
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].quantity = parseFloat(e.target.value) || 0;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                    }}
                  />
                  <input
                    required
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].unit = e.target.value;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                    }}
                  />
                  <input
                    required
                    type="number"
                    placeholder="Rate"
                    value={item.rate || ''}
                    onChange={(e) => {
                      const newItems = [...formItems];
                      newItems[idx].rate = parseFloat(e.target.value) || 0;
                      setFormItems(newItems);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 8px',
                      color: 'var(--fg)',
                      outline: 'none',
                      fontSize: 12,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormItems(formItems.filter((_, i) => i !== idx));
                    }}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      padding: 6,
                      color: 'var(--fg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Creating...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
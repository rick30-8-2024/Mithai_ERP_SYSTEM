import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import {
  ArrowLeft,
  CheckCircle,
  Search,
  XCircle,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { salesOrdersApi, type SalesOrder } from '../lib/api';

export default function SalesOrderApproval() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

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
  }, [filterPriority]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await salesOrdersApi.list({
        query: searchTerm,
        status: 'Pending', // Only show pending orders for approval
        priority: filterPriority === 'All' ? null : filterPriority,
      });
      setOrders(response.items);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadOrders();
  };

  const handleApproveReject = (order: SalesOrder, action: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setActionType(action);
    setShowApprovalModal(true);
    setComments('');
  };

  const submitApproval = async () => {
    if (!selectedOrder || !actionType) return;

    try {
      const username = localStorage.getItem('ERP_USERNAME') || 'Admin';
      const newStatus = actionType === 'approve' ? 'Ready for Dispatch' : 'Cancelled';

      const updatePayload: any = {
        id: selectedOrder.id,
        status: newStatus,
        notes: comments ? `${selectedOrder.notes || ''}\n[${actionType === 'approve' ? 'Approved' : 'Rejected'}] by ${username}: ${comments}` : selectedOrder.notes,
        last_updated_by: username,
      };

      if (actionType === 'approve') {
        updatePayload.payment_status = 'Paid';
        updatePayload.paid_amount = selectedOrder.finalAmount;
      }

      await salesOrdersApi.update(updatePayload);

      alert(`Order ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setSelectedOrder(null);
      setActionType(null);
      setComments('');
      loadOrders();
    } catch (error) {
      console.error(`Failed to ${actionType} order:`, error);
      alert(`Failed to ${actionType} order`);
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

  // Calculate statistics
  const totalPending = orders.length;
  const highPriority = orders.filter(o => ['High', 'Urgent'].includes(o.priority)).length;
  const totalValue = orders.reduce((sum, o) => sum + o.finalAmount, 0);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
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
            <CheckCircle width={24} height={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Sales Order Approval</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Review and approve pending sales orders
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
          <div style={{ fontSize: 28, fontWeight: 800 }}>{totalPending}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pending Approval</div>
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
          <div style={{ fontSize: 28, fontWeight: 800, color: '#8b4513' }}>{highPriority}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>High Priority</div>
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

      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <CheckCircle width={48} height={48} style={{ margin: '0 auto 16px', color: 'var(--muted)' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--muted)' }}>No orders pending approval</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            All orders have been reviewed
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {orders.map((order) => {
            const priorityColor = getPriorityColor(order.priority);

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 16,
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
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Items</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{order.items.length}</div>
                  </div>
                </div>

                {/* Customer Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12, fontSize: 12 }}>
                  {order.customerContact && (
                    <div>
                      <div style={{ color: 'var(--muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone width={12} height={12} />
                        Contact
                      </div>
                      <div>{order.customerContact}</div>
                    </div>
                  )}
                  {order.customerEmail && (
                    <div>
                      <div style={{ color: 'var(--muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail width={12} height={12} />
                        Email
                      </div>
                      <div>{order.customerEmail}</div>
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
                  <div style={{ marginBottom: 12, padding: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Notes</div>
                    <div style={{ fontSize: 12 }}>{order.notes}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    onClick={() => handleApproveReject(order, 'approve')}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#d4edda',
                      color: '#155724',
                      border: '1px solid #c3e6cb',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <CheckCircle width={16} height={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(order, 'reject')}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#f8d7da',
                      color: '#721c24',
                      border: '1px solid #f5c6cb',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <XCircle width={16} height={16} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowApprovalModal(false)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 24,
              maxWidth: 500,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800 }}>
              {actionType === 'approve' ? 'Approve Order' : 'Reject Order'}
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)' }}>
              Order: {selectedOrder.orderNumber} - {selectedOrder.customerCompany}
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Comments {actionType === 'reject' && '(Required)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add ${actionType === 'approve' ? 'approval' : 'rejection'} comments...`}
                style={{
                  width: '95%',
                  minHeight: 100,
                  padding: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'var(--panel)',
                  color: '#000',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                disabled={actionType === 'reject' && !comments}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: actionType === 'approve' ? '#155724' : '#721c24',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: (actionType === 'reject' && !comments) ? 'not-allowed' : 'pointer',
                  opacity: (actionType === 'reject' && !comments) ? 0.5 : 1,
                }}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
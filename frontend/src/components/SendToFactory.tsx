import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Factory,
  Search,
  Plus,
  MapPin,
  Truck,
  Calendar,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Users,
  Scale,
  X
} from 'lucide-react';
import { factoryTransfersApi, Transfer, FactoryLocation } from '../lib/api';

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
              color: "var(--fg)",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 16, overflow: "auto", flexGrow: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SendToFactory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('All');
  const [filterByFactory, setFilterByFactory] = useState('All');
  const [activeTab, setActiveTab] = useState<'transfers' | 'factories'>('transfers');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showFactoryModal, setShowFactoryModal] = useState(false);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data from API
  const [factories, setFactories] = useState<FactoryLocation[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // Factory form state
  const [factoryForm, setFactoryForm] = useState({
    name: '',
    location: '',
    manager: '',
    contact: '',
    capacity: '',
    specialization: '',
    distance: '',
    status: 'Active' as 'Active' | 'Maintenance' | 'Inactive'
  });

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    fromFactory: '',
    toFactory: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    scheduledDate: '',
    estimatedDeliveryDate: '',
    transportMode: 'Truck' as 'Truck' | 'Rail' | 'Air' | 'Combination',
    notes: '',
  });

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [factoriesData, transfersData] = await Promise.all([
        factoryTransfersApi.listFactories(),
        factoryTransfersApi.listTransfers({})
      ]);
      setFactories(factoriesData);
      setTransfers(transfersData.items);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTransferNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `TRF-${year}${month}${day}-${hours}${minutes}${seconds}`;
  };

  const handleCreateFactory = async () => {
    if (!factoryForm.name || !factoryForm.location) {
      alert('Please fill in required fields (Name and Location)');
      return;
    }

    setLoading(true);
    try {
      const specialization = factoryForm.specialization
        ? factoryForm.specialization.split(',').map(s => s.trim()).filter(s => s)
        : [];

      await factoryTransfersApi.createFactory({
        name: factoryForm.name,
        location: factoryForm.location,
        manager: factoryForm.manager || undefined,
        contact: factoryForm.contact || undefined,
        capacity: factoryForm.capacity || undefined,
        specialization: specialization.length > 0 ? specialization : undefined,
        distance: factoryForm.distance || undefined,
        status: factoryForm.status
      });

      // Reset form
      setFactoryForm({
        name: '',
        location: '',
        manager: '',
        contact: '',
        capacity: '',
        specialization: '',
        distance: '',
        status: 'Active'
      });

      setShowFactoryModal(false);
      await loadData(); // Reload data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create factory location');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!transferForm.fromFactory || !transferForm.toFactory || !transferForm.scheduledDate || !transferForm.estimatedDeliveryDate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const transferNumber = generateTransferNumber();
      const today = new Date().toISOString().split('T')[0];

      await factoryTransfersApi.createTransfer({
        transfer_number: transferNumber,
        from_factory: transferForm.fromFactory,
        to_factory: transferForm.toFactory,
        status: 'Draft',
        priority: transferForm.priority,
        requested_date: today,
        scheduled_date: transferForm.scheduledDate,
        estimated_delivery_date: transferForm.estimatedDeliveryDate,
        transport_mode: transferForm.transportMode,
        notes: transferForm.notes || undefined,
        requested_by: 'System',
        items: [],
      });

      // Reset form
      setTransferForm({
        fromFactory: '',
        toFactory: '',
        priority: 'Medium',
        scheduledDate: '',
        estimatedDeliveryDate: '',
        transportMode: 'Truck',
        notes: '',
      });

      setShowNewTransferModal(false);
      await loadData(); // Reload data
      alert('Transfer created successfully! You can now add items to it.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowTransferModal(true);
  };

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
        return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      case 'In Transit':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'Approved':
        return { bg: '#e9d5ff', color: '#6b21a8', border: '#d8b4fe' };
      case 'Pending Approval':
        return { bg: '#fed7aa', color: '#c2410c', border: '#fdba74' };
      case 'Draft':
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'High':
        return { bg: '#fed7aa', color: '#c2410c', border: '#fdba74' };
      case 'Medium':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'Low':
        return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getFactoryStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      case 'Maintenance':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'Inactive':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getTransferStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle size={16} style={{ color: '#065f46' }} />;
      case 'In Transit':
        return <Truck size={16} style={{ color: '#1e40af' }} />;
      case 'Approved':
        return <CheckCircle size={16} style={{ color: '#6b21a8' }} />;
      case 'Pending Approval':
        return <Clock size={16} style={{ color: '#c2410c' }} />;
      case 'Cancelled':
        return <AlertCircle size={16} style={{ color: '#991b1b' }} />;
      default:
        return <Clock size={16} style={{ color: '#475569' }} />;
    }
  };

  // Calculate statistics
  const totalTransfers = transfers.length;
  const activeTransfers = transfers.filter(t => ['Approved', 'In Transit'].includes(t.status)).length;
  const completedTransfers = transfers.filter(t => t.status === 'Delivered').length;
  const pendingTransfers = transfers.filter(t => ['Draft', 'Pending Approval'].includes(t.status)).length;
  const totalValue = transfers.reduce((sum, transfer) => sum + transfer.totalValue, 0);

  return (
    <div className="page" style={{ minHeight: '100vh', padding: '24px', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--fg)',
          }}
        >
          <ArrowLeft size={16} color="currentColor" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Factory size={24} color="var(--fg)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Send to Factory</h1>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
              Transfer materials between factories
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>{totalTransfers}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Total Transfers</div>
        </div>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#c2410c' }}>{pendingTransfers}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Pending</div>
        </div>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e40af' }}>{activeTransfers}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Active</div>
        </div>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#065f46' }}>{completedTransfers}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Completed</div>
        </div>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0d9488' }}>₹{totalValue.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Total Value</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 4,
        display: 'inline-flex',
        gap: 4,
        marginBottom: 24
      }}>
        <button
          onClick={() => setActiveTab('transfers')}
          style={{
            background: activeTab === 'transfers' ? 'var(--fg)' : 'transparent',
            color: activeTab === 'transfers' ? 'var(--bg)' : 'var(--fg)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Transfer Requests
        </button>
        <button
          onClick={() => setActiveTab('factories')}
          style={{
            background: activeTab === 'factories' ? 'var(--fg)' : 'transparent',
            color: activeTab === 'factories' ? 'var(--bg)' : 'var(--fg)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Factory Locations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'transfers' ? (
        <div>
          {/* Filters and Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '200px' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '87%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                  }}
                />
              </div>
              <select
                value={filterByStatus}
                onChange={(e) => setFilterByStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  cursor: 'pointer',
                  minWidth: '150px',
                }}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={filterByFactory}
                onChange={(e) => setFilterByFactory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  cursor: 'pointer',
                  minWidth: '150px',
                }}
              >
                {factoryNames.map(factory => (
                  <option key={factory} value={factory}>{factory}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNewTransferModal(true)}
                className="btn"
                style={{
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={16} />
                New Transfer
              </button>
            </div>
          </div>

          {/* Transfers List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredTransfers.map((transfer) => {
              const statusStyle = getStatusColor(transfer.status);
              const priorityStyle = getPriorityColor(transfer.priority);

              return (
                <div
                  key={transfer.id}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  {/* Transfer Header */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{transfer.transferNumber}</h3>
                      <span style={{
                        ...statusStyle,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {getTransferStatusIcon(transfer.status)}
                        {transfer.status}
                      </span>
                      <span style={{
                        ...priorityStyle,
                        background: priorityStyle.bg,
                        color: priorityStyle.color,
                        border: `1px solid ${priorityStyle.border}`,
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        {transfer.priority}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
                      <span>{transfer.fromFactory}</span>
                      <ArrowRight size={16} />
                      <span>{transfer.toFactory}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} />
                        Requested: {transfer.requestedDate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Truck size={14} />
                        Expected: {transfer.estimatedDeliveryDate || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Package size={14} />
                        {transfer.items.length} items
                      </div>
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                    borderTop: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>₹{transfer.totalValue.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{transfer.transportMode || 'N/A'}</div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(transfer)}
                      className="btn"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--fg)',
                      }}
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTransfers.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 48,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}>
                <Factory size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
                <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 700 }}>No transfers found</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                  Try adjusting your search criteria or create a new transfer
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Add New Factory Button */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowFactoryModal(true)}
              className="btn"
              style={{
                background: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 10,
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
              }}
            >
              <Plus size={16} />
              Add New Factory Location
            </button>
          </div>
          
          {/* Factory Locations Grid */}
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: 48,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 12
            }}>
              <Clock size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 700 }}>Loading Factories...</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                Please wait while we fetch factory locations
              </p>
              <style>
                {`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          ) : factories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 48,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 12
            }}>
              <Building size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 700 }}>No Factory Locations</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                Click "Add New Factory Location" to add your first factory
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16
            }}>
              {factories.map((factory) => {
                const statusStyle = getFactoryStatusColor(factory.status);
                return (
                  <div
                    key={factory.id}
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Building size={24} color="white" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{factory.name}</h3>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{factory.location}</p>
                        </div>
                      </div>
                      <span style={{
                        ...statusStyle,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        {factory.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {factory.manager && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Users size={14} style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--muted)' }}>Manager:</span>
                          <span>{factory.manager}</span>
                        </div>
                      )}
                      {factory.capacity && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Scale size={14} style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--muted)' }}>Capacity:</span>
                          <span>{factory.capacity}</span>
                        </div>
                      )}
                      {factory.distance && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={14} style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--muted)' }}>Distance:</span>
                          <span>{factory.distance}</span>
                        </div>
                      )}
                      {factory.specialization && factory.specialization.length > 0 && (
                        <div>
                          <p style={{ margin: '8px 0 4px', color: 'var(--muted)' }}>Specialization:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {factory.specialization.map((spec, index) => (
                              <span
                                key={index}
                                style={{
                                  background: 'var(--bg)',
                                  border: '1px solid var(--border)',
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {factory.contact && (
                        <div style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: '1px solid var(--border)',
                          color: 'var(--muted)'
                        }}>
                          Contact: {factory.contact}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Transfer Details Modal */}
      {showTransferModal && selectedTransfer && (
        <Modal 
          open={showTransferModal} 
          title="Transfer Details" 
          onClose={() => setShowTransferModal(false)}
          width={900}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Transport Details Section */}
            {(selectedTransfer.vehicleNumber || selectedTransfer.driverDetails || selectedTransfer.trackingNumber) && (
              <div style={{
                padding: 16,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>Transport Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12, fontSize: 14 }}>
                  {selectedTransfer.vehicleNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Truck size={16} style={{ color: 'var(--muted)' }} />
                      <span style={{ color: 'var(--muted)' }}>Vehicle:</span>
                      <span style={{ fontWeight: 700 }}>{selectedTransfer.vehicleNumber}</span>
                    </div>
                  )}
                  {selectedTransfer.driverDetails && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={16} style={{ color: 'var(--muted)' }} />
                      <span style={{ color: 'var(--muted)' }}>Driver:</span>
                      <span style={{ fontWeight: 700 }}>{selectedTransfer.driverDetails}</span>
                    </div>
                  )}
                  {selectedTransfer.trackingNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={16} style={{ color: 'var(--muted)' }} />
                      <span style={{ color: 'var(--muted)' }}>Tracking:</span>
                      <span style={{ fontWeight: 700 }}>{selectedTransfer.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transfer Items Section */}
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>Transfer Items</h3>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12
              }}>
                {selectedTransfer.items.map((item) => {
                  const itemPriorityStyle = getPriorityColor(item.priority);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <h5 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{item.name}</h5>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{item.category}</p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: item.type === 'Raw Material' ? '#d1fae5' : 
                                     item.type === 'Finished Good' ? '#fed7aa' : '#dbeafe',
                          color: item.type === 'Raw Material' ? '#065f46' : 
                                 item.type === 'Finished Good' ? '#c2410c' : '#1e40af',
                          border: `1px solid ${item.type === 'Raw Material' ? '#a7f3d0' : 
                                              item.type === 'Finished Good' ? '#fdba74' : '#bfdbfe'}`,
                          height: 'fit-content',
                        }}>
                          {item.type}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Transfer Qty</span>
                          <span style={{ fontWeight: 700 }}>{item.transferQuantity} {item.unit}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Available</span>
                          <span>{item.currentStock} {item.unit}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Priority</span>
                          <span style={{
                            ...itemPriorityStyle,
                            background: itemPriorityStyle.bg,
                            color: itemPriorityStyle.color,
                            border: `1px solid ${itemPriorityStyle.border}`,
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                          }}>
                            {item.priority}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Est. Value</span>
                          <span style={{ fontWeight: 700 }}>₹{item.estimatedValue.toLocaleString()}</span>
                        </div>
                        {item.brand && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted)' }}>Brand</span>
                            <span>{item.brand}</span>
                          </div>
                        )}
                        {item.expiryDate && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted)' }}>Expiry</span>
                            <span>{item.expiryDate}</span>
                          </div>
                        )}
                        {item.requiresRefrigeration && (
                          <div style={{
                            marginTop: 4,
                            padding: '4px 8px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            textAlign: 'center',
                          }}>
                            Cold Chain
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Section */}
            {selectedTransfer.notes && (
              <div style={{
                padding: 12,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Notes</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{selectedTransfer.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--muted)',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 12,
              borderTop: '1px solid var(--border)'
            }}>
              {selectedTransfer.requestedBy && <span>Requested by: {selectedTransfer.requestedBy}</span>}
              {selectedTransfer.approvedBy && <span>Approved by: {selectedTransfer.approvedBy}</span>}
              {selectedTransfer.completedBy && <span>Completed by: {selectedTransfer.completedBy}</span>}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Factory Location Modal */}
      {showFactoryModal && (
        <Modal 
          open={showFactoryModal} 
          title="Add New Factory Location" 
          onClose={() => setShowFactoryModal(false)}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={factoryForm.name}
                onChange={(e) => setFactoryForm({ ...factoryForm, name: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., Main Production Unit"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Location <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={factoryForm.location}
                onChange={(e) => setFactoryForm({ ...factoryForm, location: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Manager
              </label>
              <input
                type="text"
                value={factoryForm.manager}
                onChange={(e) => setFactoryForm({ ...factoryForm, manager: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., Rajesh Kumar"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Contact
              </label>
              <input
                type="text"
                value={factoryForm.contact}
                onChange={(e) => setFactoryForm({ ...factoryForm, contact: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., +91 98765 43210"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Capacity
              </label>
              <input
                type="text"
                value={factoryForm.capacity}
                onChange={(e) => setFactoryForm({ ...factoryForm, capacity: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., 5000 kg/day"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Specialization (comma-separated)
              </label>
              <input
                type="text"
                value={factoryForm.specialization}
                onChange={(e) => setFactoryForm({ ...factoryForm, specialization: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., Milk Products, Traditional Sweets"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Distance
              </label>
              <input
                type="text"
                value={factoryForm.distance}
                onChange={(e) => setFactoryForm({ ...factoryForm, distance: e.target.value })}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                }}
                placeholder="e.g., 0 km"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Status
              </label>
              <select
                value={factoryForm.status}
                onChange={(e) => setFactoryForm({ ...factoryForm, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => setShowFactoryModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFactory}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Creating...' : 'Create Factory'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Transfer Modal */}
      {showNewTransferModal && (
        <Modal
          open={showNewTransferModal}
          title="Create New Transfer"
          onClose={() => setShowNewTransferModal(false)}
          width={700}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  From Factory <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={transferForm.fromFactory}
                  onChange={(e) => setTransferForm({ ...transferForm, fromFactory: e.target.value })}
                  style={{
                    width: '95%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Factory</option>
                  {factories.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  To Factory <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={transferForm.toFactory}
                  onChange={(e) => setTransferForm({ ...transferForm, toFactory: e.target.value })}
                  style={{
                    width: '95%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Factory</option>
                  {factories.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Priority
                </label>
                <select
                  value={transferForm.priority}
                  onChange={(e) => setTransferForm({ ...transferForm, priority: e.target.value as any })}
                  style={{
                    width: '95%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Transport Mode
                </label>
                <select
                  value={transferForm.transportMode}
                  onChange={(e) => setTransferForm({ ...transferForm, transportMode: e.target.value as any })}
                  style={{
                    width: '95%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <option value="Truck">Truck</option>
                  <option value="Rail">Rail</option>
                  <option value="Air">Air</option>
                  <option value="Combination">Combination</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Scheduled Date <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="date"
                  value={transferForm.scheduledDate}
                  onChange={(e) => setTransferForm({ ...transferForm, scheduledDate: e.target.value })}
                  style={{
                    width: '87%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Estimated Delivery Date <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="date"
                  value={transferForm.estimatedDeliveryDate}
                  onChange={(e) => setTransferForm({ ...transferForm, estimatedDeliveryDate: e.target.value })}
                  style={{
                    width: '87%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Notes
              </label>
              <textarea
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                rows={4}
                style={{
                  width: '95%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                placeholder="Add any special instructions or notes..."
              />
            </div>

            <div style={{
              padding: 12,
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 8,
              fontSize: 13,
              color: '#854d0e'
            }}>
              <strong>Note:</strong> After creating the transfer, you'll be able to add items to it from the transfer details page.
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowNewTransferModal(false);
                  setTransferForm({
                    fromFactory: '',
                    toFactory: '',
                    priority: 'Medium',
                    scheduledDate: '',
                    estimatedDeliveryDate: '',
                    transportMode: 'Truck',
                    notes: '',
                  });
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransfer}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Creating...' : 'Create Transfer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SendToFactory;
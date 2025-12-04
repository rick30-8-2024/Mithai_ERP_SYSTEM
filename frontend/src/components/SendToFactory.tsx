import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Factory,
  Search,
  Plus,
  MapPin,
  Truck,
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
import { factoryTransfersApi, Transfer, FactoryLocation, InventoryItemSimple } from '../lib/api';

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

  const [factories, setFactories] = useState<FactoryLocation[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventorySearchResults, setInventorySearchResults] = useState<InventoryItemSimple[]>([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItemSimple | null>(null);
  const [availableFromFactories, setAvailableFromFactories] = useState<FactoryLocation[]>([]);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const inventorySearchRef = useRef<HTMLDivElement>(null);

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

  const [transferForm, setTransferForm] = useState({
    fromFactory: '',
    toFactory: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inventorySearchRef.current && !inventorySearchRef.current.contains(event.target as Node)) {
        setShowInventoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchInventory = async () => {
      if (inventorySearchQuery.length < 2) {
        setInventorySearchResults([]);
        return;
      }
      try {
        const results = await factoryTransfersApi.searchInventoryItems({ query: inventorySearchQuery, limit: 20 });
        setInventorySearchResults(results);
        setShowInventoryDropdown(true);
      } catch (err) {
        console.error('Error searching inventory:', err);
      }
    };

    const debounceTimer = setTimeout(searchInventory, 300);
    return () => clearTimeout(debounceTimer);
  }, [inventorySearchQuery]);

  useEffect(() => {
    const loadFactoriesForItem = async () => {
      if (!selectedInventoryItem) {
        setAvailableFromFactories([]);
        setTransferForm(prev => ({ ...prev, fromFactory: '' }));
        return;
      }
      try {
        const itemFactories = await factoryTransfersApi.getFactoriesByInventoryItem(selectedInventoryItem.id);
        setAvailableFromFactories(itemFactories);
        if (itemFactories.length === 1) {
          setTransferForm(prev => ({ ...prev, fromFactory: itemFactories[0].name }));
        } else {
          setTransferForm(prev => ({ ...prev, fromFactory: '' }));
        }
      } catch (err) {
        console.error('Error loading factories for item:', err);
        setAvailableFromFactories([]);
      }
    };

    loadFactoriesForItem();
  }, [selectedInventoryItem]);

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
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create factory location');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInventoryItem = (item: InventoryItemSimple) => {
    setSelectedInventoryItem(item);
    setInventorySearchQuery(item.name);
    setShowInventoryDropdown(false);
  };

  const handleCreateTransfer = async () => {
    if (!selectedInventoryItem || !transferForm.fromFactory || !transferForm.toFactory || !transferForm.quantity) {
      alert('Please fill in all required fields (Inventory Item, From Factory, To Factory, and Quantity)');
      return;
    }

    const quantity = parseFloat(transferForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedInventoryItem.currentStock) {
      alert(`Insufficient stock. Available: ${selectedInventoryItem.currentStock} ${selectedInventoryItem.unit}`);
      return;
    }

    if (transferForm.fromFactory === transferForm.toFactory) {
      alert('From Factory and To Factory cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const transferNumber = generateTransferNumber();

      await factoryTransfersApi.createTransfer({
        transfer_number: transferNumber,
        inventory_item_id: selectedInventoryItem.id,
        quantity: quantity,
        from_factory: transferForm.fromFactory,
        to_factory: transferForm.toFactory,
        status: 'Pending Approval',
        notes: transferForm.notes || undefined,
        requested_by: 'System',
      });

      setTransferForm({
        fromFactory: '',
        toFactory: '',
        quantity: '',
        notes: '',
      });
      setSelectedInventoryItem(null);
      setInventorySearchQuery('');

      setShowNewTransferModal(false);
      await loadData();
      alert('Transfer created successfully!');
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

  const statuses = ['All', 'Pending Approval', 'Approved', 'In Transit', 'Delivered', 'Cancelled'];
  const factoryNames = ['All', ...factories.map(f => f.name)];

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transfer.inventoryItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
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

  const totalTransfers = transfers.length;
  const activeTransfers = transfers.filter(t => ['Approved', 'In Transit'].includes(t.status)).length;
  const completedTransfers = transfers.filter(t => t.status === 'Delivered').length;
  const pendingTransfers = transfers.filter(t => t.status === 'Pending Approval').length;

  return (
    <div className="page" style={{ minHeight: '100vh', padding: '24px', overflow: 'auto' }}>
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
              Transfer inventory between factories
            </p>
          </div>
        </div>
      </div>

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
      </div>

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

      {activeTab === 'transfers' ? (
        <div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredTransfers.map((transfer) => {
              const statusStyle = getStatusColor(transfer.status);

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
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{transfer.transferNumber}</h3>
                    </div>
                    {transfer.inventoryItem && (
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <Package size={16} style={{ color: 'var(--muted)' }} />
                        <span>{transfer.inventoryItem.name}</span>
                        <span style={{ 
                          background: 'var(--bg)', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12 
                        }}>
                          {transfer.quantity} {transfer.inventoryItem.unit}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
                      <span>{transfer.fromFactory}</span>
                      <ArrowRight size={16} />
                      <span>{transfer.toFactory}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                      {transfer.createdDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={14} />
                          Created: {new Date(transfer.createdDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                    borderTop: '1px solid var(--border)'
                  }}>
                    <div>
                      {transfer.requestedBy && (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Requested by: {transfer.requestedBy}</div>
                      )}
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

      {showTransferModal && selectedTransfer && (
        <Modal 
          open={showTransferModal} 
          title="Transfer Details" 
          onClose={() => setShowTransferModal(false)}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: 16,
              background: 'var(--bg)',
              borderRadius: 8,
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>Transfer Information</h3>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Transfer Number:</span>
                  <span style={{ fontWeight: 700 }}>{selectedTransfer.transferNumber}</span>
                </div>
              </div>
            </div>

            {selectedTransfer.inventoryItem && (
              <div style={{
                padding: 16,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>Inventory Item</h3>
                <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Item Name:</span>
                    <span style={{ fontWeight: 700 }}>{selectedTransfer.inventoryItem.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>SKU:</span>
                    <span>{selectedTransfer.inventoryItem.sku}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Category:</span>
                    <span>{selectedTransfer.inventoryItem.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Transfer Quantity:</span>
                    <span style={{ fontWeight: 700 }}>{selectedTransfer.quantity} {selectedTransfer.inventoryItem.unit}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              padding: 16,
              background: 'var(--bg)',
              borderRadius: 8,
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>Transfer Route</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{selectedTransfer.fromFactory}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>From</div>
                </div>
                <ArrowRight size={24} style={{ color: 'var(--muted)' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{selectedTransfer.toFactory}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>To</div>
                </div>
              </div>
            </div>

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
              {selectedTransfer.createdDate && <span>Created: {new Date(selectedTransfer.createdDate).toLocaleString()}</span>}
            </div>
          </div>
        </Modal>
      )}

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

      {showNewTransferModal && (
        <Modal
          open={showNewTransferModal}
          title="Create New Transfer"
          onClose={() => {
            setShowNewTransferModal(false);
            setSelectedInventoryItem(null);
            setInventorySearchQuery('');
            setTransferForm({
              fromFactory: '',
              toFactory: '',
              quantity: '',
              notes: '',
            });
          }}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div ref={inventorySearchRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Inventory Item <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type="text"
                  value={inventorySearchQuery}
                  onChange={(e) => {
                    setInventorySearchQuery(e.target.value);
                    if (selectedInventoryItem && e.target.value !== selectedInventoryItem.name) {
                      setSelectedInventoryItem(null);
                    }
                  }}
                  onFocus={() => {
                    if (inventorySearchResults.length > 0) {
                      setShowInventoryDropdown(true);
                    }
                  }}
                  style={{
                    width: '90%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                  }}
                  placeholder="Search for inventory item..."
                />
              </div>
              {showInventoryDropdown && inventorySearchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 10,
                }}>
                  {inventorySearchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectInventoryItem(item)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          SKU: {item.sku} | {item.category}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{item.currentStock} {item.unit}</div>
                        {item.factory && (
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.factory}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedInventoryItem && (
              <div style={{
                padding: 12,
                background: 'var(--bg)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selectedInventoryItem.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      SKU: {selectedInventoryItem.sku} | {selectedInventoryItem.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#065f46' }}>
                      Available: {selectedInventoryItem.currentStock} {selectedInventoryItem.unit}
                    </div>
                    {selectedInventoryItem.factory && (
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Factory: {selectedInventoryItem.factory}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Quantity <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--panel)',
                    color: 'var(--fg)',
                    fontSize: 14,
                  }}
                  placeholder="Enter quantity to transfer"
                  min="0"
                  step="0.01"
                />
                {selectedInventoryItem && (
                  <span style={{ 
                    padding: '8px 12px', 
                    background: 'var(--bg)', 
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {selectedInventoryItem.unit}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                From Factory <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={transferForm.fromFactory}
                onChange={(e) => setTransferForm({ ...transferForm, fromFactory: e.target.value })}
                disabled={!selectedInventoryItem || availableFromFactories.length === 0}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  cursor: !selectedInventoryItem ? 'not-allowed' : 'pointer',
                  opacity: !selectedInventoryItem ? 0.6 : 1,
                }}
              >
                <option value="">
                  {!selectedInventoryItem 
                    ? 'Select inventory item first' 
                    : availableFromFactories.length === 0 
                      ? 'No factory has this item' 
                      : 'Select Factory'}
                </option>
                {availableFromFactories.map(f => (
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
                <option value="">Select Factory</option>
                {factories.map(f => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Notes
              </label>
              <textarea
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                rows={3}
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

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowNewTransferModal(false);
                  setSelectedInventoryItem(null);
                  setInventorySearchQuery('');
                  setTransferForm({
                    fromFactory: '',
                    toFactory: '',
                    quantity: '',
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
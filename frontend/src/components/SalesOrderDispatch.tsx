import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Search,
  Plus,
  User,
  Phone,
  MapPin,
  Pause,
  Play,
  CheckCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Box,
  X,
  Trash2,
  Receipt,
  Calendar,
} from 'lucide-react';
import { dispatchApi, type DispatchOrder, type FinishedGood, type WorkOrderForDispatch, type ScheduleDispatchRequest } from '../lib/api';

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

interface SkuAssignment {
  id: string;
  sku: string;
  quantity: number;
}

interface ItemInventory {
  itemId: string;
  skuAssignments: SkuAssignment[];
}

interface LogisticsEntry {
  id: string;
  transportService: string;
  otherTransportService: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  comments: string;
  itemAllocations: Record<string, number>;
}

export default function SalesOrderDispatch() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderForDispatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [showDispatchDialog, setShowDispatchDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [holdReason, setHoldReason] = useState('');

  const [currentTab, setCurrentTab] = useState<'inventory' | 'logistics'>('inventory');
  const [itemInventories, setItemInventories] = useState<Record<string, ItemInventory>>({});
  const [logisticsEntries, setLogisticsEntries] = useState<LogisticsEntry[]>([]);

  const [scheduleStep, setScheduleStep] = useState<'select' | 'details'>('select');
  const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState<DispatchOrder | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    scheduledDate: '',
    estimatedDeliveryDate: '',
    deliveryType: 'Standard' as 'Standard' | 'Express' | 'Same Day' | 'Scheduled',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    specialInstructions: ''
  });

  const statuses = ['All', 'Ready for Dispatch', 'Packaging', 'Dispatched', 'In Transit', 'Delivered', 'On Hold', 'Delayed'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];
  const transportServices = ['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'India Post', 'Professional Couriers', 'Gati', 'Other'];

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, finishedGoodsRes, workOrdersRes] = await Promise.all([
        dispatchApi.getOrders(),
        dispatchApi.getFinishedGoods(),
        dispatchApi.getWorkOrders(),
      ]);
      setOrders(ordersRes.items || []);
      setFinishedGoods(finishedGoodsRes.items || []);
      setWorkOrders(workOrdersRes.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || order.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      case 'In Transit':
        return { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' };
      case 'Dispatched':
        return { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' };
      case 'Ready for Dispatch':
        return { bg: '#e0f2f1', text: '#00695c', border: '#80cbc4' };
      case 'Packaging':
        return { bg: '#fff9c4', text: '#f57f17', border: '#fff176' };
      case 'On Hold':
        return { bg: '#ffe0b2', text: '#e65100', border: '#ffb74d' };
      case 'Delayed':
        return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      default:
        return { bg: '#f5f5f5', text: '#424242', border: '#e0e0e0' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      case 'High':
        return { bg: '#ffe0b2', text: '#e65100', border: '#ffb74d' };
      case 'Medium':
        return { bg: '#fff9c4', text: '#f57f17', border: '#fff176' };
      case 'Low':
        return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      default:
        return { bg: '#f5f5f5', text: '#424242', border: '#e0e0e0' };
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      case 'Low Stock':
        return { bg: '#ffe0b2', text: '#e65100', border: '#ffb74d' };
      case 'Out of Stock':
        return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      default:
        return { bg: '#f5f5f5', text: '#424242', border: '#e0e0e0' };
    }
  };

  const handleScheduleDispatch = () => {
    setScheduleStep('select');
    setSelectedOrderForSchedule(null);
    setScheduleFormData({
      scheduledDate: '',
      estimatedDeliveryDate: '',
      deliveryType: 'Standard',
      vehicleNumber: '',
      driverName: '',
      driverContact: '',
      specialInstructions: ''
    });
    setShowScheduleDialog(true);
  };

  const handleSelectOrderForSchedule = (order: DispatchOrder) => {
    setSelectedOrderForSchedule(order);
    const today = new Date();
    const defaultScheduleDate = today.toISOString().split('T')[0];
    const defaultDeliveryDate = new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0];
    setScheduleFormData(prev => ({
      ...prev,
      scheduledDate: defaultScheduleDate,
      estimatedDeliveryDate: defaultDeliveryDate
    }));
    setScheduleStep('details');
  };

  const handleSelectOrderForDispatch = (order: DispatchOrder) => {
    setShowScheduleDialog(false);
    handleCompleteDispatch(order);
  };

  const confirmScheduleDispatch = async () => {
    if (!selectedOrderForSchedule) {
      alert('Please select an order to schedule');
      return;
    }

    if (!scheduleFormData.scheduledDate) {
      alert('Please enter a scheduled dispatch date');
      return;
    }

    if (!scheduleFormData.estimatedDeliveryDate) {
      alert('Please enter an estimated delivery date');
      return;
    }

    try {
      const username = localStorage.getItem('ERP_USERNAME') || 'User';
      const payload: ScheduleDispatchRequest = {
        order_id: parseInt(selectedOrderForSchedule.id),
        scheduled_date: scheduleFormData.scheduledDate,
        estimated_delivery_date: scheduleFormData.estimatedDeliveryDate,
        delivery_type: scheduleFormData.deliveryType,
        vehicle_number: scheduleFormData.vehicleNumber || undefined,
        driver_name: scheduleFormData.driverName || undefined,
        driver_contact: scheduleFormData.driverContact || undefined,
        special_instructions: scheduleFormData.specialInstructions || undefined,
        created_by: username
      };

      await dispatchApi.scheduleDispatch(payload);
      alert('Dispatch scheduled successfully!');
      setShowScheduleDialog(false);
      setSelectedOrderForSchedule(null);
      setScheduleStep('select');
      loadData();
    } catch (error) {
      console.error('Failed to schedule dispatch:', error);
      alert('Failed to schedule dispatch: ' + (error as Error).message);
    }
  };

  const handlePutOnHold = (order: DispatchOrder) => {
    setSelectedOrder(order);
    setHoldReason('');
    setShowHoldDialog(true);
  };

  const confirmPutOnHold = async () => {
    if (!selectedOrder || !holdReason.trim()) {
      alert('Please enter a reason for holding the order');
      return;
    }

    try {
      const username = localStorage.getItem('ERP_USERNAME') || 'User';
      await dispatchApi.holdOrder(parseInt(selectedOrder.id), {
        reason: holdReason,
        held_by: username,
      });
      alert('Order put on hold successfully');
      setShowHoldDialog(false);
      setSelectedOrder(null);
      setHoldReason('');
      loadData();
    } catch (error) {
      console.error('Failed to hold order:', error);
      alert('Failed to put order on hold');
    }
  };

  const handleResumeOrder = async (order: DispatchOrder) => {
    if (!window.confirm('Are you sure you want to resume this order?')) return;

    try {
      await dispatchApi.resumeOrder(parseInt(order.id));
      alert('Order resumed successfully');
      loadData();
    } catch (error) {
      console.error('Failed to resume order:', error);
      alert('Failed to resume order');
    }
  };

  const handleCompleteDispatch = (order: DispatchOrder) => {
    setSelectedOrder(order);
    setCurrentTab('inventory');

    const initialInventories: Record<string, ItemInventory> = {};
    order.items.forEach(item => {
      const remainingQty = item.quantity - (item.dispatchedQuantity || 0);
      if (remainingQty > 0) {
        initialInventories[item.id] = {
          itemId: item.id,
          skuAssignments: [{
            id: `${item.id}-0`,
            sku: '',
            quantity: 0
          }]
        };
      }
    });
    setItemInventories(initialInventories);

    const initialAllocations: Record<string, number> = {};
    order.items.forEach(item => {
      initialAllocations[item.id] = 0;
    });

    setLogisticsEntries([{
      id: 'logistics-0',
      transportService: '',
      otherTransportService: '',
      vehicleNumber: '',
      driverName: '',
      driverContact: '',
      comments: '',
      itemAllocations: initialAllocations
    }]);

    setShowDispatchDialog(true);
  };

  const addSkuAssignment = (itemId: string) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      const newId = `${itemId}-${currentAssignments.length}`;
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: [
            ...currentAssignments,
            { id: newId, sku: '', quantity: 0 }
          ]
        }
      };
    });
  };

  const removeSkuAssignment = (itemId: string, assignmentId: string) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      if (currentAssignments.length <= 1) return prev;
      
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: currentAssignments.filter(sa => sa.id !== assignmentId)
        }
      };
    });
  };

  const updateSkuAssignment = (itemId: string, assignmentId: string, field: 'sku' | 'quantity', value: string | number) => {
    setItemInventories(prev => {
      const currentAssignments = prev[itemId]?.skuAssignments || [];
      return {
        ...prev,
        [itemId]: {
          itemId,
          skuAssignments: currentAssignments.map(sa => 
            sa.id === assignmentId 
              ? { ...sa, [field]: value }
              : sa
          )
        }
      };
    });
  };

  const getTotalAssignedQuantity = (itemId: string): number => {
    const assignments = itemInventories[itemId]?.skuAssignments || [];
    return assignments.reduce((sum, sa) => sum + (sa.quantity || 0), 0);
  };

  const addLogisticsEntry = () => {
    if (!selectedOrder) return;
    
    const initialAllocations: Record<string, number> = {};
    selectedOrder.items.forEach(item => {
      initialAllocations[item.id] = 0;
    });
    
    const newEntry: LogisticsEntry = {
      id: `logistics-${logisticsEntries.length}`,
      transportService: '',
      otherTransportService: '',
      vehicleNumber: '',
      driverName: '',
      driverContact: '',
      comments: '',
      itemAllocations: initialAllocations
    };
    
    setLogisticsEntries([...logisticsEntries, newEntry]);
  };

  const removeLogisticsEntry = (entryId: string) => {
    if (logisticsEntries.length <= 1) return;
    setLogisticsEntries(logisticsEntries.filter(entry => entry.id !== entryId));
  };

  const updateLogisticsEntry = (entryId: string, field: keyof LogisticsEntry, value: any) => {
    setLogisticsEntries(logisticsEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  const updateItemAllocation = (entryId: string, itemId: string, quantity: number) => {
    setLogisticsEntries(logisticsEntries.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            itemAllocations: {
              ...entry.itemAllocations,
              [itemId]: quantity
            }
          }
        : entry
    ));
  };

  const getTotalAllocatedForItem = (itemId: string): number => {
    return logisticsEntries.reduce((sum, entry) => 
      sum + (entry.itemAllocations[itemId] || 0), 0
    );
  };

  const isInventoryValid = () => {
    if (!selectedOrder) return false;
    
    let hasAtLeastOneAssignment = false;
    
    for (const item of selectedOrder.items) {
      const alreadyDispatched = item.dispatchedQuantity || 0;
      const remainingToDispatch = item.quantity - alreadyDispatched;
      
      if (remainingToDispatch <= 0) continue;
      
      const totalAssigned = getTotalAssignedQuantity(item.id);
      const assignments = itemInventories[item.id]?.skuAssignments || [];
      
      if (totalAssigned > remainingToDispatch) return false;
      
      const validAssignments = assignments.filter(sa => 
        sa.sku && sa.quantity > 0
      );
      
      if (validAssignments.length > 0) {
        hasAtLeastOneAssignment = true;
      }
      
      const hasInvalidAssignments = assignments.some(sa => 
        (sa.sku && !sa.quantity) || 
        (!sa.sku && sa.quantity > 0)
      );
      
      if (hasInvalidAssignments) return false;
    }
    
    return hasAtLeastOneAssignment;
  };

  const isLogisticsValid = () => {
    if (!selectedOrder) return false;
    
    const allEntriesValid = logisticsEntries.every(entry => {
      const hasTransport = entry.transportService === 'Other' 
        ? entry.otherTransportService.trim() !== '' 
        : entry.transportService !== '';
      const hasVehicle = entry.vehicleNumber.trim() !== '';
      const hasAllocations = Object.values(entry.itemAllocations).some(qty => qty > 0);
      return hasTransport && hasVehicle && hasAllocations;
    });
    
    if (!allEntriesValid) return false;
    
    let hasAtLeastOneAllocation = false;
    
    for (const item of selectedOrder.items) {
      const alreadyDispatched = item.dispatchedQuantity || 0;
      const remainingToDispatch = item.quantity - alreadyDispatched;
      
      if (remainingToDispatch <= 0) continue;
      
      const totalAssigned = getTotalAssignedQuantity(item.id);
      const totalAllocated = getTotalAllocatedForItem(item.id);
      
      if (totalAllocated > totalAssigned) return false;
      
      if (totalAllocated > 0) {
        hasAtLeastOneAllocation = true;
      }
    }
    
    return hasAtLeastOneAllocation;
  };

  const confirmCompleteDispatch = async () => {
    if (!selectedOrder || !isInventoryValid() || !isLogisticsValid()) {
      alert('Please complete all required fields correctly');
      return;
    }

    try {
      const username = localStorage.getItem('ERP_USERNAME') || 'User';
      
      const inventory_assignments = Object.entries(itemInventories).map(([itemId, inventory]) => ({
        item_id: parseInt(itemId),
        sku_assignments: inventory.skuAssignments
          .filter(sa => sa.sku && sa.quantity > 0)
          .map(sa => ({
            sku: sa.sku,
            quantity: sa.quantity
          }))
      })).filter(inv => inv.sku_assignments.length > 0);

      const logistics = logisticsEntries.map(entry => ({
        transport_service: entry.transportService === 'Other' ? entry.otherTransportService : entry.transportService,
        vehicle_number: entry.vehicleNumber,
        driver_name: entry.driverName || undefined,
        driver_contact: entry.driverContact || undefined,
        comments: entry.comments || undefined,
        item_allocations: Object.fromEntries(
          Object.entries(entry.itemAllocations)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => [parseInt(id), qty])
        )
      }));

      const response = await dispatchApi.completeDispatch(parseInt(selectedOrder.id), {
        inventory_assignments,
        logistics,
        created_by: username
      });

      alert(`Dispatch completed successfully!${response.tracking_number ? `\nTracking Number: ${response.tracking_number}` : ''}`);
      setShowDispatchDialog(false);
      setSelectedOrder(null);
      setItemInventories({});
      setLogisticsEntries([]);
      loadData();
    } catch (error) {
      console.error('Failed to complete dispatch:', error);
      alert('Failed to complete dispatch: ' + (error as Error).message);
    }
  };

  const totalOrders = orders.length;
  const readyForDispatch = orders.filter(o => o.status === 'Ready for Dispatch').length;
  const packaging = orders.filter(o => o.status === 'Packaging').length;
  const inTransit = orders.filter(o => ['Dispatched', 'In Transit'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const onHold = orders.filter(o => o.status === 'On Hold').length;
  const totalValue = orders.reduce((sum, o) => sum + o.finalAmount, 0);

  const relevantFinishedGoods = finishedGoods.filter(fg => {
    const neededProducts = new Set<string>();
    orders
      .filter(order => ['Ready for Dispatch', 'Packaging'].includes(order.status))
      .forEach(order => {
        order.items.forEach(item => neededProducts.add(item.name));
      });
    return Array.from(neededProducts).some(product => 
      fg.name.toLowerCase().includes(product.toLowerCase()) || 
      product.toLowerCase().includes(fg.name.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '16px 24px', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--panel)'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft width={20} height={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            padding: 8, 
            borderRadius: 10, 
            background: '#e0f2f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck width={24} height={24} style={{ color: '#00695c' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Sales Order Dispatch</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-muted)' }}>Manage order dispatch and delivery</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {leftSidebarOpen && (
          <div style={{ 
            width: 250, 
            borderRight: '1px solid var(--border)', 
            background: 'var(--panel)',
            padding: 16,
            overflowY: 'auto',
            height: 'calc(100vh - 80px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList width={20} height={20} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Work Orders</h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <ChevronLeft width={20} height={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {workOrders.map(wo => (
                <div 
                  key={wo.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 12,
                    background: 'var(--bg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{wo.recipeName}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{wo.workOrderNumber}</div>
                    </div>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      ...getStatusColor(wo.status === 'In Progress' ? 'In Transit' : wo.status === 'Completed' ? 'Delivered' : 'Packaging')
                    }}>
                      {wo.status}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--fg-muted)' }}>Quantity:</span>
                      <span style={{ fontWeight: 600 }}>{wo.actualQuantity} pcs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--fg-muted)' }}>Worker:</span>
                      <span>{wo.assignedWorker}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--fg-muted)' }}>Date:</span>
                      <span>{wo.scheduledDate}</span>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: 8,
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'inline-block',
                    ...getPriorityColor(wo.priority)
                  }}>
                    {wo.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            style={{
              position: 'fixed',
              left: 0,
              top: 120,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
              padding: 8,
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronRight width={20} height={20} />
          </button>
        )}

        <div style={{ flex: 1, padding: 24, overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Orders', value: totalOrders, color: '#424242' },
              { label: 'Ready', value: readyForDispatch, color: '#00695c' },
              { label: 'Packaging', value: packaging, color: '#f57f17' },
              { label: 'In Transit', value: inTransit, color: '#6a1b9a' },
              { label: 'Delivered', value: delivered, color: '#2e7d32' },
              { label: 'On Hold', value: onHold, color: '#e65100' },
              { label: 'Total Value', value: `₹${totalValue.toLocaleString()}`, color: '#00695c' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                background: 'var(--panel)'
              }}>
                <div style={{ fontSize: idx === 6 ? 16 : 24, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search 
                width={16} 
                height={16} 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--fg-muted)'
                }} 
              />
              <input
                type="text"
                placeholder="Search by order number, customer, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '86%',
                  padding: '10px 12px 10px 40px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 14,
                  background: 'var(--panel)'
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                background: 'var(--panel)',
                cursor: 'pointer'
              }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                background: 'var(--panel)',
                cursor: 'pointer'
              }}
            >
              {priorities.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
            </select>
            <button
              onClick={handleScheduleDispatch}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                background: '#00695c',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus width={16} height={16} />
              Schedule Dispatch
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {filteredOrders.map(order => (
              <div 
                key={order.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  background: 'var(--panel)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{order.customerCompany}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <User width={12} height={12} style={{ color: 'var(--fg-muted)' }} />
                      <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{order.customerName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{order.orderNumber}</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      <Receipt width={16} height={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 6 }}>Items for Dispatch:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{item.name}</span>
                        <span style={{ color: 'var(--fg-muted)' }}>
                          {item.quantity} {item.unit} ({item.weight} {item.weightUnit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-muted)' }}>Total Weight</span>
                  <span style={{ fontWeight: 600 }}>
                    {order.items.reduce((sum, item) => sum + item.weight, 0)} kg
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-muted)' }}>Amount</span>
                  <span style={{ fontWeight: 600 }}>₹{order.finalAmount.toLocaleString()}</span>
                </div>

                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-muted)' }}>
                    <MapPin width={12} height={12} />
                    <span>{order.deliveryAddress ? order.deliveryAddress.split(',')[0] : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-muted)' }}>
                    <Phone width={12} height={12} />
                    <span>{order.customerContact || 'N/A'}</span>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div style={{ 
                    paddingTop: 12, 
                    borderTop: '1px solid var(--border)',
                    marginBottom: 12,
                    fontSize: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--fg-muted)' }}>Tracking:</span>
                      <span style={{ fontWeight: 600 }}>{order.trackingNumber}</span>
                    </div>
                    {order.vehicleNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--fg-muted)' }}>Vehicle:</span>
                        <span>{order.vehicleNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {order.onHoldReason && (
                  <div style={{ 
                    paddingTop: 12, 
                    borderTop: '1px solid var(--border)',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 6 }}>
                      <Pause width={14} height={14} style={{ color: '#e65100', marginTop: 2 }} />
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: '#e65100' }}>On Hold by {order.onHoldBy}</div>
                        <div style={{ color: 'var(--fg-muted)', marginTop: 2 }}>{order.onHoldReason}</div>
                        <div style={{ color: 'var(--fg-muted)', marginTop: 2 }}>Date: {order.onHoldDate}</div>
                      </div>
                    </div>
                  </div>
                )}

                {order.specialInstructions && (
                  <div style={{ 
                    paddingTop: 12, 
                    borderTop: '1px solid var(--border)',
                    marginBottom: 12,
                    fontSize: 12
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Special Instructions:</div>
                    <div style={{ color: 'var(--fg-muted)' }}>{order.specialInstructions}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    ...getStatusColor(order.status)
                  }}>
                    {order.status}
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    ...getPriorityColor(order.priority)
                  }}>
                    {order.priority}
                  </div>
                </div>

                {(order.status === 'Ready for Dispatch' || order.status === 'Packaging' || order.status === 'Partially Fulfilled') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => handlePutOnHold(order)}
                      style={{
                        padding: '8px 12px',
                        border: '1.5px solid #e65100',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        background: 'transparent',
                        color: '#e65100',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Pause width={14} height={14} />
                      Put on Hold
                    </button>
                    <button
                      onClick={() => handleCompleteDispatch(order)}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        background: '#00695c',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle width={14} height={14} />
                      Complete Dispatch
                    </button>
                  </div>
                )}

                {order.status === 'On Hold' && (
                  <button
                    onClick={() => handleResumeOrder(order)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1.5px solid #2e7d32',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'transparent',
                      color: '#2e7d32',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 12
                    }}
                  >
                    <Play width={14} height={14} />
                    Resume Order
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {rightSidebarOpen && (
          <div style={{ 
            width: 250, 
            borderLeft: '1px solid var(--border)', 
            background: 'var(--panel)',
            padding: 16,
            overflowY: 'auto',
            height: 'calc(100vh - 80px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box width={20} height={20} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Finished Goods</h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <ChevronRight width={20} height={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {relevantFinishedGoods.map(fg => (
                <div 
                  key={fg.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 12,
                    background: 'var(--bg)'
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{fg.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{fg.sku}</div>
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{fg.currentStock}</span>
                    <span style={{ color: 'var(--fg-muted)' }}> {fg.unit}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      ...getStockStatusColor(fg.status)
                    }}>
                      {fg.status}
                    </div>
                    {fg.lastUpdated && (
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                        {fg.lastUpdated}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            style={{
              position: 'fixed',
              right: 0,
              top: 120,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              padding: 8,
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronLeft width={20} height={20} />
          </button>
        )}
      </div>

      <Modal open={showScheduleDialog} title="Schedule Dispatch" onClose={() => setShowScheduleDialog(false)} width={800}>
        <div>
          {scheduleStep === 'select' ? (
            <>
              <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Calendar width={16} height={16} />
                  <span style={{ fontWeight: 600 }}>Step 1: Select Order</span>
                </div>
                Select an order to schedule for dispatch. Only orders with status "Ready for Dispatch", "Packaging", or "Partially Fulfilled" can be scheduled.
              </div>

              {orders.filter(o => ['Ready for Dispatch', 'Packaging', 'Partially Fulfilled'].includes(o.status)).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-muted)' }}>
                  <Truck width={48} height={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Orders Ready for Dispatch</div>
                  <div style={{ fontSize: 14 }}>All orders are either already dispatched, delivered, or on hold.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '50vh', overflowY: 'auto' }}>
                  {orders
                    .filter(o => ['Ready for Dispatch', 'Packaging', 'Partially Fulfilled'].includes(o.status))
                    .map(order => (
                      <div
                        key={order.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 16,
                          background: 'var(--bg)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleSelectOrderForSchedule(order)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#00695c';
                          e.currentTarget.style.background = '#e0f2f1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'var(--bg)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{order.customerCompany}</div>
                            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{order.orderNumber}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              ...getStatusColor(order.status)
                            }}>
                              {order.status}
                            </div>
                            <div style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              ...getPriorityColor(order.priority)
                            }}>
                              {order.priority}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          {order.items.map(item => (
                            <div
                              key={item.id}
                              style={{
                                padding: '4px 8px',
                                background: 'var(--panel)',
                                borderRadius: 6,
                                fontSize: 12
                              }}
                            >
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-muted)' }}>
                            <User width={12} height={12} />
                            <span>{order.customerName}</span>
                          </div>
                          <div style={{ fontWeight: 600, color: '#00695c' }}>
                            ₹{order.finalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Calendar width={16} height={16} />
                  <span style={{ fontWeight: 600 }}>Step 2: Schedule Details</span>
                </div>
                Enter dispatch scheduling details for the selected order.
              </div>

              {selectedOrderForSchedule && (
                <div style={{
                  marginBottom: 20,
                  padding: 16,
                  background: 'var(--bg)',
                  borderRadius: 10,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedOrderForSchedule.customerCompany}</div>
                      <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{selectedOrderForSchedule.orderNumber}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getStatusColor(selectedOrderForSchedule.status)
                      }}>
                        {selectedOrderForSchedule.status}
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getPriorityColor(selectedOrderForSchedule.priority)
                      }}>
                        {selectedOrderForSchedule.priority}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--fg-muted)' }}>Customer: </span>
                      <span style={{ fontWeight: 600 }}>{selectedOrderForSchedule.customerName}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fg-muted)' }}>Amount: </span>
                      <span style={{ fontWeight: 600, color: '#00695c' }}>₹{selectedOrderForSchedule.finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Scheduled Dispatch Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleFormData.scheduledDate}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'var(--panel)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Estimated Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleFormData.estimatedDeliveryDate}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'var(--panel)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Delivery Type *
                  </label>
                  <select
                    value={scheduleFormData.deliveryType}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, deliveryType: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'var(--panel)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Same Day">Same Day</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.vehicleNumber}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    placeholder="e.g., MH-12-AB-1234"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.driverName}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, driverName: e.target.value }))}
                    placeholder="Enter driver name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Driver Contact
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.driverContact}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, driverContact: e.target.value }))}
                    placeholder="Enter contact number"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Special Instructions
                </label>
                <textarea
                  value={scheduleFormData.specialInstructions}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special handling or delivery instructions..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end',
                paddingTop: 16,
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  onClick={() => setScheduleStep('select')}
                  style={{
                    padding: '10px 20px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ChevronLeft width={16} height={16} />
                  Back
                </button>
                <button
                  onClick={() => {
                    setShowScheduleDialog(false);
                    handleCompleteDispatch(selectedOrderForSchedule!);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1.5px solid #1565c0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#1565c0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <CheckCircle width={16} height={16} />
                  Complete Dispatch Now
                </button>
                <button
                  onClick={confirmScheduleDispatch}
                  disabled={!scheduleFormData.scheduledDate || !scheduleFormData.estimatedDeliveryDate}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: (!scheduleFormData.scheduledDate || !scheduleFormData.estimatedDeliveryDate) ? '#ccc' : '#00695c',
                    color: 'white',
                    cursor: (!scheduleFormData.scheduledDate || !scheduleFormData.estimatedDeliveryDate) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Calendar width={16} height={16} />
                  Schedule Dispatch
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={showHoldDialog} title="Put Order on Hold" onClose={() => setShowHoldDialog(false)} width={500}>
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Order: {selectedOrder.orderNumber}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{selectedOrder.customerCompany}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Reason for Hold *
              </label>
              <textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Enter reason for putting this order on hold..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHoldDialog(false)}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPutOnHold}
                disabled={!holdReason.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: !holdReason.trim() ? '#ccc' : '#e65100',
                  color: 'white',
                  cursor: !holdReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Hold
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showDispatchDialog} title="Complete Dispatch" onClose={() => setShowDispatchDialog(false)} width={1000}>
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Order: {selectedOrder.orderNumber}
              </div>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
                {selectedOrder.customerCompany} - {selectedOrder.customerName}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setCurrentTab('inventory')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: currentTab === 'inventory' ? '2px solid #00695c' : '2px solid transparent',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  color: currentTab === 'inventory' ? '#00695c' : 'var(--fg-muted)',
                  cursor: 'pointer'
                }}
              >
                Inventory Assignment
              </button>
              <button
                onClick={() => setCurrentTab('logistics')}
                disabled={!isInventoryValid()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: currentTab === 'logistics' ? '2px solid #00695c' : '2px solid transparent',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  color: currentTab === 'logistics' ? '#00695c' : 'var(--fg-muted)',
                  cursor: !isInventoryValid() ? 'not-allowed' : 'pointer',
                  opacity: !isInventoryValid() ? 0.5 : 1
                }}
              >
                Logistics Details
              </button>
            </div>

            {currentTab === 'inventory' && (
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 13 }}>
                  Assign inventory SKUs to each order item. You can add multiple SKU assignments per item.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selectedOrder.items.map(item => {
                    const alreadyDispatched = item.dispatchedQuantity || 0;
                    const remainingQty = item.quantity - alreadyDispatched;
                    if (remainingQty <= 0) return null;

                    const totalAssigned = getTotalAssignedQuantity(item.id);
                    const assignments = itemInventories[item.id]?.skuAssignments || [];

                    return (
                      <div 
                        key={item.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 16,
                          background: 'var(--bg)'
                        }}
                      >
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>
                            Ordered: {item.quantity} {item.unit} | Dispatched: {alreadyDispatched} | Remaining: {remainingQty}
                          </div>
                          <div style={{ 
                            fontSize: 13, 
                            fontWeight: 600, 
                            marginTop: 4,
                            color: totalAssigned === remainingQty ? '#2e7d32' : totalAssigned > remainingQty ? '#c62828' : '#f57f17'
                          }}>
                            Assigned: {totalAssigned} / {remainingQty}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {assignments.map((assignment, index) => (
                            <div key={assignment.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                <select
                                  value={assignment.sku}
                                  onChange={(e) => updateSkuAssignment(item.id, assignment.id, 'sku', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    background: 'var(--panel)'
                                  }}
                                >
                                  <option value="">Select SKU</option>
                                  {finishedGoods
                                    .filter(fg => 
                                      fg.name.toLowerCase().includes(item.name.toLowerCase()) ||
                                      item.name.toLowerCase().includes(fg.name.toLowerCase())
                                    )
                                    .map(fg => (
                                      <option key={fg.sku} value={fg.sku}>
                                        {fg.sku} - {fg.name} (Available: {fg.currentStock})
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              <div style={{ width: 150 }}>
                                <input
                                  type="number"
                                  min="0"
                                  value={assignment.quantity || ''}
                                  onChange={(e) => updateSkuAssignment(item.id, assignment.id, 'quantity', parseInt(e.target.value) || 0)}
                                  placeholder="Quantity"
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 8,
                                    fontSize: 13
                                  }}
                                />
                              </div>
                              {assignments.length > 1 && (
                                <button
                                  onClick={() => removeSkuAssignment(item.id, assignment.id)}
                                  style={{
                                    padding: 8,
                                    border: '1.5px solid #c62828',
                                    borderRadius: 8,
                                    background: 'transparent',
                                    color: '#c62828',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 width={16} height={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addSkuAssignment(item.id)}
                          style={{
                            marginTop: 12,
                            padding: '6px 12px',
                            border: '1.5px solid #00695c',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: 'transparent',
                            color: '#00695c',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Plus width={14} height={14} />
                          Add SKU Assignment
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentTab === 'logistics' && (
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 13 }}>
                  Configure logistics details for dispatching this order. You can add multiple vehicles.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                  {logisticsEntries.map((entry, entryIndex) => (
                    <div 
                      key={entry.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: 16,
                        background: 'var(--bg)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Vehicle {entryIndex + 1}</div>
                        {logisticsEntries.length > 1 && (
                          <button
                            onClick={() => removeLogisticsEntry(entry.id)}
                            style={{
                              padding: 6,
                              border: '1.5px solid #c62828',
                              borderRadius: 8,
                              background: 'transparent',
                              color: '#c62828',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                            Transport Service *
                          </label>
                          <select
                            value={entry.transportService}
                            onChange={(e) => updateLogisticsEntry(entry.id, 'transportService', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 13,
                              background: 'var(--panel)'
                            }}
                          >
                            <option value="">Select Service</option>
                            {transportServices.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {entry.transportService === 'Other' && (
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                              Other Service Name *
                            </label>
                            <input
                              type="text"
                              value={entry.otherTransportService}
                              onChange={(e) => updateLogisticsEntry(entry.id, 'otherTransportService', e.target.value)}
                              placeholder="Enter service name"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1.5px solid var(--border)',
                                borderRadius: 8,
                                fontSize: 13
                              }}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                            Vehicle Number *
                          </label>
                          <input
                            type="text"
                            value={entry.vehicleNumber}
                            onChange={(e) => updateLogisticsEntry(entry.id, 'vehicleNumber', e.target.value)}
                            placeholder="e.g., MH-12-AB-1234"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 13
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                            Driver Name
                          </label>
                          <input
                            type="text"
                            value={entry.driverName}
                            onChange={(e) => updateLogisticsEntry(entry.id, 'driverName', e.target.value)}
                            placeholder="Driver name"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 13
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                            Driver Contact
                          </label>
                          <input
                            type="text"
                            value={entry.driverContact}
                            onChange={(e) => updateLogisticsEntry(entry.id, 'driverContact', e.target.value)}
                            placeholder="Contact number"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 13
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                          Item Allocations
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {selectedOrder.items.map(item => {
                            const totalAssigned = getTotalAssignedQuantity(item.id);
                            const currentAllocation = entry.itemAllocations[item.id] || 0;
                            
                            return (
                              <div 
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: 8,
                                  background: 'var(--panel)',
                                  borderRadius: 6
                                }}
                              >
                                <div style={{ flex: 1, fontSize: 13 }}>
                                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                                  <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                                    Assigned: {totalAssigned}
                                  </div>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  max={totalAssigned}
                                  value={currentAllocation || ''}
                                  onChange={(e) => updateItemAllocation(entry.id, item.id, parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  style={{
                                    width: 80,
                                    padding: '6px 10px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    textAlign: 'right'
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                          Comments
                        </label>
                        <textarea
                          value={entry.comments}
                          onChange={(e) => updateLogisticsEntry(entry.id, 'comments', e.target.value)}
                          placeholder="Any additional comments..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1.5px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 13,
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLogisticsEntry}
                  style={{
                    padding: '8px 16px',
                    border: '1.5px solid #00695c',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#00695c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Plus width={16} height={16} />
                  Add Another Vehicle
                </button>

                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: '#e3f2fd',
                  borderRadius: 10
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Dispatch Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    {selectedOrder.items.map(item => {
                      const totalAssigned = getTotalAssignedQuantity(item.id);
                      const totalAllocated = getTotalAllocatedForItem(item.id);
                      
                      return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.name}:</span>
                          <span style={{ fontWeight: 600 }}>
                            {totalAllocated} / {totalAssigned} assigned
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'flex-end', 
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => setShowDispatchDialog(false)}
                style={{
                  padding: '10px 20px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {currentTab === 'inventory' ? (
                <button
                  onClick={() => setCurrentTab('logistics')}
                  disabled={!isInventoryValid()}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: !isInventoryValid() ? '#ccc' : '#00695c',
                    color: 'white',
                    cursor: !isInventoryValid() ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next: Logistics
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('inventory')}
                    style={{
                      padding: '10px 20px',
                      border: '1.5px solid #00695c',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'transparent',
                      color: '#00695c',
                      cursor: 'pointer'
                    }}
                  >
                    Back to Inventory
                  </button>
                  <button
                    onClick={confirmCompleteDispatch}
                    disabled={!isLogisticsValid()}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      background: !isLogisticsValid() ? '#ccc' : '#00695c',
                      color: 'white',
                      cursor: !isLogisticsValid() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <CheckCircle width={16} height={16} />
                    Confirm Dispatch
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
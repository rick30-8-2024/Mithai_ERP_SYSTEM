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
  Receipt,
  Download,
  Loader2,
} from 'lucide-react';
import { dispatchApi, customerManagementApi, type DispatchOrder, type FinishedGood, type WorkOrderForDispatch } from '../lib/api';
import html2pdf from 'html2pdf.js';

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
        <div style={{ padding: 16, overflowY: "auto", overflowX: "hidden", flex: 1 }}>{children}</div>
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

interface DispatchedItemInfo {
  name: string;
  quantity: number;
  unit: string;
}

interface DispatchedOrderInfo {
  dsNumber: string;
  orderNumber: string;
  customerCompany: string;
  customerName: string;
  customerAddress: string;
  customerGst: string;
  transportService: string;
  vehicleNumber: string;
  dispatchDate: string;
  dueDate: string;
  items: DispatchedItemInfo[];
  createdAt: string;
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
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [holdReason, setHoldReason] = useState('');

  const [currentTab, setCurrentTab] = useState<'inventory' | 'logistics'>('inventory');
  const [itemInventories, setItemInventories] = useState<Record<string, ItemInventory>>({});
  const [logisticsEntries, setLogisticsEntries] = useState<LogisticsEntry[]>([]);

  const [dispatchedOrderInfo, setDispatchedOrderInfo] = useState<DispatchedOrderInfo | null>(null);
  const [showDownloadCard, setShowDownloadCard] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dsCounter, setDsCounter] = useState<number>(() => {
    const stored = localStorage.getItem('ERP_DS_COUNTER');
    return stored ? parseInt(stored, 10) : 1000;
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
            sku: item.sku || 'N/A',
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

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItemInventories(prev => {
      const currentInventory = prev[itemId];
      if (!currentInventory) return prev;
      
      return {
        ...prev,
        [itemId]: {
          ...currentInventory,
          skuAssignments: currentInventory.skuAssignments.map(sa => ({
            ...sa,
            quantity
          }))
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
      const inventory = itemInventories[item.id];
      
      if (!inventory || !inventory.skuAssignments[0]?.sku) return false;
      
      if (totalAssigned > remainingToDispatch) return false;
      
      if (totalAssigned > 0) {
        hasAtLeastOneAssignment = true;
      }
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

  const generateDeliverySlipHTML = (info: DispatchedOrderInfo): string => {
    const itemRows = info.items.map(item => `
      <tr>
        <td class="item-name">${item.name}</td>
        <td class="kg">${item.quantity} ${item.unit}</td>
        <td class="tray"></td>
        <td class="cartoon"></td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Slip - ${info.dsNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            padding: 0;
            margin: 0;
        }

        .delivery-slip {
            width: 100%;
            max-width: 100%;
            background-color: #fff;
            padding: 15px 20px;
            border: 2px solid #333;
            box-sizing: border-box;
        }

        .header-title {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 8px 20px;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }

        .header-content {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
        }

        .logo-section {
            width: 120px;
            margin-right: 20px;
        }

        .logo-placeholder {
            width: 100px;
            height: 80px;
            background-color: #8B0000;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            border-radius: 5px;
        }

        .logo-placeholder .company-name {
            font-size: 16px;
        }

        .logo-placeholder .tagline {
            font-size: 8px;
            margin-top: 5px;
        }

        .company-details {
            flex: 1;
        }

        .company-details h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            border-bottom: 1px dashed #333;
            padding-bottom: 3px;
        }

        .company-details p {
            font-size: 12px;
            line-height: 1.4;
        }

        .info-row {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .info-row .field {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
        }

        .info-row .field label {
            font-weight: bold;
            margin-right: 8px;
        }

        .info-row .field .value {
            border-bottom: 1px solid #333;
            min-width: 60px;
            padding: 0 4px 2px 4px;
        }

        .full-width-field {
            margin-bottom: 8px;
            font-size: 13px;
            display: flex;
            align-items: baseline;
        }

        .full-width-field label {
            font-weight: bold;
            margin-right: 5px;
        }

        .full-width-field .value {
            border-bottom: 1px solid #333;
            flex: 1;
            min-height: 18px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 10px;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
            font-size: 12px;
        }

        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .items-table th.item-name,
        .items-table td.item-name {
            width: 45%;
            text-align: left;
            padding-left: 10px;
        }

        .items-table th.kg,
        .items-table td.kg {
            width: 15%;
        }

        .items-table th.tray,
        .items-table td.tray {
            width: 20%;
        }

        .items-table th.cartoon,
        .items-table td.cartoon {
            width: 20%;
        }

        .items-table td {
            height: 25px;
        }

        .table-footer {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #333;
            border-top: none;
            letter-spacing: 1px;
        }

        .footer-section {
            margin-top: 15px;
            font-size: 11px;
        }

        .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 5px;
        }

        .bill-note {
            font-weight: normal;
        }

        .signature-area {
            text-align: right;
            font-weight: bold;
        }

        .gstin {
            font-weight: bold;
        }

        @media print {
            body {
                background-color: white;
                padding: 0;
            }

            .delivery-slip {
                width: 100%;
                min-height: auto;
                border: 2px solid #333;
            }
        }
    </style>
</head>
<body>
    <div class="delivery-slip">
        <div class="header-title">DELIVERY SLIP</div>
        
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-placeholder">
                    <span>the</span>
                    <span class="company-name">mithai</span>
                    <span>company</span>
                    <span class="tagline">THE TASTE OF SWEET LOVERS</span>
                </div>
            </div>
            <div class="company-details">
                <h2>JANET's RETAIL AND DISTRIBUTION PVT. LTD.</h2>
                <p>Plot No. 321/2, Lions School Road, Phase-01,</p>
                <p>Naroda, G.I.D.C., Ahmedabad-382 330.</p>
                <p>(M) 9512008888, 9687040000</p>
            </div>
        </div>

        <div class="info-row">
            <div class="field ds-no">
                <label>D.S. No.</label>
                <span class="value">${info.dsNumber}</span>
            </div>
            <div class="field date">
                <label>Date:</label>
                <span class="value" style="min-width: 30px;">${info.dispatchDate}</span>
            </div>
        </div>

        <div class="full-width-field">
            <label>M/s.</label>
            <span class="value">${info.customerCompany} - ${info.customerName}</span>
        </div>

        <div class="full-width-field">
            <label>Address</label>
            <span class="value">${info.customerAddress}</span>
        </div>

        <div class="full-width-field">
            <label>Party GSTIN No.</label>
            <span class="value">${info.customerGst || '✗'}</span>
        </div>

        <div class="full-width-field">
            <label>Transport Service</label>
            <span class="value">${info.transportService} (${info.vehicleNumber})</span>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th class="item-name">Item Name</th>
                    <th class="kg">Qty.</th>
                    <th class="tray">Tray</th>
                    <th class="cartoon">Cartoon</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>

        <div class="table-footer">THE TASTE OF SWEET LOVERS</div>

        <div class="footer-section">
            <div class="footer-row">
                <span class="bill-note">Bill of this Delivery slip will be Received next day.</span>
                <span class="signature-area">For, Janet's Retail and Distribution Pvt. Ltd.</span>
            </div>
            <div class="gstin">GSTIN : 24AAECJ5526H1ZO</div>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadDeliverySlipAsPDF = (info: DispatchedOrderInfo) => {
    const htmlContent = generateDeliverySlipHTML(info);
    
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    const element = container.querySelector('.delivery-slip');
    if (element) {
      const opt = {
        margin: 10,
        filename: `GatePass-${info.dsNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(container);
      });
    } else {
      document.body.removeChild(container);
    }
  };

  const confirmCompleteDispatch = async () => {
    if (!selectedOrder || !isInventoryValid() || !isLogisticsValid()) {
      alert('Please complete all required fields correctly');
      return;
    }

    setIsDispatching(true);
    try {
      const username = localStorage.getItem('ERP_USERNAME') || 'User';
      
      const inventory_assignments = Object.entries(itemInventories).map(([itemId, inventory]) => ({
        item_id: itemId,
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
        )
      }));

      const response = await dispatchApi.completeDispatch(selectedOrder.id, {
        inventory_assignments,
        logistics,
        created_by: username
      });

      let customerGst = '';
      try {
        const companies = await customerManagementApi.searchCompanies(selectedOrder.customerCompany, 1);
        if (companies.companies && companies.companies.length > 0) {
          const customerData = await customerManagementApi.getByCompany(selectedOrder.customerCompany);
          if (customerData) {
            const fullCustomer = await customerManagementApi.list({ query: selectedOrder.customerCompany, limit: 1 });
            if (fullCustomer.items && fullCustomer.items.length > 0) {
              customerGst = fullCustomer.items[0].gstin || '';
            }
          }
        }
      } catch (e) {
        console.log('Could not fetch customer GST:', e);
      }

      const newDsNumber = dsCounter + 1;
      setDsCounter(newDsNumber);
      localStorage.setItem('ERP_DS_COUNTER', newDsNumber.toString());

      const dispatchedItems: DispatchedItemInfo[] = [];
      logisticsEntries.forEach(entry => {
        Object.entries(entry.itemAllocations).forEach(([itemId, qty]) => {
          if (qty > 0) {
            const orderItem = selectedOrder.items.find(i => i.id === itemId);
            if (orderItem) {
              const existing = dispatchedItems.find(d => d.name === orderItem.name);
              if (existing) {
                existing.quantity += qty;
              } else {
                dispatchedItems.push({
                  name: orderItem.name,
                  quantity: qty,
                  unit: orderItem.unit
                });
              }
            }
          }
        });
      });

      const firstLogistics = logisticsEntries[0];
      const transportService = firstLogistics.transportService === 'Other'
        ? firstLogistics.otherTransportService
        : firstLogistics.transportService;

      const dispatchInfo: DispatchedOrderInfo = {
        dsNumber: `DS-${newDsNumber}`,
        orderNumber: selectedOrder.orderNumber,
        customerCompany: selectedOrder.customerCompany,
        customerName: selectedOrder.customerName,
        customerAddress: selectedOrder.deliveryAddress || 'N/A',
        customerGst: customerGst,
        transportService: transportService,
        vehicleNumber: firstLogistics.vehicleNumber,
        dispatchDate: new Date().toLocaleDateString('en-IN'),
        dueDate: selectedOrder.dueDate,
        items: dispatchedItems,
        createdAt: new Date().toISOString()
      };

      const existingGatePasses = JSON.parse(localStorage.getItem('ERP_GATE_PASSES') || '[]');
      existingGatePasses.push(dispatchInfo);
      localStorage.setItem('ERP_GATE_PASSES', JSON.stringify(existingGatePasses));

      setDispatchedOrderInfo(dispatchInfo);
      setShowDownloadCard(true);
      setShowDispatchDialog(false);
      setSelectedOrder(null);
      
      setItemInventories({});
      setLogisticsEntries([]);
      loadData();
    } catch (error) {
      console.error('Failed to complete dispatch:', error);
      alert('Failed to complete dispatch: ' + (error as Error).message);
    } finally {
      setIsDispatching(false);
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
                    {order.items.map(item => {
                      const remainingQty = item.quantity - (item.dispatchedQuantity || 0);
                      return (
                        <div key={item.id} style={{ fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            <span style={{ color: 'var(--fg-muted)' }}>
                              {item.quantity} {item.unit} ({remainingQty} {item.unit})
                            </span>
                          </div>
                          {item.sku && (
                            <div style={{ fontSize: 11, color: 'var(--fg-muted)', paddingLeft: 4 }}>
                              SKU: {item.sku}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-muted)' }}>Total Weight</span>
                  <span style={{ fontWeight: 600 }}>
                    {(() => {
                      const weightUnits = ['kg', 'g', 'gram', 'grams', 'kilogram', 'kilograms'];
                      let totalWeightKg = 0;
                      order.items.forEach(item => {
                        const unitLower = item.unit.toLowerCase();
                        if (weightUnits.includes(unitLower)) {
                          const remainingQty = item.quantity - (item.dispatchedQuantity || 0);
                          if (unitLower === 'g' || unitLower === 'gram' || unitLower === 'grams') {
                            totalWeightKg += remainingQty / 1000;
                          } else {
                            totalWeightKg += remainingQty;
                          }
                        }
                      });
                      return totalWeightKg > 0 ? `${totalWeightKg.toFixed(2)} kg` : '0 kg';
                    })()}
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

      {showDownloadCard && dispatchedOrderInfo && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: 'var(--panel)',
          border: '2px solid #00695c',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          width: 320,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateY(100px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#00695c' }}>Dispatch Completed!</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>
                {dispatchedOrderInfo.dsNumber}
              </div>
            </div>
            <button
              onClick={() => {
                setShowDownloadCard(false);
                setDispatchedOrderInfo(null);
                setSelectedOrder(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X width={18} height={18} />
            </button>
          </div>
          
          <div style={{ fontSize: 13, marginBottom: 16 }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--fg-muted)' }}>Order: </span>
              <span style={{ fontWeight: 600 }}>{dispatchedOrderInfo.orderNumber}</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--fg-muted)' }}>Customer: </span>
              <span style={{ fontWeight: 600 }}>{dispatchedOrderInfo.customerCompany}</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--fg-muted)' }}>Items: </span>
              <span style={{ fontWeight: 600 }}>{dispatchedOrderInfo.items.length}</span>
            </div>
          </div>

          <button
            onClick={() => downloadDeliverySlipAsPDF(dispatchedOrderInfo)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              background: '#00695c',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Download width={18} height={18} />
            Download Gate Pass
          </button>
        </div>
      )}

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
              <div>
                <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 13 }}>
                  Enter the quantity to dispatch for each item. The SKU is automatically assigned based on the product.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selectedOrder.items.map(item => {
                    const alreadyDispatched = item.dispatchedQuantity || 0;
                    const remainingQty = item.quantity - alreadyDispatched;
                    if (remainingQty <= 0) return null;

                    const totalAssigned = getTotalAssignedQuantity(item.id);
                    const inventory = itemInventories[item.id];
                    const sku = inventory?.skuAssignments[0]?.sku || 'N/A';
                    const quantity = inventory?.skuAssignments[0]?.quantity || 0;
                    
                    const matchingFG = finishedGoods.find(fg => fg.sku === sku);

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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>
                                Ordered: {item.quantity} {item.unit} | Dispatched: {alreadyDispatched} | Remaining: {remainingQty}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              background: '#e3f2fd',
                              color: '#1565c0',
                              whiteSpace: 'nowrap',
                              marginLeft: 12
                            }}>
                              SKU: {sku}
                            </div>
                          </div>
                          {matchingFG && (
                            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
                              Available in Finished Goods: {matchingFG.currentStock} {matchingFG.unit}
                            </div>
                          )}
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 4,
                            color: totalAssigned === remainingQty ? '#2e7d32' : totalAssigned > remainingQty ? '#c62828' : '#f57f17'
                          }}>
                            Assigned: {totalAssigned} / {remainingQty}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, minWidth: 80 }}>
                            Quantity:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={remainingQty}
                            value={quantity || ''}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                            placeholder="Enter quantity"
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600
                            }}
                          />
                          <span style={{ fontSize: 13, color: 'var(--fg-muted)', minWidth: 60 }}>
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentTab === 'logistics' && (
              <div>
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

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                                background: 'var(--panel)',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="">Select Service</option>
                              {transportServices.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

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
                                fontSize: 13,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
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
                                fontSize: 13,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                                fontSize: 13,
                                boxSizing: 'border-box'
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
                                fontSize: 13,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
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
                                  borderRadius: 6,
                                  gap: 12
                                }}
                              >
                                <div style={{ flex: 1, fontSize: 13, minWidth: 0 }}>
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
                                    flexShrink: 0,
                                    padding: '6px 10px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    textAlign: 'right',
                                    boxSizing: 'border-box'
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
                            resize: 'vertical',
                            boxSizing: 'border-box'
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
                    disabled={!isLogisticsValid() || isDispatching}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      background: (!isLogisticsValid() || isDispatching) ? '#ccc' : '#00695c',
                      color: 'white',
                      cursor: (!isLogisticsValid() || isDispatching) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {isDispatching ? (
                      <>
                        <Loader2 width={16} height={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle width={16} height={16} />
                        Confirm Dispatch
                      </>
                    )}
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
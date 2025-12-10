import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Search,
  Download,
  Calendar,
  Truck,
  User,
  MapPin,
  Package,
  Filter,
  X,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface DispatchedItemInfo {
  name: string;
  quantity: number;
  unit: string;
}

interface GatePassRecord {
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

export default function GatePass() {
  const navigate = useNavigate();
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>([]);
  const [filteredPasses, setFilteredPasses] = useState<GatePassRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadGatePasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [gatePasses, searchTerm, dateFilter, customStartDate, customEndDate]);

  const loadGatePasses = () => {
    const stored = localStorage.getItem('ERP_GATE_PASSES');
    if (stored) {
      const passes = JSON.parse(stored) as GatePassRecord[];
      passes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGatePasses(passes);
    }
  };

  const applyFilters = () => {
    let filtered = [...gatePasses];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pass => 
        pass.dsNumber.toLowerCase().includes(term) ||
        pass.orderNumber.toLowerCase().includes(term) ||
        pass.customerCompany.toLowerCase().includes(term) ||
        pass.customerName.toLowerCase().includes(term) ||
        pass.transportService.toLowerCase().includes(term)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(pass => {
        const passDate = new Date(pass.createdAt);
        const passDateOnly = new Date(passDate.getFullYear(), passDate.getMonth(), passDate.getDate());
        
        switch (dateFilter) {
          case 'today':
            return passDateOnly.getTime() === today.getTime();
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return passDateOnly.getTime() === yesterday.getTime();
          }
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return passDateOnly >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return passDateOnly >= monthAgo;
          }
          case 'custom':
            if (customStartDate && customEndDate) {
              const start = new Date(customStartDate);
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              return passDate >= start && passDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    setFilteredPasses(filtered);
  };

  const generateDeliverySlipHTML = (info: GatePassRecord): string => {
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

            .delivery-slip {
                width: 100%;
                min-height: auto;
                border: none;
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

  const downloadGatePassPDF = (pass: GatePassRecord) => {
    const htmlContent = generateDeliverySlipHTML(pass);
    
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    const element = container.querySelector('.delivery-slip');
    if (element) {
      const opt = {
        margin: 10,
        filename: `GatePass-${pass.dsNumber}.pdf`,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            background: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText width={24} height={24} style={{ color: '#1565c0' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Gate Pass / Inward</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-muted)' }}>View and download delivery gate passes</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            background: 'var(--panel)'
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1565c0' }}>{gatePasses.length}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Total Gate Passes</div>
          </div>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            background: 'var(--panel)'
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#00695c' }}>
              {gatePasses.filter(p => {
                const today = new Date();
                const passDate = new Date(p.createdAt);
                return passDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Today</div>
          </div>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            background: 'var(--panel)'
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f57f17' }}>{filteredPasses.length}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Filtered Results</div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 24, 
          flexWrap: 'wrap',
          alignItems: 'flex-end' 
        }}>
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
              placeholder="Search by DS number, order, customer, transport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                background: 'var(--panel)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter width={16} height={16} style={{ color: 'var(--fg-muted)' }} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                background: 'var(--panel)',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 14,
                  background: 'var(--panel)'
                }}
              />
              <span style={{ color: 'var(--fg-muted)' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 14,
                  background: 'var(--panel)'
                }}
              />
            </div>
          )}
        </div>

        {filteredPasses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: 'var(--fg-muted)'
          }}>
            <FileText width={48} height={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Gate Passes Found</div>
            <div style={{ fontSize: 14 }}>
              {gatePasses.length === 0 
                ? 'Complete a dispatch from Sales Order Dispatch to generate gate passes.'
                : 'Try adjusting your search or filter criteria.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {filteredPasses.map((pass, index) => (
              <div
                key={pass.dsNumber + index}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  background: 'var(--panel)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1565c0' }}>{pass.dsNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                      Order: {pass.orderNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadGatePassPDF(pass)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#00695c',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Download width={14} height={14} />
                    Download
                  </button>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <User width={14} height={14} style={{ color: 'var(--fg-muted)' }} />
                    <span style={{ fontWeight: 600 }}>{pass.customerCompany}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', paddingLeft: 20 }}>
                    {pass.customerName}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13 }}>
                  <MapPin width={14} height={14} style={{ color: 'var(--fg-muted)' }} />
                  <span style={{ color: 'var(--fg-muted)' }}>
                    {pass.customerAddress.length > 40 ? pass.customerAddress.substring(0, 40) + '...' : pass.customerAddress}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13 }}>
                  <Truck width={14} height={14} style={{ color: 'var(--fg-muted)' }} />
                  <span>{pass.transportService} - {pass.vehicleNumber}</span>
                </div>

                <div style={{ 
                  marginTop: 12, 
                  paddingTop: 12, 
                  borderTop: '1px solid var(--border)',
                  fontSize: 13 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Package width={14} height={14} style={{ color: 'var(--fg-muted)' }} />
                    <span style={{ fontWeight: 600 }}>{pass.items.length} Item(s)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {pass.items.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '2px 8px',
                          background: '#e3f2fd',
                          borderRadius: 4,
                          fontSize: 11,
                          color: '#1565c0'
                        }}
                      >
                        {item.name}: {item.quantity} {item.unit}
                      </span>
                    ))}
                    {pass.items.length > 3 && (
                      <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                        +{pass.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ 
                  marginTop: 12, 
                  paddingTop: 12, 
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--fg-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar width={12} height={12} />
                    <span>Created: {formatDate(pass.createdAt)}</span>
                  </div>
                  {pass.dueDate && (
                    <span>Due: {pass.dueDate}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import '../App.css';
import {
  Package,
  ChefHat,
  ClipboardList,
  Monitor,
  ShoppingCart,
  Factory,
  Receipt,
  CheckCircle,
  Truck,
  KeyRound,
  Users,
  Calculator,
  Route,
  Shield,
  UserCheck,
  CreditCard,
  HeadphonesIcon
} from 'lucide-react';

const DASHBOARD_DATA = {
  "the Mithai company": {
    "Inventory": ["Manage stock levels"],
    "Recipe Management": ["Manage recipes"],
    "Work Order": ["Production orders"],
    "My Work Orders": ["Assigned work orders"],
    "Kitchen Display": ["Kitchen operations"],
    "Purchase Order": ["Supplier orders"],
    "Send to Factory": ["Transfer to production"],
    "Sales Order": ["Customer orders"],
    "Sales Order Approval": ["Approve orders"],
    "Sales Order Dispatch": ["Dispatch orders"],
    "Gate Pass/Inward": ["Entry management"],
    "User Management": ["Manage users"],
    "Accounting": ["Financial records"],
    "Quality Check": ["Quality control"],
    "Customer Management": ["Manage customers"],
    "Payment Tracking": ["Track payments"],
    "CRM": ["Customer relations"]
  }
} as const;

function getIcon(name: string, size = 24): React.ReactNode {
  const l = name.toLowerCase();
  if (l.includes('inventory')) return <Package width={size} height={size} />;
  if (l.includes('recipe')) return <ChefHat width={size} height={size} />;
  if (l.includes('work order')) return <ClipboardList width={size} height={size} />;
  if (l.includes('kitchen')) return <Monitor width={size} height={size} />;
  if (l.includes('purchase')) return <ShoppingCart width={size} height={size} />;
  if (l.includes('send to factory') || l.includes('factory')) return <Factory width={size} height={size} />;
  if (l.includes('sales order approval') || l.includes('approval')) return <CheckCircle width={size} height={size} />;
  if (l.includes('sales order dispatch') || l.includes('dispatch')) return <Truck width={size} height={size} />;
  if (l.includes('sales order')) return <Receipt width={size} height={size} />;
  if (l.includes('gate') || l.includes('inward')) return <KeyRound width={size} height={size} />;
  if (l.includes('user management') || l.includes('user')) return <Users width={size} height={size} />;
  if (l.includes('account')) return <Calculator width={size} height={size} />;
  if (l.includes('logistics') || l.includes('route')) return <Route width={size} height={size} />;
  if (l.includes('quality')) return <Shield width={size} height={size} />;
  if (l.includes('customer')) return <UserCheck width={size} height={size} />;
  if (l.includes('payment') || l.includes('tracking')) return <CreditCard width={size} height={size} />;
  if (l.includes('crm')) return <HeadphonesIcon width={size} height={size} />;
  return <Package width={size} height={size} />;
}

function Dashboard() {
  const navigate = useNavigate();
  const [username] = useState<string>(() => localStorage.getItem('ERP_USERNAME') || 'User');
  const [userPermissions] = useState<string[]>(() => {
    const stored = localStorage.getItem('ERP_USER_PERMISSIONS');
    return stored ? JSON.parse(stored) : [];
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Ensure dashboard is scrollable
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

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('ERP_USERNAME');
    localStorage.removeItem('ERP_PASSWORD');
    navigate('/login');
  };

  const header = "the Mithai company";

  return (
    <div className="page">
      <main style={{ minHeight: '100vh', padding: '24px', paddingTop: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {/* Desktop: full name, Mobile: TMC */}
          <h1 className="title" style={{ margin: 0, textAlign: 'left' }}>
            <span style={{ display: 'inline' }} className="desktop-title">{header}</span>
            <span style={{ display: 'none' }} className="mobile-title">TMC</span>
          </h1>

          {/* Right controls: Username dropdown + Theme toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            {/* Username pill with dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                className="btn"
                style={{
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1.5px solid var(--border)',
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 40,
                  maxWidth: '160px'
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{username}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    right: '2vw',
                    minWidth: 160,
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow)',
                    padding: 8,
                    zIndex: 20,
                    top: "5vh",
                  }}
                >
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="btn"
                    style={{
                      width: '100%',
                      background: 'var(--fg)',
                      color: 'var(--bg)',
                      border: '1.5px solid var(--fg)',
                      padding: '10px 12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Theme toggle beside username (with sun/moon icons) */}
            <ThemeToggle />
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 22,
            paddingBottom: 24
          }}
        >
          {Object.entries(DASHBOARD_DATA[header])
            .filter(([name]) => userPermissions.length === 0 || userPermissions.includes(name))
            .map(([name, arr]) => {
              const desc = Array.isArray(arr) ? arr[0] : '';
              const isHovered = hovered === name;
              return (
                <div
                  key={name}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    const l = name.toLowerCase();
                    if (l.includes('inventory')) {
                      navigate('/inventory');
                    } else if (l.includes('recipe')) {
                      navigate('/recipe-management');
                    } else if (l === 'my work orders') {
                      navigate('/work-orders');
                    } else if (l.includes('work order')) {
                      navigate('/work-order');
                    } else if (l.includes('kitchen')) {
                      navigate('/kitchen-display');
                    } else if (l.includes('purchase')) {
                      navigate('/purchase-orders');
                    } else if (l.includes('send to factory')) {
                      navigate('/send-to-factory');
                    } else if (l.includes('sales order approval')) {
                      navigate('/sales-order-approval');
                    } else if (l.includes('sales order dispatch')) {
                      navigate('/sales-order-dispatch');
                    } else if (l.includes('sales order')) {
                      navigate('/sales-orders');
                    } else if (l.includes('gate') || l.includes('inward')) {
                      navigate('/gate-pass');
                    } else if (l.includes('user management')) {
                      navigate('/user-management');
                    } else if (l.includes('customer management')) {
                      navigate('/customer-management');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const l = name.toLowerCase();
                      if (l.includes('inventory')) {
                        navigate('/inventory');
                      } else if (l.includes('recipe')) {
                        navigate('/recipe-management');
                      } else if (l === 'my work orders') {
                        navigate('/work-orders');
                      } else if (l.includes('work order')) {
                        navigate('/work-order');
                      } else if (l.includes('kitchen')) {
                        navigate('/kitchen-display');
                      } else if (l.includes('purchase')) {
                        navigate('/purchase-orders');
                      } else if (l.includes('send to factory')) {
                        navigate('/send-to-factory');
                      } else if (l.includes('sales order approval')) {
                        navigate('/sales-order-approval');
                      } else if (l.includes('sales order dispatch')) {
                        navigate('/sales-order-dispatch');
                      } else if (l.includes('sales order')) {
                        navigate('/sales-orders');
                      } else if (l.includes('user management')) {
                        navigate('/user-management');
                      } else if (l.includes('customer management')) {
                        navigate('/customer-management');
                      }
                    }
                  }}
                  style={{
                    background: 'var(--panel)',
                    backgroundImage: 'radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)',
                    border: isHovered ? '1.5px solid var(--fg)' : '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 24,
                    minHeight: 160,
                    boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.20)' : 'var(--shadow)',
                    transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'none',
                    transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      border: isHovered ? '1.5px solid var(--fg)' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isHovered ? 'var(--bg)' : 'var(--fg)',
                      background: isHovered ? 'var(--fg)' : 'transparent',
                      transition: 'all .22s ease'
                    }}
                    aria-hidden
                  >
                    {getIcon(name, 26)}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>{name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{desc}</div>
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
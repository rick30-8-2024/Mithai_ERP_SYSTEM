import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ArrowLeft } from "lucide-react";
import {
  inventoryApi,
  factoryTransfersApi,
  type InventoryItem,
  type InventoryCategory,
  type FactoryLocation,
} from "../lib/api";

type CategoryFilter = "All" | InventoryCategory;
type StatusFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
type FactoryFilter = "All" | string;

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
};

function Modal({ open, title, onClose, children, width = 520 }: ModalProps) {
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
          }}
        >
          <div style={{ fontWeight: 800 }}>{title}</div>
        </div>
        <div style={{ padding: 16, overflowY: "auto", flexGrow: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>
        {label}
      </span>
      {children}
    </label>
  );
}


function StatusBadge({ status }: { status: InventoryItem["status"] }) {
  const styles = useMemo(() => {
    if (status === "Out of Stock") {
      return {
        color: "#ffffff",
        background: "#dc2626",
        border: "1.5px solid #dc2626",
      };
    }
    if (status === "Low Stock") {
      return {
        color: "#854d0e",
        background: "#fef08a",
        border: "1.5px solid #eab308",
      };
    }
    return {
      color: "#166534",
      background: "#bbf7d0",
      border: "1.5px solid #22c55e",
    };
  }, [status]);
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        ...styles,
      }}
    >
      {status}
    </span>
  );
}

function formatQty(q: number, unit: string) {
  if (q === null || q === undefined) return "-";
  const rounded =
    Math.round((Number.isFinite(q) ? q : Number(q)) * 100) / 100;
  return `${rounded} ${unit}`;
}

export default function Inventory() {
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [factory, setFactory] = useState<FactoryFilter>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [factoryLocations, setFactoryLocations] = useState<FactoryLocation[]>([]);
  
  // Get current user from localStorage
  const currentUser = useMemo(() => {
    const username = localStorage.getItem('ERP_USERNAME');
    return username || 'Unknown';
  }, []);

  // Menus and modals
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [typeSelectOpen, setTypeSelectOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [selectedType, setSelectedType] = useState<InventoryCategory>("Raw Material");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    async function fetchFactoryLocations() {
      try {
        const locations = await factoryTransfersApi.listFactories();
        setFactoryLocations(locations.filter(loc => loc.status === 'Active'));
      } catch (e) {
        console.error('Failed to fetch factory locations:', e);
      }
    }
    fetchFactoryLocations();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const sku = menuOpenFor;
      if (!sku) return;
      const r = menuRefs.current[sku];
      if (!r) return;
      if (!r.contains(e.target as Node)) setMenuOpenFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpenFor]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryApi.list({
        query,
        category: category === "All" ? null : category,
        status: status === "All" ? null : status,
        factory: factory === "All" ? null : factory,
        limit: 200,
        offset: 0,
      });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, status, factory]);

  function openEdit(item: InventoryItem) {
    setSelected(item);
    setEditOpen(true);
    setMenuOpenFor(null);
  }

  function openQty(item: InventoryItem) {
    setSelected(item);
    setQtyOpen(true);
    setMenuOpenFor(null);
  }

  return (
    <div className="page" style={{ height: "100vh", overflowY: "auto" }}>
      <style>{`
        /* Fix dropdown options in dark mode */
        [data-theme="dark"] select option {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        
        [data-theme="light"] select option {
          background-color: #ffffff;
          color: #000000;
        }
        
        @media (min-width: 768px) {
          .inventory-filters {
            display: grid !important;
            grid-template-columns: 1fr 150px 150px 150px auto !important;
            gap: 10px !important;
          }
          .inventory-search-wrapper {
            flex: none !important;
            min-width: auto !important;
            width: 87% !important;
            max-width: 87% !important;
          }
          .inventory-filter-select {
            flex: none !important;
            min-width: auto !important;
          }
          .inventory-add-btn {
            flex: none !important;
            min-width: auto !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          padding: "24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "transparent",
                border: "1.5px solid var(--border)",
                borderRadius: 10,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--fg)",
              }}
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft width={20} height={20} />
            </button>
            <div>
              <h1 className="title" style={{ margin: 0, fontSize: 20 }}>
                Inventory Management
              </h1>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 10 }}>
                Track and manage your inventory items
              </div>
            </div>
          </div>
          
          {/* Theme toggle */}
          <label className="switch" aria-label="Toggle light and dark mode" style={{ marginLeft: 16 }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              aria-checked={theme === 'dark'}
            />
            <span className="slider">
              {/* Moon icon (dark) */}
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
                  transition: 'opacity .25s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
              {/* Sun icon (light) */}
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
                  transition: 'opacity .25s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </span>
          </label>
        </section>

        {/* Search and Filters */}
        <section
          className="inventory-filters"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 18,
            alignItems: "center",
          }}
        >
          <div className="inventory-search-wrapper" style={{ flex: "1 1 100%", minWidth: "min(200px, 100%)" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU"
              aria-label="Search by name or SKU"
              style={{
                width: "96%",
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "8px 10px",
                borderRadius: 10,
                fontWeight: 500,
                outline: "none",
              }}
            />
          </div>
          <select
            className="inventory-filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            aria-label="Filter by category"
            style={{
              flex: "1 1 calc(50% - 5px)",
              minWidth: "120px",
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "8px 10px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            <option value="All">All</option>
            <option value="Finished Good">Finished Good</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Packing Material">Packing Material</option>
          </select>
          <select
            className="inventory-filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            style={{
              flex: "1 1 calc(50% - 5px)",
              minWidth: "120px",
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "8px 10px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
          <select
            className="inventory-filter-select"
            value={factory}
            onChange={(e) => setFactory(e.target.value as FactoryFilter)}
            aria-label="Filter by factory"
            style={{
              flex: "1 1 calc(50% - 5px)",
              minWidth: "120px",
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "8px 10px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            <option>All</option>
            {factoryLocations.map((loc) => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
          <button
            className="btn inventory-add-btn"
            type="button"
            onClick={() => setTypeSelectOpen(true)}
            style={{
              background: "var(--fg)",
              color: "var(--bg)",
              border: "1.5px solid var(--fg)",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              flex: "1 1 100%",
              minWidth: "120px",
              whiteSpace: "nowrap",
              marginLeft: "auto",
            }}
          >
            + Add Item
          </button>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Loading inventory...
          </div>
        )}
        {error && (
          <div
            role="alert"
            style={{
              color: "var(--bg)",
              background: "var(--fg)",
              border: "1.5px solid var(--fg)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 18,
            paddingBottom: 24,
          }}
        >
          {items.map((it) => (
            <div
              key={it.sku}
              style={{
                background: "var(--panel)",
                backgroundImage:
                  "radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 18,
                minHeight: 140,
                boxShadow: "var(--shadow)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 6,
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {it.name}
                  </div>
                  <StatusBadge status={it.status} />
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Info label="SKU" value={it.sku} />
                  
                  {it.brand && <Info label="Brand" value={it.brand} />}
                  
                  {it.grade && <Info label="Grade" value={it.grade} />}
                  
                  {it.category === "Raw Material" && it.supplier && (
                    <Info label="Supplier" value={it.supplier} />
                  )}
                  
                  {it.category === "Finished Good" && it.category_type && (
                    <Info label="Category" value={it.category_type} />
                  )}
                  
                  {it.category === "Packing Material" && it.supplier && (
                    <Info label="Supplier" value={it.supplier} />
                  )}
                  
                  <Info
                    label="Current Stock"
                    value={formatQty(it.current_stock, it.unit)}
                  />
                  
                  <Info
                    label="Cost/Unit"
                    value={`₹${it.cost_per_unit.toFixed(2)}/${it.unit}`}
                  />
                  
                  {it.packing_weight && (
                    <Info label="Packing Weight" value={it.packing_weight} />
                  )}
                  
                  {it.category === "Finished Good" && it.packing_qty && (
                    <Info label="Packing Qty" value={it.packing_qty} />
                  )}
                  
                  {it.factory && (
                    <Info label="Factory" value={it.factory} />
                  )}
                  
                  <Info
                    label="Min/Max"
                    value={`${it.min_stock}/${it.max_stock} ${it.unit}`}
                  />
                  
                  <div
                    style={{
                      display: "grid",
                      gap: 2,
                      minWidth: 120,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800 }}>
                      Last Updated
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {it.last_updated ? (
                        <>
                          {new Date(it.last_updated).toLocaleString()}
                          {it.last_updated_by && (
                            <>
                              {' by '}
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 6px',
                                  border: '1px solid var(--border)',
                                  borderRadius: 4,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  background: 'var(--panel)',
                                }}
                              >
                                {it.last_updated_by}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div ref={(n) => { menuRefs.current[it.sku] = n; }}>
                    <button
                      className="btn"
                      title="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenFor((s) => (s === it.sku ? null : it.sku));
                      }}
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                        border: "none",
                        width: 48,
                        height: 48,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        cursor: "pointer",
                      }}
                    >
                      <MoreVertical width={20} height={20} />
                    </button>

                    {menuOpenFor === it.sku && (
                      <div
                        role="menu"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: "70%",
                          bottom: "28%",
                          marginBottom: 8,
                          minWidth: 180,
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          boxShadow: "var(--shadow)",
                          padding: 8,
                          zIndex: 20,
                        }}
                      >
                        <button
                          className="btn"
                          role="menuitem"
                          onClick={() => openEdit(it)}
                          style={menuButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          role="menuitem"
                          onClick={() => openQty(it)}
                          style={menuButtonStyle}
                        >
                          Update Quantity
                        </button>
                        <button
                          className="btn"
                          role="menuitem"
                          onClick={() => {
                            setSelected(it);
                            setDeleteOpen(true);
                            setMenuOpenFor(null);
                          }}
                          style={{
                            ...menuButtonStyle,
                            color: "#dc2626",
                            borderColor: "#dc2626",
                          }}
                        >
                          Delete Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && items.length === 0 && !error && (
          <div
            style={{
              color: "var(--muted)",
              border: "1px dashed var(--border)",
              borderRadius: 12,
              padding: 18,
              textAlign: "center",
            }}
          >
            No items found. Try adjusting your search or add a new item.
          </div>
        )}
      </main>

      {/* Type Selection Modal */}
      <TypeSelectionModal
        open={typeSelectOpen}
        onClose={() => setTypeSelectOpen(false)}
        onSelect={(type) => {
          setSelectedType(type);
          setTypeSelectOpen(false);
          setAddOpen(true);
        }}
      />

      {/* Add Item Modal */}
      <AddOrEditModal
        open={addOpen}
        title="Add Item"
        initial={null}
        itemType={selectedType}
        onClose={() => setAddOpen(false)}
        onSubmit={async (values) => {
          await inventoryApi.create({ ...values, last_updated_by: currentUser });
          setAddOpen(false);
          await refresh();
        }}
        factoryLocations={factoryLocations}
      />

      {/* Edit Item Modal */}
      <AddOrEditModal
        open={editOpen}
        title="Edit Item"
        initial={selected}
        itemType={selected?.category as InventoryCategory || "Raw Material"}
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          const id = selected?.id;
          await inventoryApi.update({ id, ...values, last_updated_by: currentUser });
          setEditOpen(false);
          await refresh();
        }}
        factoryLocations={factoryLocations}
      />

      {/* Update Quantity Modal */}
      <UpdateQtyModal
        open={qtyOpen}
        item={selected}
        onClose={() => setQtyOpen(false)}
        onSubmit={async (qty) => {
          if (!selected) return;
          await inventoryApi.update({
            id: selected.id,
            sku: selected.sku,
            current_stock: qty,
            last_updated_by: currentUser
          });
          setQtyOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        item={selected}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!selected) return;
          try {
            await inventoryApi.delete(selected.sku);
            setDeleteOpen(false);
            await refresh();
          } catch (e: any) {
            alert(e?.message || "Failed to delete item");
          }
        }}
      />
    </div>
  );
}

const menuButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  color: "var(--fg)",
  border: "1.5px solid var(--border)",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 8,
};

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 2,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

type AddOrEditValues = {
  name: string;
  sku: string;
  category: InventoryCategory | string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  cost_per_unit: number;
  brand?: string;
  grade?: string;
  packing_weight?: string;
  supplier?: string;
  category_type?: string;
  packing_qty?: string;
  factory?: string;
};

function TypeSelectionModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: InventoryCategory) => void;
}) {
  return (
    <Modal open={open} title="Select Item Type" onClose={onClose} width={480}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ color: "var(--muted)", marginBottom: 8 }}>
          Choose the type of item you want to add:
        </div>
        <button
          className="btn"
          onClick={() => onSelect("Finished Good")}
          style={{
            background: "var(--panel)",
            color: "var(--fg)",
            border: "1.5px solid var(--border)",
            padding: "16px 20px",
            borderRadius: 10,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>Finished Good</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            Final products ready for sale
          </div>
        </button>
        <button
          className="btn"
          onClick={() => onSelect("Raw Material")}
          style={{
            background: "var(--panel)",
            color: "var(--fg)",
            border: "1.5px solid var(--border)",
            padding: "16px 20px",
            borderRadius: 10,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>Raw Material</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            Ingredients and materials used in production
          </div>
        </button>
        <button
          className="btn"
          onClick={() => onSelect("Packing Material")}
          style={{
            background: "var(--panel)",
            color: "var(--fg)",
            border: "1.5px solid var(--border)",
            padding: "16px 20px",
            borderRadius: 10,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>Packing Material</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            Packaging materials and supplies
          </div>
        </button>
      </div>
    </Modal>
  );
}

function AddOrEditModal({
  open,
  title,
  initial,
  itemType,
  onClose,
  onSubmit,
  factoryLocations,
}: {
  open: boolean;
  title: string;
  initial: InventoryItem | null;
  itemType: InventoryCategory;
  onClose: () => void;
  onSubmit: (values: AddOrEditValues) => Promise<void>;
  factoryLocations: FactoryLocation[];
}) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState<AddOrEditValues>({
    name: initial?.name || "",
    sku: initial?.sku || "",
    category: (initial?.category as InventoryCategory) || itemType,
    unit: initial?.unit || "kg",
    current_stock: initial?.current_stock ?? 0,
    min_stock: initial?.min_stock ?? 0,
    max_stock: initial?.max_stock ?? 0,
    cost_per_unit: initial?.cost_per_unit ?? 0,
    brand: initial?.brand || "",
    grade: initial?.grade || "",
    packing_weight: initial?.packing_weight || "",
    supplier: initial?.supplier || "",
    category_type: initial?.category_type || "",
    packing_qty: initial?.packing_qty || "",
    factory: initial?.factory || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [autoGenerateSku, setAutoGenerateSku] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({
      name: initial?.name || "",
      sku: initial?.sku || "",
      category: (initial?.category as InventoryCategory) || itemType,
      unit: initial?.unit || "kg",
      current_stock: initial?.current_stock ?? 0,
      min_stock: initial?.min_stock ?? 0,
      max_stock: initial?.max_stock ?? 0,
      cost_per_unit: initial?.cost_per_unit ?? 0,
      brand: initial?.brand || "",
      grade: initial?.grade || "",
      packing_weight: initial?.packing_weight || "",
      supplier: initial?.supplier || "",
      category_type: initial?.category_type || "",
      packing_qty: initial?.packing_qty || "",
      factory: initial?.factory || "",
    });
    setErr(null);
    setSubmitting(false);
    setAutoGenerateSku(false);
  }, [open, initial, itemType]);

  useEffect(() => {
    if (!autoGenerateSku) return;
    
    const generateSku = () => {
      const brand = values.brand?.trim() || "";
      const name = values.name?.trim() || "";
      
      if (!brand && !name) return "";
      
      const brandPart = brand
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      
      const namePart = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      
      const combined = brandPart && namePart
        ? `${brandPart}-${namePart}`
        : brandPart || namePart;
      
      return combined;
    };
    
    const generatedSku = generateSku();
    if (generatedSku) {
      setValues((v) => ({ ...v, sku: generatedSku }));
    }
  }, [autoGenerateSku, values.brand, values.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    
    if (!values.name.trim()) return setErr("Name is required");
    if (!values.sku.trim() && !isEdit) return setErr("SKU is required");
    if (!values.unit.trim()) return setErr("Unit is required");
    
    if (values.current_stock < 0) return setErr("Current stock cannot be negative");
    if (values.min_stock < 0) return setErr("Min stock cannot be negative");
    if (values.max_stock < 0) return setErr("Max stock cannot be negative");
    if (values.max_stock < values.min_stock)
      return setErr("Max stock must be greater than or equal to min stock");
    
    if (values.brand && values.brand.length > 100)
      return setErr("Brand name too long (max 100 characters)");
    if (values.grade && values.grade.length > 50)
      return setErr("Grade too long (max 50 characters)");
    
    if ((values.category === "Raw Material" || values.category === "Packing Material") && values.supplier && values.supplier.length > 200)
      return setErr("Supplier name too long (max 200 characters)");
    
    if (values.category === "Finished Good" && values.category_type && values.category_type.length > 100)
      return setErr("Category type too long (max 100 characters)");

    try {
      setSubmitting(true);
      await onSubmit(values);
    } catch (e: any) {
      setErr(e?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <Field label="Item Name">
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder={values.category === "Raw Material" ? "Milk Solids" : "Pedha"}
              style={inputStyle}
              required
            />
          </Field>
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>
                SKU
              </span>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--muted)",
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  checked={autoGenerateSku}
                  onChange={(e) => setAutoGenerateSku(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: "pointer"
                  }}
                />
                Auto-generate SKU
              </label>
            </div>
            <input
              value={values.sku}
              onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
              placeholder={values.category === "Raw Material" ? "MS-001" : "PD-001"}
              style={{
                ...inputStyle,
                background: autoGenerateSku ? "rgba(127,127,127,0.08)" : "transparent"
              }}
              required={!isEdit}
              disabled={autoGenerateSku}
            />
          </label>
          <Field label="Category">
            <select
              value={values.category}
              onChange={(e) =>
                setValues((v) => ({ ...v, category: e.target.value as InventoryCategory }))
              }
              style={inputStyle}
            >
              <option value="Finished Good">Finished Good</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Packing Material">Packing Material</option>
            </select>
          </Field>
          <Field label="Brand">
            <input
              value={values.brand || ""}
              onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
              placeholder={values.category === "Raw Material" ? "Amul" : "Royal Sweets"}
              style={inputStyle}
            />
          </Field>
          <Field label="Grade">
            <input
              value={values.grade || ""}
              onChange={(e) => setValues((v) => ({ ...v, grade: e.target.value }))}
              placeholder="Premium"
              style={inputStyle}
            />
          </Field>
          
          {values.category === "Raw Material" && (
            <Field label="Supplier">
              <input
                value={values.supplier || ""}
                onChange={(e) => setValues((v) => ({ ...v, supplier: e.target.value }))}
                placeholder="Amul Dairy Co-op"
                style={inputStyle}
              />
            </Field>
          )}
          
          {values.category === "Packing Material" && (
            <Field label="Supplier">
              <input
                value={values.supplier || ""}
                onChange={(e) => setValues((v) => ({ ...v, supplier: e.target.value }))}
                placeholder="Packaging Supplier"
                style={inputStyle}
              />
            </Field>
          )}
          
          {values.category === "Finished Good" && (
            <>
              <Field label="Category Type">
                <input
                  value={values.category_type || ""}
                  onChange={(e) => setValues((v) => ({ ...v, category_type: e.target.value }))}
                  placeholder="Traditional Sweet"
                  style={inputStyle}
                />
              </Field>
              <Field label="Packing Qty">
                <input
                  value={values.packing_qty || ""}
                  onChange={(e) => setValues((v) => ({ ...v, packing_qty: e.target.value }))}
                  placeholder="12 pcs/box"
                  style={inputStyle}
                />
              </Field>
            </>
          )}
          
          <Field label="Unit">
            <input
              value={values.unit}
              onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value }))}
              placeholder="kg / L / pcs"
              style={inputStyle}
              required
            />
          </Field>
          <Field label="Cost Per Unit (₹)">
            <input
              type="number"
              inputMode="decimal"
              value={values.cost_per_unit}
              onChange={(e) =>
                setValues((v) => ({ ...v, cost_per_unit: parseFloat(e.target.value || "0") }))
              }
              placeholder="0.00"
              style={inputStyle}
              min={0}
              step="0.01"
            />
          </Field>
          <Field label="Packing Weight">
            <input
              value={values.packing_weight || ""}
              onChange={(e) => setValues((v) => ({ ...v, packing_weight: e.target.value }))}
              placeholder={values.category === "Raw Material" ? "25 kg/bag" : "250 g/box"}
              style={inputStyle}
            />
          </Field>
          <Field label="Current Stock">
            <input
              type="number"
              inputMode="decimal"
              value={values.current_stock}
              onChange={(e) =>
                setValues((v) => ({ ...v, current_stock: parseFloat(e.target.value || "0") }))
              }
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Min Stock">
            <input
              type="number"
              inputMode="decimal"
              value={values.min_stock}
              onChange={(e) =>
                setValues((v) => ({ ...v, min_stock: parseFloat(e.target.value || "0") }))
              }
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Max Stock">
            <input
              type="number"
              inputMode="decimal"
              value={values.max_stock}
              onChange={(e) =>
                setValues((v) => ({ ...v, max_stock: parseFloat(e.target.value || "0") }))
              }
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Factory">
            <select
              value={values.factory || ""}
              onChange={(e) => setValues((v) => ({ ...v, factory: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Not Assigned</option>
              {factoryLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {err && (
          <div
            role="alert"
            style={{
              color: "var(--bg)",
              background: "var(--fg)",
              border: "1.5px solid var(--fg)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="btn"
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            className="btn"
            type="submit"
            disabled={submitting}
            style={{
              background: "var(--fg)",
              color: "var(--bg)",
              border: "1.5px solid var(--fg)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UpdateQtyModal({
  open,
  item,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (qty: number) => Promise<void>;
}) {
  const [qty, setQty] = useState<number>(item?.current_stock ?? 0);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQty(item?.current_stock ?? 0);
    setErr(null);
    setSubmitting(false);
  }, [open, item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (qty < 0) return setErr("Quantity cannot be negative");
    try {
      setSubmitting(true);
      await onSubmit(qty);
    } catch (e: any) {
      setErr(e?.message || "Failed to update quantity");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="Update Quantity" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ color: "var(--muted)" }}>
          {item ? (
            <>
              Updating:{" "}
              <span style={{ fontWeight: 800, color: "var(--fg)" }}>
                {item.name}
              </span>{" "}
              ({item.sku})
            </>
          ) : (
            "-"
          )}
        </div>
        <Field label="New Quantity">
          <input
            type="number"
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(parseFloat(e.target.value || "0"))}
            style={inputStyle}
            min={0}
          />
        </Field>

        {err && (
          <div
            role="alert"
            style={{
              color: "var(--bg)",
              background: "var(--fg)",
              border: "1.5px solid var(--fg)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="btn"
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            className="btn"
            type="submit"
            disabled={submitting}
            style={{
              background: "var(--fg)",
              color: "var(--bg)",
              border: "1.5px solid var(--fg)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({
  open,
  item,
  onClose,
  onConfirm,
}: {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} title="Delete Item" onClose={onClose} width={480}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ color: "var(--fg)", lineHeight: 1.6 }}>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: 800 }}>"{item?.name}"</span>{" "}
          ({item?.sku})?
          <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 14 }}>
            This action cannot be undone.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="btn"
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "1.5px solid #dc2626",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting..." : "Delete Item"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: "var(--fg)",
  border: "1.5px solid var(--border)",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 700,
  outline: "none",
  boxSizing: "border-box",
  minWidth: 0,
};
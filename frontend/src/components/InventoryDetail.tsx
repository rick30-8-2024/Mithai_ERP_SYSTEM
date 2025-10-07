import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import {
  inventoryApi,
  type InventoryItem,
  type InventoryCategory,
} from "../lib/api";

/* Shared UI pieces (kept lightweight and consistent with black/white theme) */

function StatusBadge({ status }: { status: InventoryItem["status"] }) {
  const styles = useMemo(() => {
    if (status === "Out of Stock") {
      return {
        color: "var(--bg)",
        background: "var(--fg)",
        border: "1.5px solid var(--fg)",
      };
    }
    if (status === "Low Stock") {
      return {
        color: "var(--fg)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.02))",
        border: "1.5px dashed var(--fg)",
      };
    }
    return {
      color: "var(--fg)",
      background: "transparent",
      border: "1.5px solid var(--border)",
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

function Modal({
  open,
  title,
  onClose,
  children,
  width = 520,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
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
      }}
    >
      <div
        ref={ref}
        style={{
          width,
          maxWidth: "100%",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button
            className="btn"
            onClick={onClose}
            style={btnSecondary}
          >
            Close
          </button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: "var(--fg)",
  color: "var(--bg)",
  border: "1.5px solid var(--fg)",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent",
  color: "var(--fg)",
  border: "1.5px solid var(--border)",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: "var(--fg)",
  border: "1.5px solid var(--border)",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 700,
  outline: "none",
};

/* Update Quantity Modal */

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
          <button className="btn" type="button" onClick={onClose} style={btnSecondary}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Edit Modal */

type EditValues = {
  name: string;
  category: InventoryCategory | string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
};

function EditItemModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial: InventoryItem | null;
  onClose: () => void;
  onSubmit: (values: EditValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EditValues>({
    name: initial?.name || "",
    category: (initial?.category as InventoryCategory) || ("Raw Material" as InventoryCategory),
    unit: initial?.unit || "kg",
    current_stock: initial?.current_stock ?? 0,
    min_stock: initial?.min_stock ?? 0,
    max_stock: initial?.max_stock ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues({
      name: initial?.name || "",
      category: (initial?.category as InventoryCategory) || ("Raw Material" as InventoryCategory),
      unit: initial?.unit || "kg",
      current_stock: initial?.current_stock ?? 0,
      min_stock: initial?.min_stock ?? 0,
      max_stock: initial?.max_stock ?? 0,
    });
    setErr(null);
    setSubmitting(false);
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!values.name.trim()) return setErr("Name is required");
    if (!values.unit.trim()) return setErr("Unit is required");
    if (values.max_stock < values.min_stock) return setErr("Max stock must be ≥ min stock");
    try {
      setSubmitting(true);
      await onSubmit(values);
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="Edit Item" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <Field label="Item Name">
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Chocolate Chips"
              style={inputStyle}
              required
            />
          </Field>
          <Field label="Category">
            <select
              value={values.category}
              onChange={(e) =>
                setValues((v) => ({ ...v, category: e.target.value as InventoryCategory }))
              }
              style={inputStyle}
            >
              <option>Raw Material</option>
              <option>Finished Good</option>
            </select>
          </Field>
          <Field label="Unit">
            <input
              value={values.unit}
              onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value }))}
              placeholder="kg / L / pcs"
              style={inputStyle}
              required
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
          <button className="btn" type="button" onClick={onClose} style={btnSecondary}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Detail Page */

export default function InventoryDetail() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [qtyOpen, setQtyOpen] = useState(false);

  async function refresh() {
    if (!code) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await inventoryApi.get({ sku: code });
      setItem(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="page">
      <main
        style={{
          minHeight: "100vh",
          padding: "24px",
          maxWidth: 900,
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
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              <button
                className="btn"
                onClick={() => navigate("/inventory")}
                style={{ ...btnSecondary, padding: "6px 10px" }}
              >
                ← Inventory
              </button>
            </div>
            <h1 className="title" style={{ margin: 0 }}>
              {item ? item.name : "Item"}
            </h1>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>
              SKU: {code}
            </div>
          </div>

          <div style={{ display: "inline-flex", gap: 8 }}>
            <button
              className="btn"
              onClick={() => setEditOpen(true)}
              style={btnSecondary}
              title="Edit item"
            >
              <Pencil width={16} height={16} />
              &nbsp; Edit
            </button>
            <button
              className="btn"
              onClick={() => setQtyOpen(true)}
              style={btnPrimary}
              title="Update quantity"
            >
              Update Quantity
            </button>
          </div>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Loading...
          </div>
        )}
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
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        )}

        {/* Content */}
        {!loading && item && (
          <div
            style={{
              background: "var(--panel)",
              backgroundImage:
                "radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 18,
              boxShadow: "var(--shadow)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
              <StatusBadge status={item.status} />
            </div>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Info label="SKU" value={item.sku} />
              <Info label="Category" value={item.category} />
              <Info label="Unit" value={item.unit} />
              <Info label="Current Stock" value={`${item.current_stock} ${item.unit}`} />
              <Info label="Min Stock" value={`${item.min_stock} ${item.unit}`} />
              <Info label="Max Stock" value={`${item.max_stock} ${item.unit}`} />
              <Info
                label="Last Updated"
                value={item.last_updated ? new Date(item.last_updated).toLocaleString() : "-"}
              />
            </div>
          </div>
        )}
      </main>

      {/* Edit */}
      <EditItemModal
        open={editOpen}
        initial={item}
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          if (!item) return;
          await inventoryApi.update({ id: item.id, sku: item.sku, ...values });
          setEditOpen(false);
          await refresh();
        }}
      />

      {/* Update Quantity */}
      <UpdateQtyModal
        open={qtyOpen}
        item={item}
        onClose={() => setQtyOpen(false)}
        onSubmit={async (qty) => {
          if (!item) return;
          await inventoryApi.update({ id: item.id, sku: item.sku, current_stock: qty });
          setQtyOpen(false);
          await refresh();
        }}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 2, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import ThemeToggle from './ThemeToggle';
import { workOrdersApi, recipesApi, usersApi, type WorkOrder, type WorkOrderIngredient, type Recipe } from "../lib/api";

type StatusFilter = "All" | "Draft" | "Scheduled" | "In Progress" | "Completed" | "On Hold";

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
};

function Modal({ open, title, onClose, children, width = 900 }: ModalProps) {
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

function StatusBadge({ status }: { status: WorkOrder["status"] }) {
    const styles = useMemo(() => {
        if (status === "Completed") {
            return {
                color: "#166534",
                background: "#bbf7d0",
                border: "1.5px solid #22c55e",
            };
        }
        if (status === "In Progress") {
            return {
                color: "#1e40af",
                background: "#dbeafe",
                border: "1.5px solid #3b82f6",
            };
        }
        if (status === "Scheduled") {
            return {
                color: "#7c3aed",
                background: "#e9d5ff",
                border: "1.5px solid #a855f7",
            };
        }
        if (status === "On Hold") {
            return {
                color: "#854d0e",
                background: "#fef08a",
                border: "1.5px solid #eab308",
            };
        }
        return {
            color: "#4b5563",
            background: "#e5e7eb",
            border: "1.5px solid #9ca3af",
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


export default function WorkOrderPage() {
    const navigate = useNavigate();

    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<StatusFilter>("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ingredientsOpen, setIngredientsOpen] = useState(false);

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const currentUser = useMemo(() => {
        const username = localStorage.getItem('ERP_USERNAME');
        return username || 'Unknown';
    }, []);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<WorkOrder | null>(null);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: workOrders.length,
            inProgress: workOrders.filter(wo => wo.status === "In Progress").length,
            scheduled: workOrders.filter(wo => wo.status === "Scheduled").length,
            completed: workOrders.filter(wo => wo.status === "Completed").length,
        };
    }, [workOrders]);

    // Timer for in-progress orders
    useEffect(() => {
        const interval = setInterval(() => {
            setWorkOrders((prev) =>
                prev.map((order) => {
                    if (order.status === "In Progress" && order.started_at) {
                        const startTime = new Date(order.started_at).getTime();
                        const now = new Date().getTime();
                        const elapsed = Math.floor((now - startTime) / 60000); // minutes
                        return { ...order, elapsed_time: elapsed };
                    }
                    return order;
                })
            );
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    async function refresh() {
        setLoading(true);
        setError(null);
        try {
            const res = await workOrdersApi.list({
                query,
                status: status === "All" ? null : status,
                limit: 200,
                offset: 0,
            });
            setWorkOrders(res.items);
        } catch (e: any) {
            setError(e?.message || "Failed to load work orders");
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
    }, [query, status]);

    function openEdit(workOrder: WorkOrder) {
        setSelected(workOrder);
        setEditOpen(true);
    }

    function openIngredients(workOrder: WorkOrder) {
        setSelected(workOrder);
        setIngredientsOpen(true);
    }

    return (
        <div className="page" style={{ height: "100vh", overflowY: "auto" }}>
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
                    minHeight: "100vh",
                    padding: "24px",
                    maxWidth: 1400,
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
                                Manage Work Orders
                            </h1>
                            <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 10 }}>
                                Create and manage production work orders
                            </div>
                        </div>
                    </div>

                    <ThemeToggle />
                </section>

                {/* Statistics Cards */}
                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 18 }}>
                    <StatCard label="Total Orders" value={stats.total} color="#64748b" />
                    <StatCard label="In Progress" value={stats.inProgress} color="#3b82f6" />
                    <StatCard label="Scheduled" value={stats.scheduled} color="#a855f7" />
                    <StatCard label="Completed" value={stats.completed} color="#22c55e" />
                </section>

                {/* Search and Filters */}
                <section
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 18,
                        alignItems: "center",
                    }}
                >
                    <div style={{ flex: "1 1 300px", minWidth: "200px" }}>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by work order number, recipe, or worker..."
                            aria-label="Search work orders"
                            style={{
                                width: "87%",
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
                        value={status}
                        onChange={(e) => setStatus(e.target.value as StatusFilter)}
                        aria-label="Filter by status"
                        style={{
                            flex: "0 0 auto",
                            minWidth: "140px",
                            background: "transparent",
                            color: "var(--fg)",
                            border: "1.5px solid var(--border)",
                            padding: "8px 10px",
                            borderRadius: 10,
                            fontWeight: 700,
                        }}
                    >
                        <option>All</option>
                        <option>Draft</option>
                        <option>Scheduled</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>On Hold</option>
                    </select>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        style={{
                            background: "var(--fg)",
                            color: "var(--bg)",
                            border: "1.5px solid var(--fg)",
                            padding: "8px 12px",
                            borderRadius: 10,
                            fontWeight: 800,
                            cursor: "pointer",
                            flex: "0 0 auto",
                            minWidth: "140px",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                        }}
                    >
                        <Plus width={16} height={16} />
                        Create Order
                    </button>
                </section>

                {/* States */}
                {loading && (
                    <div style={{ color: "var(--muted)", marginBottom: 12 }}>
                        Loading work orders...
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

                {/* Work Order Cards Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                        gap: 18,
                        paddingBottom: 24,
                    }}
                >
                    {workOrders.map((wo) => (
                        <div
                            key={wo.work_order_number}
                            style={{
                                background: "var(--panel)",
                                backgroundImage:
                                    "radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
                                border: "1px solid var(--border)",
                                borderRadius: 16,
                                overflow: "hidden",
                                boxShadow: "var(--shadow)",
                            }}
                        >
                            {/* Work Order Header */}
                            <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{wo.work_order_number}</div>
                                        <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600 }}>{wo.recipe.name}</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>SKU: {wo.recipe.sku}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelected(wo);
                                            setDeleteOpen(true);
                                        }}
                                        title="Delete work order"
                                        style={{
                                            background: "rgba(220, 38, 38, 0.1)",
                                            color: "#dc2626",
                                            border: "1px solid rgba(220, 38, 38, 0.3)",
                                            width: 32,
                                            height: 32,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Trash2 width={16} height={16} />
                                    </button>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                                    <Info label="Batch Size" value={`${wo.batch_size}x`} />
                                    <Info label="Target Qty" value={`${wo.target_quantity} ${wo.recipe.yield_unit}`} />
                                    <Info label="Est. Cost" value={`₹${wo.estimated_cost.toFixed(2)}`} />
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, marginBottom: 4 }}>Status</div>
                                        <StatusBadge status={wo.status} />
                                    </div>
                                </div>



                                {wo.assigned_worker && (
                                    <Info label="Assigned To" value={wo.assigned_worker} />
                                )}

                                {/* Progress Bar or Status Message */}
                                <div style={{ marginTop: 12, marginBottom: 12 }}>
                                    {(wo.status === "In Progress" || wo.status === "Paused") && wo.expected_time ? (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Progress</span>
                                                <span style={{ fontSize: 11, fontWeight: 800 }}>
                                                    {Math.min(Math.round((wo.elapsed_time / wo.expected_time) * 100), 100)}%
                                                </span>
                                            </div>
                                            <div style={{ width: "100%", height: 8, background: "var(--bg)", borderRadius: 999, overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        width: `${Math.min((wo.elapsed_time / wo.expected_time) * 100, 100)}%`,
                                                        height: "100%",
                                                        background: wo.status === "Paused"
                                                            ? "linear-gradient(90deg, #f97316, #fb923c)"
                                                            : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                                                        transition: "width 0.3s ease",
                                                    }}
                                                />
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                                                <span>{formatTime(wo.elapsed_time)} / {formatTime(wo.expected_time)}</span>
                                                {wo.status === "Paused" && <span style={{ color: "#f97316", fontWeight: 700 }}>⏸ Paused</span>}
                                            </div>
                                        </>
                                    ) : wo.status === "Completed" ? (
                                        <div style={{
                                            background: "rgba(34, 197, 94, 0.1)",
                                            border: "1px solid rgba(34, 197, 94, 0.3)",
                                            borderRadius: 8,
                                            padding: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
                                                Completed in {formatTime(wo.elapsed_time)}
                                            </span>
                                        </div>
                                    ) : wo.status === "Scheduled" || wo.status === "Draft" ? (
                                        <div style={{
                                            background: "rgba(168, 85, 247, 0.1)",
                                            border: "1px solid rgba(168, 85, 247, 0.3)",
                                            borderRadius: 8,
                                            padding: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#a855f7" }}>
                                                {wo.status === "Draft" ? "Not started yet" : `Scheduled${wo.expected_time ? ` • Est. ${formatTime(wo.expected_time)}` : ""}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: "rgba(234, 179, 8, 0.1)",
                                            border: "1px solid rgba(234, 179, 8, 0.3)",
                                            borderRadius: 8,
                                            padding: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#eab308" }}>
                                                {wo.status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                                    <button
                                        onClick={() => openEdit(wo)}
                                        style={{
                                            width: "100%",
                                            background: "var(--fg)",
                                            color: "var(--bg)",
                                            border: "1.5px solid var(--fg)",
                                            padding: "8px 12px",
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openIngredients(wo)}
                                        style={{
                                            width: "100%",
                                            background: "transparent",
                                            color: "var(--fg)",
                                            border: "1.5px solid var(--border)",
                                            padding: "8px 12px",
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                        }}
                                    >
                                        Ingredients
                                    </button>
                                </div>
                            </div>



                            {/* Footer */}
                            <div style={{ padding: "10px 18px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                                    Created: {wo.created_date ? new Date(wo.created_date).toLocaleString() : "-"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && workOrders.length === 0 && !error && (
                    <div
                        style={{
                            color: "var(--muted)",
                            border: "1px dashed var(--border)",
                            borderRadius: 12,
                            padding: 18,
                            textAlign: "center",
                        }}
                    >
                        No work orders found. Try adjusting your search or create a new order.
                    </div>
                )}
            </main>

            {/* Create Work Order Modal */}
            <CreateWorkOrderModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={async () => {
                    setCreateOpen(false);
                    await refresh();
                }}
                currentUser={currentUser}
            />

            {/* Edit Work Order Modal */}
            <EditWorkOrderModal
                open={editOpen}
                workOrder={selected}
                onClose={() => setEditOpen(false)}
                onSubmit={async () => {
                    setEditOpen(false);
                    await refresh();
                }}
                currentUser={currentUser}
            />

            {/* Ingredients Modal */}
            <IngredientsModal
                open={ingredientsOpen}
                workOrder={selected}
                onClose={() => setIngredientsOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                open={deleteOpen}
                workOrder={selected}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                    if (!selected) return;
                    try {
                        await workOrdersApi.delete(selected.work_order_number);
                        setDeleteOpen(false);
                        await refresh();
                    } catch (e: any) {
                        alert(e?.message || "Failed to delete work order");
                    }
                }}
            />
        </div>
    );
}



function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div
            style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{label}</div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800 }}>
                {label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
        </div>
    );
}

type InsufficientItem = {
    ingredient_name: string;
    required_quantity: number;
    available_quantity: number;
    unit: string;
    status: "insufficient" | "not_found";
};

function InsufficientStockModal({
    open,
    onClose,
    insufficientItems,
}: {
    open: boolean;
    onClose: () => void;
    insufficientItems: InsufficientItem[];
}) {
    return (
        <Modal open={open} title="⚠️ Insufficient Inventory" onClose={onClose} width={700}>
            <div style={{ display: "grid", gap: 16 }}>
                <div style={{ color: "var(--fg)", fontSize: 14 }}>
                    The following ingredients are not available in sufficient quantities to create this work order:
                </div>

                <div style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    overflow: "hidden"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 800 }}>Ingredient</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800 }}>Required</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800 }}>Available</th>
                                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insufficientItems.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "12px 16px" }}>{item.ingredient_name}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                        {item.required_quantity} {item.unit}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                        {item.available_quantity} {item.unit}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: item.status === "not_found" ? "var(--fg)" : "rgba(255, 165, 0, 0.2)",
                                            color: item.status === "not_found" ? "var(--bg)" : "orange",
                                        }}>
                                            {item.status === "not_found" ? "Not Found" : "Low Stock"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    padding: "12px 16px",
                    background: "rgba(255, 165, 0, 0.1)",
                    border: "1px solid rgba(255, 165, 0, 0.3)",
                    borderRadius: 10,
                    fontSize: 14,
                }}>
                    <strong>Note:</strong> Please update inventory levels or adjust the batch size before creating this work order.
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: "var(--fg)",
                            color: "var(--bg)",
                            border: "1.5px solid var(--fg)",
                            padding: "10px 16px",
                            borderRadius: 10,
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// Create Work Order Modal Component
function CreateWorkOrderModal({
    open,
    onClose,
    onSubmit,
    currentUser,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    currentUser: string;
}) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [users, setUsers] = useState<Array<{ id: string; username: string; role: string }>>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [batchSize, setBatchSize] = useState(1);
    const [workOrderNumber, setWorkOrderNumber] = useState("");
    const [status, setStatus] = useState<"Draft" | "Scheduled">("Draft");
    const [scheduledDate, setScheduledDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignedWorker, setAssignedWorker] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [insufficientItems, setInsufficientItems] = useState<InsufficientItem[]>([]);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    useEffect(() => {
        if (!open) return;
        // Load recipes
        recipesApi.list({ limit: 100 }).then(res => {
            setRecipes(res.items);
        });
        // Load users for worker assignment
        usersApi.list().then(res => {
            setUsers(res.users);
        });
        // Generate work order number
        const now = new Date();
        const num = `WO-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        setWorkOrderNumber(num);
        setSelectedRecipe(null);
        setBatchSize(1);
        setStatus("Draft");
        setScheduledDate("");
        setDueDate("");
        setAssignedWorker("");
        setNotes("");
        setError(null);
    }, [open]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!selectedRecipe) return setError("Please select a recipe");
        if (!workOrderNumber.trim()) return setError("Work order number is required");
        if (!assignedWorker.trim()) return setError("Please assign a worker");

        try {
            setSubmitting(true);

            const ingredients: WorkOrderIngredient[] = selectedRecipe.ingredients.map(ing => ({
                ingredient_name: ing.ingredient_name,
                required_quantity: ing.quantity * batchSize,
                actual_quantity: ing.quantity * batchSize,
                unit: ing.unit,
                grade: ing.grade,
                cost: ing.cost * batchSize,
            }));

            const estimatedCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
            const expectedTime = selectedRecipe.preparation_time + selectedRecipe.cooking_time;

            await workOrdersApi.create({
                work_order_number: workOrderNumber,
                recipe_id: selectedRecipe.id,
                batch_size: batchSize,
                target_quantity: selectedRecipe.total_yield * batchSize,
                actual_quantity: 0,
                status,
                scheduled_date: scheduledDate || undefined,
                due_date: dueDate || undefined,
                assigned_worker: assignedWorker || undefined,
                estimated_cost: estimatedCost,
                notes: notes || undefined,
                ingredients,
                expected_time: expectedTime,
                last_updated_by: currentUser,
            });

            await onSubmit();
        } catch (e: any) {
            let detail = e?.detail;

            if (detail && typeof detail === 'object' && detail.insufficient_items) {
                if (Array.isArray(detail.insufficient_items) && detail.insufficient_items.length > 0) {
                    setInsufficientItems(detail.insufficient_items);
                    setShowInsufficientModal(true);
                    setError(null);
                    return;
                }
            }

            const errorMessage = e?.message || "";
            if (typeof errorMessage === 'string') {
                try {
                    const dictMatch = errorMessage.match(/\{[\s\S]*\}/);
                    if (dictMatch) {
                        const pythonDict = dictMatch[0]
                            .replace(/'/g, '"')
                            .replace(/True/g, 'true')
                            .replace(/False/g, 'false')
                            .replace(/None/g, 'null');

                        const parsed = JSON.parse(pythonDict);
                        if (parsed.insufficient_items && Array.isArray(parsed.insufficient_items) && parsed.insufficient_items.length > 0) {
                            setInsufficientItems(parsed.insufficient_items);
                            setShowInsufficientModal(true);
                            setError(null);
                            return;
                        }
                    }
                } catch (parseError) {
                }
            }

            if (typeof detail === 'string') {
                try {
                    const dictMatch = detail.match(/\{[\s\S]*\}/);
                    if (dictMatch) {
                        const pythonDict = dictMatch[0]
                            .replace(/'/g, '"')
                            .replace(/True/g, 'true')
                            .replace(/False/g, 'false')
                            .replace(/None/g, 'null');

                        const parsed = JSON.parse(pythonDict);
                        if (parsed.insufficient_items && Array.isArray(parsed.insufficient_items) && parsed.insufficient_items.length > 0) {
                            setInsufficientItems(parsed.insufficient_items);
                            setShowInsufficientModal(true);
                            setError(null);
                            return;
                        }
                    }
                } catch (parseError) {
                }
            }

            setError(detail?.message || errorMessage || "Failed to create work order");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal open={open} title="Create Work Order" onClose={onClose} width={900}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                {!selectedRecipe ? (
                    <div>
                        <h3 style={{ margin: "0 0 12px 0", fontWeight: 800 }}>Select a Recipe</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                            {recipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    onClick={() => setSelectedRecipe(recipe)}
                                    style={{
                                        background: "var(--panel)",
                                        border: "1.5px solid var(--border)",
                                        borderRadius: 12,
                                        padding: 16,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--fg)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div style={{ fontWeight: 800, marginBottom: 4 }}>{recipe.name}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>SKU: {recipe.sku}</div>
                                    <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                                        <span>Yield: {recipe.total_yield} {recipe.yield_unit}</span>
                                        <span>₹{recipe.total_cost.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--bg)", borderRadius: 10 }}>
                            <div>
                                <div style={{ fontWeight: 800 }}>Selected Recipe: {selectedRecipe.name}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>SKU: {selectedRecipe.sku}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRecipe(null)}
                                style={{
                                    background: "transparent",
                                    border: "1.5px solid var(--border)",
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    color: "var(--fg)",
                                }}
                            >
                                Change Recipe
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                            <Field label="Work Order Number">
                                <input
                                    value={workOrderNumber}
                                    onChange={(e) => setWorkOrderNumber(e.target.value)}
                                    style={inputStyle}
                                    required
                                />
                            </Field>
                            <Field label="Batch Size">
                                <input
                                    type="number"
                                    value={batchSize}
                                    onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={inputStyle}
                                    min={1}
                                />
                            </Field>
                            <Field label="Target Quantity">
                                <div style={{ ...inputStyle, background: "rgba(127,127,127,0.08)" }}>
                                    {selectedRecipe.total_yield * batchSize} {selectedRecipe.yield_unit}
                                </div>
                            </Field>
                            <Field label="Estimated Cost">
                                <div style={{ ...inputStyle, background: "rgba(127,127,127,0.08)" }}>
                                    ₹{(selectedRecipe.total_cost * batchSize).toFixed(2)}
                                </div>
                            </Field>
                            <Field label="Status">
                                <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={inputStyle}>
                                    <option>Draft</option>
                                    <option>Scheduled</option>
                                </select>
                            </Field>
                            <Field label="Scheduled Date">
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Due Date">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Assigned Worker">
                                <select
                                    value={assignedWorker}
                                    onChange={(e) => setAssignedWorker(e.target.value)}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="">Select a worker *</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.username}>
                                            {user.username} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Notes">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes"
                                style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
                            />
                        </Field>
                    </>
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
                        }}
                    >
                        {error}
                    </div>
                )}

                {selectedRecipe && (
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
                            {submitting ? "Creating..." : "Create Work Order"}
                        </button>
                    </div>
                )}
            </form>
            <InsufficientStockModal
                open={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                insufficientItems={insufficientItems}
            />
        </Modal>
    );
}

// Ingredients Modal Component
function IngredientsModal({
    open,
    workOrder,
    onClose,
}: {
    open: boolean;
    workOrder: WorkOrder | null;
    onClose: () => void;
}) {
    if (!workOrder) return null;

    return (
        <Modal open={open} title={`Ingredients - ${workOrder.work_order_number}`} onClose={onClose} width={700}>
            <div style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{workOrder.recipe.name}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>SKU: {workOrder.recipe.sku}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
                        Batch Size: {workOrder.batch_size}x • Target: {workOrder.target_quantity} {workOrder.recipe.yield_unit}
                    </div>
                </div>

                {workOrder.scheduled_date && (
                    <Info label="Scheduled Date" value={new Date(workOrder.scheduled_date).toLocaleDateString()} />
                )}
                {workOrder.due_date && (
                    <Info label="Due Date" value={new Date(workOrder.due_date).toLocaleDateString()} />
                )}
                {workOrder.notes && (
                    <div>
                        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 800, marginBottom: 6 }}>Notes</div>
                        <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                            {workOrder.notes}
                        </div>
                    </div>
                )}

                <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 12, fontSize: 15 }}>Required Ingredients</h4>
                    <div style={{ display: "grid", gap: 10 }}>
                        {workOrder.ingredients.map((ingredient, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 12,
                                    background: "var(--bg)",
                                    borderRadius: 10,
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{ingredient.ingredient_name}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                                        Required: {ingredient.required_quantity} {ingredient.unit}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                                    ₹{ingredient.cost.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>Total Estimated Cost</span>
                        <span style={{ fontWeight: 900, fontSize: 16 }}>₹{workOrder.estimated_cost.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// Edit Work Order Modal Component
function EditWorkOrderModal({
    open,
    workOrder,
    onClose,
    onSubmit,
    currentUser,
}: {
    open: boolean;
    workOrder: WorkOrder | null;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    currentUser: string;
}) {
    const [users, setUsers] = useState<Array<{ id: string; username: string; role: string }>>([]);
    const [batchSize, setBatchSize] = useState(1);
    const [actualQuantity, setActualQuantity] = useState(0);
    const [status, setStatus] = useState<WorkOrder["status"]>("Draft");
    const [scheduledDate, setScheduledDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignedWorker, setAssignedWorker] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !workOrder) return;
        // Load users for worker assignment
        usersApi.list().then(res => {
            setUsers(res.users);
        });
        setBatchSize(workOrder.batch_size);
        setActualQuantity(workOrder.actual_quantity);
        setStatus(workOrder.status);
        setScheduledDate(workOrder.scheduled_date || "");
        setDueDate(workOrder.due_date || "");
        setAssignedWorker(workOrder.assigned_worker || "");
        setNotes(workOrder.notes || "");
        setError(null);
    }, [open, workOrder]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!workOrder) return;

        try {
            setSubmitting(true);

            // Calculate new target quantity if batch size changed
            const targetQuantity = workOrder.recipe.total_yield * batchSize;

            await workOrdersApi.update({
                id: workOrder.id,
                batch_size: batchSize,
                target_quantity: targetQuantity,
                actual_quantity: actualQuantity,
                status,
                scheduled_date: scheduledDate || undefined,
                due_date: dueDate || undefined,
                assigned_worker: assignedWorker || undefined,
                notes: notes || undefined,
                last_updated_by: currentUser,
            });
            await onSubmit();
        } catch (e: any) {
            setError(e?.message || "Failed to update work order");
        } finally {
            setSubmitting(false);
        }
    }

    if (!workOrder) return null;

    return (
        <Modal open={open} title="Edit Work Order" onClose={onClose} width={600}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10 }}>
                    <div style={{ fontWeight: 800 }}>{workOrder.work_order_number}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>{workOrder.recipe.name}</div>
                </div>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                    <Field label="Batch Size">
                        <input
                            type="number"
                            value={batchSize}
                            onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                            style={inputStyle}
                            min={1}
                        />
                    </Field>
                    <Field label="Target Quantity">
                        <div style={{ ...inputStyle, background: "rgba(127,127,127,0.08)" }}>
                            {workOrder.recipe.total_yield * batchSize} {workOrder.recipe.yield_unit}
                        </div>
                    </Field>
                    <Field label="Actual Quantity">
                        <input
                            type="number"
                            value={actualQuantity}
                            onChange={(e) => setActualQuantity(parseFloat(e.target.value) || 0)}
                            style={inputStyle}
                            min={0}
                        />
                    </Field>
                    <Field label="Status">
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={inputStyle}>
                            <option>Draft</option>
                            <option>Scheduled</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>On Hold</option>
                        </select>
                    </Field>
                    <Field label="Scheduled Date">
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Due Date">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Assigned Worker">
                        <select
                            value={assignedWorker}
                            onChange={(e) => setAssignedWorker(e.target.value)}
                            style={inputStyle}
                            required
                        >
                            <option value="">Select a worker *</option>
                            {users.map(user => (
                                <option key={user.id} value={user.username}>
                                    {user.username} ({user.role})
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Notes">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
                    />
                </Field>

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
                        }}
                    >
                        {error}
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
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteConfirmModal({
    open,
    workOrder,
    onClose,
    onConfirm,
}: {
    open: boolean;
    workOrder: WorkOrder | null;
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
        <Modal open={open} title="Delete Work Order" onClose={onClose} width={480}>
            <div style={{ display: "grid", gap: 16 }}>
                <div style={{ color: "var(--fg)", lineHeight: 1.6 }}>
                    Are you sure you want to delete work order{" "}
                    <span style={{ fontWeight: 800 }}>"{workOrder?.work_order_number}"</span>?
                    <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 14 }}>
                        This action cannot be undone.
                    </div>
                    <div style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: 8,
                        fontSize: 14
                    }}>
                        ℹ️ The ingredients used in this work order will be restored to inventory.
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
                        {deleting ? "Deleting..." : "Delete Work Order"}
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
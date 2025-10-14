import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Timer } from "lucide-react";
import { workOrdersApi, type WorkOrder } from "../lib/api";

export default function KitchenDisplay() {
  const navigate = useNavigate();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const currentUser = useMemo(() => {
    const username = localStorage.getItem('ERP_USERNAME');
    return username || 'Unknown';
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await workOrdersApi.list({
        limit: 200,
        offset: 0,
      });
      // Show all work orders (including Draft if they have an assigned worker)
      setWorkOrders(res.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load work orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(workOrder: WorkOrder, newStatus: WorkOrder["status"]) {
    try {
      await workOrdersApi.update({
        id: workOrder.id,
        status: newStatus,
        last_updated_by: currentUser,
      });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  }

  const pendingOrders = workOrders.filter(wo =>
    (wo.status === "Scheduled" || wo.status === "Draft") && wo.assigned_worker
  );
  const inProgressOrders = workOrders.filter(wo => wo.status === "In Progress" || wo.status === "Paused");
  const readyOrders = workOrders.filter(wo => wo.status === "Completed");

  return (
    <div className="page">
      <style>{`
        .kitchen-column {
          min-height: calc(100vh - 250px);
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          padding: "24px",
          maxWidth: 1600,
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
                Kitchen Display System
              </h1>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 10 }}>
                Real-time production monitoring
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Current Time Display */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontFamily: "monospace", fontWeight: 900, color: "var(--fg)" }}>
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            <label className="switch" aria-label="Toggle light and dark mode">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                aria-checked={theme === 'dark'}
              />
              <span className="slider">
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
          </div>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Loading kitchen orders...
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

        {/* Kanban Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 18,
            paddingBottom: 24,
          }}
        >
          {/* Pending Column */}
          <div className="kitchen-column">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "12px 16px",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            >
              <Clock width={20} height={20} style={{ color: "#6b7280" }} />
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>
                Pending ({pendingOrders.length})
              </h2>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {pendingOrders.map((wo) => (
                <OrderCard
                  key={wo.id}
                  workOrder={wo}
                  onUpdateStatus={updateStatus}
                  statusColor="gray"
                  nextStatus="In Progress"
                  nextAction="Start Production"
                />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="kitchen-column">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "12px 16px",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            >
              <Timer width={20} height={20} style={{ color: "#3b82f6" }} />
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>
                In Progress ({inProgressOrders.length})
              </h2>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {inProgressOrders.map((wo) => (
                <OrderCard
                  key={wo.id}
                  workOrder={wo}
                  onUpdateStatus={updateStatus}
                  statusColor="blue"
                  nextStatus="Completed"
                  nextAction="Mark Completed"
                />
              ))}
            </div>
          </div>

          {/* Ready Column */}
          <div className="kitchen-column">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "12px 16px",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            >
              <CheckCircle2 width={20} height={20} style={{ color: "#22c55e" }} />
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>
                Ready ({readyOrders.length})
              </h2>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {readyOrders.map((wo) => (
                <OrderCard
                  key={wo.id}
                  workOrder={wo}
                  onUpdateStatus={updateStatus}
                  statusColor="green"
                  nextStatus="Completed"
                  nextAction="Archive Order"
                />
              ))}
            </div>
          </div>
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
            No active orders in kitchen. All orders are either in Draft or Completed status.
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  workOrder,
  onUpdateStatus,
  statusColor,
  nextStatus,
  nextAction,
}: {
  workOrder: WorkOrder;
  onUpdateStatus: (wo: WorkOrder, status: WorkOrder["status"]) => Promise<void>;
  statusColor: string;
  nextStatus: WorkOrder["status"];
  nextAction: string;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleStatusUpdate() {
    setUpdating(true);
    try {
      await onUpdateStatus(workOrder, nextStatus);
    } finally {
      setUpdating(false);
    }
  }

  const borderColors: Record<string, string> = {
    gray: "var(--border)",
    blue: "#3b82f6",
    yellow: "#eab308",
  };

  const bgColors: Record<string, string> = {
    gray: "var(--panel)",
    blue: "rgba(59, 130, 246, 0.05)",
    yellow: "rgba(234, 179, 8, 0.05)",
  };

  return (
    <div
      style={{
        background: bgColors[statusColor] || "var(--panel)",
        border: `1px solid ${borderColors[statusColor] || "var(--border)"}`,
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 15 }}>{workOrder.recipe.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{workOrder.work_order_number}</div>
          </div>
          <PriorityBadge priority={workOrder.priority} />
        </div>

        <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
          <InfoRow label="Quantity" value={`${workOrder.target_quantity} ${workOrder.recipe.yield_unit}`} />
          <InfoRow label="Batch Size" value={`${workOrder.batch_size}x`} />
          {workOrder.assigned_worker && (
            <InfoRow label="Assigned To" value={workOrder.assigned_worker} />
          )}
          {workOrder.scheduled_date && (
            <InfoRow label="Scheduled" value={new Date(workOrder.scheduled_date).toLocaleDateString()} />
          )}
          {workOrder.notes && (
            <div style={{ padding: 8, background: "rgba(0,0,0,0.05)", borderRadius: 8, fontSize: 12, marginTop: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 2, color: "var(--muted)" }}>Note:</div>
              {workOrder.notes}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleStatusUpdate}
        disabled={updating}
        style={{
          width: "100%",
          background: "var(--fg)",
          color: "var(--bg)",
          border: "1.5px solid var(--fg)",
          padding: "10px 12px",
          borderRadius: 10,
          fontWeight: 800,
          cursor: "pointer",
          opacity: updating ? 0.7 : 1,
        }}
      >
        {updating ? "Updating..." : nextAction}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: WorkOrder["priority"] }) {
  const styles = useMemo(() => {
    if (priority === "Urgent") {
      return {
        color: "#ffffff",
        background: "#dc2626",
        border: "1.5px solid #dc2626",
      };
    }
    if (priority === "High") {
      return {
        color: "#9a3412",
        background: "#fed7aa",
        border: "1.5px solid #f97316",
      };
    }
    if (priority === "Medium") {
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
  }, [priority]);
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        ...styles,
      }}
    >
      {priority}
    </span>
  );
}
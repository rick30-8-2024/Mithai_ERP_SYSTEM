import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, ChefHat, Package, AlertCircle, Timer, X } from "lucide-react";
import ThemeToggle from './ThemeToggle';
import { workOrdersApi, recipesApi, type WorkOrder, type Recipe } from "../lib/api";

type StatusFilter = "all" | "scheduled" | "inProgress" | "completed";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
};

function Modal({ open, title, onClose, children, width = 700 }: ModalProps) {
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

export default function WorkOrders() {
  const navigate = useNavigate();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [actualQuantity, setActualQuantity] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [recipeDetails, setRecipeDetails] = useState<Recipe | null>(null);

  const currentUser = useMemo(() => {
    const username = localStorage.getItem("ERP_USERNAME");
    return username || "Unknown";
  }, []);

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
        query: searchTerm,
        assigned_worker: currentUser,
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
  }, [searchTerm, currentUser]);

  const filteredOrders = workOrders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "scheduled" && order.status === "Scheduled") ||
      (filterStatus === "inProgress" && (order.status === "In Progress" || order.status === "Paused")) ||
      (filterStatus === "completed" && order.status === "Completed");

    return matchesStatus;
  });

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStartOrder = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowStartDialog(true);
  };

  const confirmStartOrder = async () => {
    if (!selectedOrder) return;

    try {
      await workOrdersApi.update({
        id: selectedOrder.id,
        status: "In Progress",
        started_at: new Date().toISOString(),
        elapsed_time: 0,
        last_updated_by: currentUser,
      });
      setShowStartDialog(false);
      setSelectedOrder(null);
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to start work order");
    }
  };

  const handlePauseOrder = async (order: WorkOrder) => {
    try {
      await workOrdersApi.update({
        id: order.id,
        status: "Paused",
        paused_at: new Date().toISOString(),
        elapsed_time: order.elapsed_time,
        last_updated_by: currentUser,
      });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to pause work order");
    }
  };

  const handleResumeOrder = async (order: WorkOrder) => {
    try {
      await workOrdersApi.update({
        id: order.id,
        status: "In Progress",
        paused_at: undefined,
        last_updated_by: currentUser,
      });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to resume work order");
    }
  };

  const handleCompleteOrder = (order: WorkOrder) => {
    setSelectedOrder(order);
    setActualQuantity(order.target_quantity.toString());
    setCompletionNotes("");
    setShowCompleteDialog(true);
  };

  const confirmCompleteOrder = async () => {
    if (!selectedOrder || !actualQuantity) return;

    try {
      await workOrdersApi.update({
        id: selectedOrder.id,
        status: "Completed",
        actual_quantity: Number(actualQuantity),
        completed_at: new Date().toISOString(),
        notes: completionNotes || selectedOrder.notes,
        last_updated_by: currentUser,
      });
      setShowCompleteDialog(false);
      setSelectedOrder(null);
      setActualQuantity("");
      setCompletionNotes("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to complete work order");
    }
  };

  const handleViewRecipe = async (order: WorkOrder) => {
    setSelectedOrder(order);
    try {
      const recipe = await recipesApi.get({ id: order.recipe_id });
      setRecipeDetails(recipe);
      setShowRecipeDialog(true);
    } catch (e: any) {
      alert(e?.message || "Failed to load recipe details");
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate statistics
  const myTasksCount = workOrders.filter((o) => o.status === "Scheduled").length;
  const inProgressCount = workOrders.filter((o) => o.status === "In Progress" || o.status === "Paused").length;
  const completedTodayCount = workOrders.filter((o) => {
    if (o.status !== "Completed" || !o.completed_at) return false;
    const completedDate = new Date(o.completed_at).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return completedDate === today;
  }).length;

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
        
        .work-orders-search {
          max-width: 90vw;
        }
        
        @media (max-width: 768px) {
          .work-orders-search {
            max-width: 82vw;
          }
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
              <h1 className="title" style={{ margin: 0, textAlign: "left", fontSize: 20 }}>
                My Orders
              </h1>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 10 }}>
                View and manage your assigned work orders
              </div>
            </div>
          </div>

          <ThemeToggle />
        </section>

        {/* Statistics Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <StatCard
            label="My Tasks"
            value={myTasksCount}
            color="#a855f7"
            icon={<Package />}
            active={filterStatus === "scheduled"}
            onClick={() => setFilterStatus(filterStatus === "scheduled" ? "all" : "scheduled")}
          />
          <StatCard
            label="In Progress"
            value={inProgressCount}
            color="#3b82f6"
            icon={<Timer />}
            active={filterStatus === "inProgress"}
            onClick={() => setFilterStatus(filterStatus === "inProgress" ? "all" : "inProgress")}
          />
          <StatCard
            label="Completed Today"
            value={completedTodayCount}
            color="#22c55e"
            icon={<CheckCircle />}
            active={filterStatus === "completed"}
            onClick={() => setFilterStatus(filterStatus === "completed" ? "all" : "completed")}
          />
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
              className="work-orders-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by work order number or recipe..."
              aria-label="Search work orders"
              style={{
                width: "93%",
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "10px 12px",
                borderRadius: 10,
                fontWeight: 500,
                outline: "none",
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            style={{
              flex: "0 0 auto",
              minWidth: "140px",
              background: "transparent",
              color: "var(--fg)",
              border: "1.5px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>Loading work orders...</div>
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

        {/* Work Orders List */}
        <div style={{ display: "grid", gap: 18, paddingBottom: 24 }}>
          {filteredOrders.length === 0 ? (
            <div
              style={{
                color: "var(--muted)",
                border: "1px dashed var(--border)",
                borderRadius: 12,
                padding: 18,
                textAlign: "center",
              }}
            >
              No work orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const progressPercentage =
                order.expected_time && order.elapsed_time
                  ? Math.min((order.elapsed_time / order.expected_time) * 100, 100)
                  : order.target_quantity > 0
                    ? (order.actual_quantity / order.target_quantity) * 100
                    : 0;

              return (
                <div
                  key={order.id}
                  style={{
                    background: "var(--panel)",
                    backgroundImage:
                      "radial-gradient(900px 160px at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "var(--shadow)",
                    padding: 18,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <h3 style={{ fontWeight: 900, fontSize: 16, margin: 0 }}>{order.work_order_number}</h3>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            ...getStatusStyles(order.status),
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--fg)", marginBottom: 4 }}>
                        <ChefHat width={16} height={16} style={{ color: "var(--muted)" }} />
                        <span style={{ fontWeight: 600 }}>{order.recipe.name}</span>
                        <span style={{ color: "var(--muted)" }}>•</span>
                        <span style={{ fontSize: 14, color: "var(--muted)" }}>{order.batch_size}x batches</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
                    <InfoBox label="Target Quantity" value={`${order.target_quantity} ${order.recipe.yield_unit}`} />
                    <InfoBox label="Actual Quantity" value={`${order.actual_quantity} ${order.recipe.yield_unit}`} />
                    <InfoBox label="Due Date" value={order.due_date ? new Date(order.due_date).toLocaleDateString() : "-"} icon={<Clock width={14} height={14} />} />
                    <InfoBox
                      label="Time"
                      value={
                        order.status === "In Progress" || order.status === "Paused"
                          ? formatTime(order.elapsed_time)
                          : order.status === "Completed"
                            ? formatTime(order.elapsed_time)
                            : order.expected_time
                              ? `~${formatTime(order.expected_time)}`
                              : "-"
                      }
                      icon={<Timer width={14} height={14} />}
                    />
                  </div>

                  {/* Progress Bar */}
                  {(order.status === "In Progress" || order.status === "Paused") && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Progress</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "var(--bg)", borderRadius: 999, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${progressPercentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(order.status === "Scheduled" || order.status === "Draft") && (
                      <button
                        onClick={() => handleStartOrder(order)}
                        style={{
                          background: "#22c55e",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Play width={16} height={16} />
                        Start
                      </button>
                    )}
                    {order.status === "In Progress" && (
                      <>
                        <button
                          onClick={() => handlePauseOrder(order)}
                          style={{
                            background: "#f97316",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Pause width={16} height={16} />
                          Pause
                        </button>
                        <button
                          onClick={() => handleCompleteOrder(order)}
                          style={{
                            background: "#3b82f6",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CheckCircle width={16} height={16} />
                          Complete
                        </button>
                      </>
                    )}
                    {order.status === "Paused" && (
                      <>
                        <button
                          onClick={() => handleResumeOrder(order)}
                          style={{
                            background: "#22c55e",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Play width={16} height={16} />
                          Resume
                        </button>
                        <button
                          onClick={() => handleCompleteOrder(order)}
                          style={{
                            background: "#3b82f6",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CheckCircle width={16} height={16} />
                          Complete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewRecipe(order)}
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                        border: "1.5px solid var(--border)",
                        padding: "8px 16px",
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ChefHat width={16} height={16} />
                      View Recipe
                    </button>
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                        border: "1.5px solid var(--border)",
                        padding: "8px 16px",
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginLeft: "auto",
                      }}
                    >
                      {isExpanded ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      {/* Ingredients */}
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                          Ingredients Required (per batch):
                        </h4>
                        <div style={{ display: "grid", gap: 8 }}>
                          {order.ingredients.map((ing, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 12,
                                background: "var(--bg)",
                                borderRadius: 10,
                                fontSize: 13,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{ing.ingredient_name}</span>
                              <span style={{ fontWeight: 700 }}>
                                {(ing.required_quantity * order.batch_size).toFixed(2)} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div>
                          <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Notes:</h4>
                          <div
                            style={{
                              background: "rgba(234, 179, 8, 0.1)",
                              border: "1px solid rgba(234, 179, 8, 0.3)",
                              borderRadius: 10,
                              padding: 12,
                              fontSize: 13,
                            }}
                          >
                            <AlertCircle width={16} height={16} style={{ display: "inline", marginRight: 8, color: "#eab308" }} />
                            {order.notes}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      {(order.started_at || order.completed_at) && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Timeline:</h4>
                          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
                              <Clock width={14} height={14} />
                              <span>Scheduled: {order.scheduled_date ? new Date(order.scheduled_date).toLocaleString() : "-"}</span>
                            </div>
                            {order.started_at && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3b82f6" }}>
                                <Play width={14} height={14} />
                                <span>Started: {new Date(order.started_at).toLocaleString()}</span>
                              </div>
                            )}
                            {order.paused_at && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f97316" }}>
                                <Pause width={14} height={14} />
                                <span>Paused: {new Date(order.paused_at).toLocaleString()}</span>
                              </div>
                            )}
                            {order.completed_at && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e" }}>
                                <CheckCircle width={14} height={14} />
                                <span>Completed: {new Date(order.completed_at).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Start Order Dialog */}
      <Modal open={showStartDialog} title="Start Work Order" onClose={() => setShowStartDialog(false)} width={600}>
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--fg)" }}>
            Are you ready to start work on <strong>{selectedOrder?.work_order_number}</strong>?
          </p>
          {selectedOrder && (
            <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10 }}>
              <InfoRow label="Recipe" value={selectedOrder.recipe.name} />
              <InfoRow label="Target Quantity" value={`${selectedOrder.target_quantity} ${selectedOrder.recipe.yield_unit}`} />
              <InfoRow
                label="Estimated Time"
                value={selectedOrder.expected_time ? `${formatTime(selectedOrder.expected_time)}` : "-"}
              />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={() => setShowStartDialog(false)}
              style={{
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmStartOrder}
              style={{
                background: "#22c55e",
                color: "#ffffff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Play width={16} height={16} />
              Start Work Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Order Dialog */}
      <Modal open={showCompleteDialog} title="Complete Work Order" onClose={() => setShowCompleteDialog(false)} width={600}>
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--fg)" }}>
            Enter the actual quantity produced for <strong>{selectedOrder?.work_order_number}</strong>
          </p>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Actual Quantity Produced <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(e.target.value)}
                placeholder="Enter quantity"
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "var(--fg)",
                  border: "1.5px solid var(--border)",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontWeight: 600,
                  outline: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  background: "var(--bg)",
                  borderRadius: 10,
                  color: "var(--muted)",
                  fontWeight: 600,
                }}
              >
                {selectedOrder?.recipe.yield_unit}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Target was {selectedOrder?.target_quantity} {selectedOrder?.recipe.yield_unit}
            </p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Completion Notes (Optional)
            </label>
            <input
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Any notes about this batch..."
              style={{
                width: "100%",
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "10px 12px",
                borderRadius: 10,
                fontWeight: 600,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={() => setShowCompleteDialog(false)}
              style={{
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmCompleteOrder}
              disabled={!actualQuantity || Number(actualQuantity) <= 0}
              style={{
                background: "#3b82f6",
                color: "#ffffff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: !actualQuantity || Number(actualQuantity) <= 0 ? 0.5 : 1,
              }}
            >
              <CheckCircle width={16} height={16} />
              Mark as Complete
            </button>
          </div>
        </div>
      </Modal>

      {/* Recipe Details Dialog */}
      <Modal open={showRecipeDialog} title="Recipe Details" onClose={() => setShowRecipeDialog(false)} width={800}>
        {recipeDetails && selectedOrder && (
          <div style={{ display: "grid", gap: 16 }}>
            {/* Recipe Header */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{recipeDetails.name}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge text={`Yield: ${recipeDetails.total_yield} ${recipeDetails.yield_unit}`} color="#22c55e" />
              </div>
            </div>

            {/* Times */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div
                style={{
                  background: "rgba(249, 115, 22, 0.1)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, marginBottom: 4 }}>Preparation Time</div>
                <div style={{ fontWeight: 800, color: "#f97316" }}>{recipeDetails.preparation_time} min</div>
              </div>
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, marginBottom: 4 }}>Cooking Time</div>
                <div style={{ fontWeight: 800, color: "#dc2626" }}>{recipeDetails.cooking_time} min</div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Ingredients (for {selectedOrder.batch_size}x batches):</h4>
              <div style={{ display: "grid", gap: 8 }}>
                {recipeDetails.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700 }}>{ing.ingredient_name}</span>
                      <span style={{ fontWeight: 800 }}>
                        {(ing.quantity * selectedOrder.batch_size).toFixed(2)} {ing.unit}
                      </span>
                    </div>
                    {ing.grade && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        <span>Grade: {ing.grade}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {recipeDetails.instructions && recipeDetails.instructions.length > 0 && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Instructions:</h4>
                <ol style={{ display: "grid", gap: 12, paddingLeft: 0, listStyle: "none" }}>
                  {recipeDetails.instructions.map((instruction, index) => (
                    <li key={index} style={{ display: "flex", gap: 12 }}>
                      <span
                        style={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          background: "#3b82f6",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ paddingTop: 2 }}>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--panel)",
        border: active ? `2px solid ${color}` : "1px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{label}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: `${color}20`, color }}>{icon}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
        {icon}
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {text}
    </span>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Completed":
      return { color: "#166534", background: "#bbf7d0", border: "1.5px solid #22c55e" };
    case "In Progress":
      return { color: "#1e40af", background: "#dbeafe", border: "1.5px solid #3b82f6" };
    case "Paused":
      return { color: "#9a3412", background: "#fed7aa", border: "1.5px solid #f97316" };
    case "Scheduled":
      return { color: "#7c3aed", background: "#e9d5ff", border: "1.5px solid #a855f7" };
    case "On Hold":
      return { color: "#854d0e", background: "#fef08a", border: "1.5px solid #eab308" };
    default:
      return { color: "#4b5563", background: "#e5e7eb", border: "1.5px solid #9ca3af" };
  }
}

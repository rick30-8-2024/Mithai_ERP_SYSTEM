import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import { recipesApi, type Recipe, type RecipeIngredient } from "../lib/api";

type StatusFilter = "All" | "Active" | "Draft" | "Archived";
type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

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

function StatusBadge({ status }: { status: Recipe["status"] }) {
  const styles = useMemo(() => {
    if (status === "Active") {
      return {
        color: "#166534",
        background: "#bbf7d0",
        border: "1.5px solid #22c55e",
      };
    }
    if (status === "Draft") {
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

function DifficultyBadge({ difficulty }: { difficulty: Recipe["difficulty"] }) {
  const styles = useMemo(() => {
    if (difficulty === "Easy") {
      return {
        color: "#166534",
        background: "#bbf7d0",
        border: "1.5px solid #22c55e",
      };
    }
    if (difficulty === "Medium") {
      return {
        color: "#854d0e",
        background: "#fef08a",
        border: "1.5px solid #eab308",
      };
    }
    return {
      color: "#ffffff",
      background: "#dc2626",
      border: "1.5px solid #dc2626",
    };
  }, [difficulty]);
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
      {difficulty}
    </span>
  );
}

export default function RecipeManagement() {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  
  const currentUser = useMemo(() => {
    const username = localStorage.getItem('ERP_USERNAME');
    return username || 'Unknown';
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: recipes.length,
      active: recipes.filter(r => r.status === "Active").length,
      draft: recipes.filter(r => r.status === "Draft").length,
      archived: recipes.filter(r => r.status === "Archived").length,
    };
  }, [recipes]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await recipesApi.list({
        query,
        status: status === "All" ? null : status,
        difficulty: difficulty === "All" ? null : difficulty,
        limit: 200,
        offset: 0,
      });
      setRecipes(res.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load recipes");
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
  }, [query, status, difficulty]);

  function openEdit(recipe: Recipe) {
    setSelected(recipe);
    setEditOpen(true);
  }

  function openIngredients(recipe: Recipe) {
    setSelected(recipe);
    setIngredientsOpen(true);
  }

  return (
    <div className="page">
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
                Recipe Management
              </h1>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 10 }}>
                Create and manage product recipes with ingredients
              </div>
            </div>
          </div>
          
          <label className="switch" aria-label="Toggle light and dark mode" style={{ marginLeft: 16 }}>
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
        </section>

        {/* Statistics Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 18 }}>
          <StatCard label="Total Recipes" value={stats.total} color="#64748b" />
          <StatCard label="Active" value={stats.active} color="#22c55e" />
          <StatCard label="Draft" value={stats.draft} color="#eab308" />
          <StatCard label="Archived" value={stats.archived} color="#9ca3af" />
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
              placeholder="Search by name, SKU, category, or brand..."
              aria-label="Search recipes"
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
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
            aria-label="Filter by difficulty"
            style={{
              flex: "0 0 auto",
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
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <button
            className="btn"
            type="button"
            onClick={() => setAddOpen(true)}
            style={{
              background: "var(--fg)",
              color: "var(--bg)",
              border: "1.5px solid var(--fg)",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 800,
              cursor: "pointer",
              flex: "0 0 auto",
              minWidth: "120px",
              whiteSpace: "nowrap",
            }}
          >
            <Plus width={16} height={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Add Recipe
          </button>
        </section>

        {/* States */}
        {loading && (
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Loading recipes...
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

        {/* Recipe Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: 18,
            paddingBottom: 24,
          }}
        >
          {recipes.map((recipe) => (
            <div
              key={recipe.sku}
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
              {/* Recipe Header */}
              <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{recipe.name}</div>
                    <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600 }}>{recipe.category}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>SKU: {recipe.sku}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelected(recipe);
                      setDeleteOpen(true);
                    }}
                    title="Delete recipe"
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
                  <Info label="Yield" value={`${recipe.total_yield} ${recipe.yield_unit}`} />
                  <Info label="Total Time" value={`${recipe.preparation_time + recipe.cooking_time}min`} />
                  <Info label="Total Cost" value={`₹${recipe.total_cost.toFixed(2)}`} />
                  <Info label="Ingredients" value={`${recipe.ingredients.length} items`} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, marginBottom: 4 }}>Status</div>
                    <StatusBadge status={recipe.status} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, marginBottom: 4 }}>Difficulty</div>
                    <DifficultyBadge difficulty={recipe.difficulty} />
                  </div>
                </div>

                {recipe.brand && (
                  <Info label="Brand" value={recipe.brand} />
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => openEdit(recipe)}
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
                    onClick={() => openIngredients(recipe)}
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
                  Last updated: {recipe.last_updated ? new Date(recipe.last_updated).toLocaleString() : "-"}
                  {recipe.last_updated_by && ` by ${recipe.last_updated_by}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!loading && recipes.length === 0 && !error && (
          <div
            style={{
              color: "var(--muted)",
              border: "1px dashed var(--border)",
              borderRadius: 12,
              padding: 18,
              textAlign: "center",
            }}
          >
            No recipes found. Try adjusting your search or add a new recipe.
          </div>
        )}
      </main>

      {/* Ingredients Modal */}
      <IngredientsModal
        open={ingredientsOpen}
        recipe={selected}
        onClose={() => setIngredientsOpen(false)}
      />

      {/* Add Recipe Modal */}
      <AddOrEditModal
        open={addOpen}
        title="Add Recipe"
        initial={null}
        onClose={() => setAddOpen(false)}
        onSubmit={async (values) => {
          await recipesApi.create({ ...values, last_updated_by: currentUser });
          setAddOpen(false);
          await refresh();
        }}
      />

      {/* Edit Recipe Modal */}
      <AddOrEditModal
        open={editOpen}
        title="Edit Recipe"
        initial={selected}
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          const id = selected?.id;
          const sku = selected?.sku;
          const { sku: _omitSku, ...rest } = values as any;
          await recipesApi.update({ id, sku, ...rest, last_updated_by: currentUser });
          setEditOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        recipe={selected}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!selected) return;
          try {
            await recipesApi.delete(selected.sku);
            setDeleteOpen(false);
            await refresh();
          } catch (e: any) {
            alert(e?.message || "Failed to delete recipe");
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

// Ingredients Modal Component
function IngredientsModal({
  open,
  recipe,
  onClose,
}: {
  open: boolean;
  recipe: Recipe | null;
  onClose: () => void;
}) {
  if (!recipe) return null;

  return (
    <Modal open={open} title={`Ingredients - ${recipe.name}`} onClose={onClose} width={700}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{recipe.name}</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>SKU: {recipe.sku} • Category: {recipe.category}</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
            Yield: {recipe.total_yield} {recipe.yield_unit} • Time: {recipe.preparation_time + recipe.cooking_time}min
          </div>
        </div>

        {recipe.brand && (
          <Info label="Brand" value={recipe.brand} />
        )}
        {recipe.grade && (
          <Info label="Grade" value={recipe.grade} />
        )}

        <div>
          <h4 style={{ fontWeight: 800, marginBottom: 12, fontSize: 15 }}>Raw Materials Required</h4>
          <div style={{ display: "grid", gap: 10 }}>
            {recipe.ingredients.map((ingredient, idx) => (
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
                    {ingredient.supplier && ingredient.grade
                      ? `${ingredient.supplier} • ${ingredient.grade}`
                      : ingredient.supplier || ingredient.grade || "No supplier info"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {ingredient.quantity} {ingredient.unit}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>₹{ingredient.cost.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Total Material Cost</span>
            <span style={{ fontWeight: 900, fontSize: 16 }}>₹{recipe.total_cost.toFixed(2)}</span>
          </div>
        </div>

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: 12, fontSize: 15 }}>Instructions</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {recipe.instructions.map((instruction, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    background: "var(--bg)",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontWeight: 800, marginRight: 8 }}>{idx + 1}.</span>
                  {instruction}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

type AddOrEditValues = {
  name: string;
  sku: string;
  category: string;
  total_yield: number;
  yield_unit: string;
  preparation_time: number;
  cooking_time: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Active" | "Draft" | "Archived";
  brand?: string;
  grade?: string;
  packing_weight?: number;
  packing_unit?: string;
  packing_quantity_apx?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
};

function AddOrEditModal({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial: Recipe | null;
  onClose: () => void;
  onSubmit: (values: AddOrEditValues) => Promise<void>;
}) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState<AddOrEditValues>({
    name: initial?.name || "",
    sku: initial?.sku || "",
    category: initial?.category || "Traditional Sweet",
    total_yield: initial?.total_yield ?? 1,
    yield_unit: initial?.yield_unit || "pcs",
    preparation_time: initial?.preparation_time ?? 30,
    cooking_time: initial?.cooking_time ?? 30,
    difficulty: (initial?.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
    status: (initial?.status as "Active" | "Draft" | "Archived") || "Draft",
    brand: initial?.brand || "",
    grade: initial?.grade || "",
    packing_weight: initial?.packing_weight,
    packing_unit: initial?.packing_unit || "",
    packing_quantity_apx: initial?.packing_quantity_apx,
    ingredients: initial?.ingredients || [],
    instructions: initial?.instructions || [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues({
      name: initial?.name || "",
      sku: initial?.sku || "",
      category: initial?.category || "Traditional Sweet",
      total_yield: initial?.total_yield ?? 1,
      yield_unit: initial?.yield_unit || "pcs",
      preparation_time: initial?.preparation_time ?? 30,
      cooking_time: initial?.cooking_time ?? 30,
      difficulty: (initial?.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
      status: (initial?.status as "Active" | "Draft" | "Archived") || "Draft",
      brand: initial?.brand || "",
      grade: initial?.grade || "",
      packing_weight: initial?.packing_weight,
      packing_unit: initial?.packing_unit || "",
      packing_quantity_apx: initial?.packing_quantity_apx,
      ingredients: initial?.ingredients || [],
      instructions: initial?.instructions || [],
    });
    setErr(null);
    setSubmitting(false);
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!values.name.trim()) return setErr("Name is required");
    if (!values.sku.trim() && !isEdit) return setErr("SKU is required");

    try {
      setSubmitting(true);
      await onSubmit(values);
    } catch (e: any) {
      setErr(e?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  const addIngredient = () => {
    setValues((v) => ({
      ...v,
      ingredients: [...v.ingredients, { ingredient_name: "", quantity: 0, unit: "g", cost: 0 }],
    }));
  };

  const removeIngredient = (idx: number) => {
    setValues((v) => ({
      ...v,
      ingredients: v.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const updateIngredient = (idx: number, field: keyof RecipeIngredient, value: any) => {
    setValues((v) => ({
      ...v,
      ingredients: v.ingredients.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const addInstruction = () => {
    setValues((v) => ({
      ...v,
      instructions: [...v.instructions, ""],
    }));
  };

  const removeInstruction = (idx: number) => {
    setValues((v) => ({
      ...v,
      instructions: v.instructions.filter((_, i) => i !== idx),
    }));
  };

  const updateInstruction = (idx: number, value: string) => {
    setValues((v) => ({
      ...v,
      instructions: v.instructions.map((inst, i) => (i === idx ? value : inst)),
    }));
  };

  return (
    <Modal open={open} title={title} onClose={onClose} width={800}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Basic Info */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <Field label="Recipe Name">
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Pedha"
              style={inputStyle}
              required
            />
          </Field>
          <Field label="SKU">
            <input
              value={values.sku}
              onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
              placeholder="PD-001"
              style={{ ...inputStyle, background: isEdit ? "rgba(127,127,127,0.08)" : "transparent" }}
              required={!isEdit}
              disabled={isEdit}
            />
          </Field>
          <Field label="Category">
            <input
              value={values.category}
              onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
              placeholder="Traditional Sweet"
              style={inputStyle}
            />
          </Field>
          <Field label="Brand">
            <input
              value={values.brand || ""}
              onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
              placeholder="Royal Sweets"
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
          <Field label="Total Yield">
            <input
              type="number"
              value={values.total_yield}
              onChange={(e) => setValues((v) => ({ ...v, total_yield: parseFloat(e.target.value || "0") }))}
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Yield Unit">
            <input
              value={values.yield_unit}
              onChange={(e) => setValues((v) => ({ ...v, yield_unit: e.target.value }))}
              placeholder="pcs"
              style={inputStyle}
            />
          </Field>
          <Field label="Prep Time (min)">
            <input
              type="number"
              value={values.preparation_time}
              onChange={(e) => setValues((v) => ({ ...v, preparation_time: parseInt(e.target.value || "0") }))}
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Cook Time (min)">
            <input
              type="number"
              value={values.cooking_time}
              onChange={(e) => setValues((v) => ({ ...v, cooking_time: parseInt(e.target.value || "0") }))}
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Difficulty">
            <select
              value={values.difficulty}
              onChange={(e) => setValues((v) => ({ ...v, difficulty: e.target.value as any }))}
              style={inputStyle}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as any }))}
              style={inputStyle}
            >
              <option>Draft</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
          </Field>
          <Field label="Packing Weight">
            <input
              type="number"
              value={values.packing_weight || ""}
              onChange={(e) => setValues((v) => ({ ...v, packing_weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="250"
              style={inputStyle}
            />
          </Field>
          <Field label="Packing Unit">
            <input
              value={values.packing_unit || ""}
              onChange={(e) => setValues((v) => ({ ...v, packing_unit: e.target.value }))}
              placeholder="g/box"
              style={inputStyle}
            />
          </Field>
          <Field label="Packing Qty Apx">
            <input
              type="number"
              value={values.packing_quantity_apx || ""}
              onChange={(e) => setValues((v) => ({ ...v, packing_quantity_apx: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="12"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Ingredients */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Ingredients</h3>
            <button
              type="button"
              onClick={addIngredient}
              style={{
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus width={14} height={14} /> Add Ingredient
            </button>
          </div>
          {values.ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "end" }}>
              <Field label="Name">
                <input
                  value={ing.ingredient_name}
                  onChange={(e) => updateIngredient(idx, "ingredient_name", e.target.value)}
                  placeholder="Milk Solids"
                  style={inputStyle}
                />
              </Field>
              <Field label="Qty">
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(idx, "quantity", parseFloat(e.target.value || "0"))}
                  style={inputStyle}
                />
              </Field>
              <Field label="Unit">
                <input
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                  placeholder="g"
                  style={inputStyle}
                />
              </Field>
              <Field label="Supplier">
                <input
                  value={ing.supplier || ""}
                  onChange={(e) => updateIngredient(idx, "supplier", e.target.value)}
                  placeholder="Amul"
                  style={inputStyle}
                />
              </Field>
              <Field label="Grade">
                <input
                  value={ing.grade || ""}
                  onChange={(e) => updateIngredient(idx, "grade", e.target.value)}
                  placeholder="Premium"
                  style={inputStyle}
                />
              </Field>
              <Field label="Cost">
                <input
                  type="number"
                  value={ing.cost}
                  onChange={(e) => updateIngredient(idx, "cost", parseFloat(e.target.value || "0"))}
                  style={inputStyle}
                />
              </Field>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Remove ingredient"
              >
                <X width={16} height={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Instructions</h3>
            <button
              type="button"
              onClick={addInstruction}
              style={{
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px solid var(--border)",
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus width={14} height={14} /> Add Step
            </button>
          </div>
          {values.instructions.map((inst, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 800, minWidth: 30 }}>{idx + 1}.</span>
              <input
                value={inst}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                placeholder="Enter instruction step"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeInstruction(idx)}
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Remove instruction"
              >
                <X width={16} height={16} />
              </button>
            </div>
          ))}
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

function DeleteConfirmModal({
  open,
  recipe,
  onClose,
  onConfirm,
}: {
  open: boolean;
  recipe: Recipe | null;
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
    <Modal open={open} title="Delete Recipe" onClose={onClose} width={480}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ color: "var(--fg)", lineHeight: 1.6 }}>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: 800 }}>"{recipe?.name}"</span>{" "}
          ({recipe?.sku})?
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
            {deleting ? "Deleting..." : "Delete Recipe"}
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
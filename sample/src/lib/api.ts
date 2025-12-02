export const BASE_URL = "http://localhost:8080";

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : "{}",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const detail = data && (data.detail || data.message || data.error);
    const error: any = new Error(
      typeof detail === "string" ? detail : (detail?.message || `HTTP ${res.status}`)
    );
    if (typeof detail === "object") {
      error.detail = detail;
    }
    throw error;
  }

  return data as T;
}

export interface RecipeIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
  supplier?: string;
  grade?: string;
  cost: number;
  cost_per_unit?: number;
}

export interface Recipe {
  id: string;
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
  total_cost: number;
  last_updated: string | null;
  last_updated_by?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
}

export interface RecipeListResponse {
  items: Recipe[];
  count: number;
}

export interface RecipeListRequest {
  query?: string;
  category?: string | null;
  status?: string | null;
  difficulty?: string | null;
  limit?: number;
  offset?: number;
}

async function listRecipes(params: RecipeListRequest) {
  return post<RecipeListResponse>("/api/recipes/list", {
    query: params.query ?? "",
    category: params.category ?? null,
    status: params.status ?? "Active",
    difficulty: params.difficulty ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

export const recipesApi = {
  list: listRecipes,
};
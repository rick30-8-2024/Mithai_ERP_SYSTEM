/* Centralized API client for backend communication */

export const BASE_URL =
  (process.env.REACT_APP_BACKEND_URL as string) || "http://localhost:8080";

async function post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : "{}",
    ...init,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // leave as text
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as T;
}

/* Inventory types */

export type InventoryCategory = "Raw Material" | "Finished Good";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory | string;
  unit: string; // 'kg' | 'L' | 'pcs'
  current_stock: number;
  min_stock: number;
  max_stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  last_updated: string | null;
  last_updated_by: string | null;
  // Shared fields
  brand?: string | null;
  grade?: string | null;
  packing_weight?: string | null;
  // Raw Material specific
  supplier?: string | null;
  // Finished Good specific
  category_type?: string | null;
  packing_qty?: string | null;
  // Factory field
  factory?: string | null;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  count: number;
}

export interface ListRequest {
  query?: string;
  category?: string | null;
  status?: string | null;
  factory?: string | null;
  limit?: number;
  offset?: number;
}

export interface GetRequest {
  sku?: string;
  id?: string;
}

export interface CreateRequest {
  name: string;
  sku: string;
  category: InventoryCategory | string;
  unit: string;
  current_stock?: number;
  min_stock?: number;
  max_stock: number;
  last_updated_by?: string;
  // Shared fields
  brand?: string;
  grade?: string;
  packing_weight?: string;
  // Raw Material specific
  supplier?: string;
  // Finished Good specific
  category_type?: string;
  packing_qty?: string;
  // Factory field
  factory?: string;
}

export interface UpdateRequest {
  sku?: string;
  id?: string;
  name?: string;
  category?: InventoryCategory | string;
  unit?: string;
  current_stock?: number;
  min_stock?: number;
  max_stock?: number;
  last_updated_by?: string;
  // Shared fields
  brand?: string;
  grade?: string;
  packing_weight?: string;
  // Raw Material specific
  supplier?: string;
  // Finished Good specific
  category_type?: string;
  packing_qty?: string;
  // Factory field
  factory?: string;
}

/* Inventory API */

async function listInventory(params: ListRequest) {
  return post<InventoryListResponse>("/api/inventory/list", {
    query: params.query ?? "",
    category: params.category ?? null,
    status: params.status ?? null,
    factory: params.factory ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getInventoryItem(params: GetRequest) {
  if (!params.sku && !params.id) {
    throw new Error("Provide either sku or id");
  }
  return post<InventoryItem>("/api/inventory/get", params);
}

async function createInventoryItem(payload: CreateRequest) {
  return post<InventoryItem>("/api/inventory/create", payload);
}

async function updateInventoryItem(payload: UpdateRequest) {
  if (!payload.sku && !payload.id) {
    throw new Error("Provide either sku or id for update");
  }
  return post<InventoryItem>("/api/inventory/update", payload);
}

export interface DeleteRequest {
  sku?: string;
  id?: string;
}

async function deleteInventoryItem(sku: string) {
  return post<{ success: boolean; message: string }>("/api/inventory/delete", { sku });
}

export const inventoryApi = {
  list: listInventory,
  get: getInventoryItem,
  create: createInventoryItem,
  update: updateInventoryItem,
  delete: deleteInventoryItem,
};

/* Recipe types */

export interface RecipeIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
  supplier?: string;
  grade?: string;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  sku: string;
  category: string;
  total_yield: number;
  yield_unit: string;
  preparation_time: number; // in minutes
  cooking_time: number; // in minutes
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

export interface RecipeCreateRequest {
  name: string;
  sku: string;
  category: string;
  total_yield: number;
  yield_unit: string;
  preparation_time: number;
  cooking_time: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status?: "Active" | "Draft" | "Archived";
  brand?: string;
  grade?: string;
  packing_weight?: number;
  packing_unit?: string;
  packing_quantity_apx?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  last_updated_by?: string;
}

export interface RecipeUpdateRequest {
  sku?: string;
  id?: string;
  name?: string;
  category?: string;
  total_yield?: number;
  yield_unit?: string;
  preparation_time?: number;
  cooking_time?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  status?: "Active" | "Draft" | "Archived";
  brand?: string;
  grade?: string;
  packing_weight?: number;
  packing_unit?: string;
  packing_quantity_apx?: number;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  last_updated_by?: string;
}

/* Recipe API */

async function listRecipes(params: RecipeListRequest) {
  return post<RecipeListResponse>("/api/recipes/list", {
    query: params.query ?? "",
    category: params.category ?? null,
    status: params.status ?? null,
    difficulty: params.difficulty ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getRecipe(params: GetRequest) {
  if (!params.sku && !params.id) {
    throw new Error("Provide either sku or id");
  }
  return post<Recipe>("/api/recipes/get", params);
}

async function createRecipe(payload: RecipeCreateRequest) {
  return post<Recipe>("/api/recipes/create", payload);
}

async function updateRecipe(payload: RecipeUpdateRequest) {
  if (!payload.sku && !payload.id) {
    throw new Error("Provide either sku or id for update");
  }
  return post<Recipe>("/api/recipes/update", payload);
}

async function deleteRecipe(sku: string) {
  return post<{ success: boolean; message: string }>("/api/recipes/delete", { sku });
}

export const recipesApi = {
  list: listRecipes,
  get: getRecipe,
  create: createRecipe,
  update: updateRecipe,
  delete: deleteRecipe,
};

/* Work Order types */

export interface WorkOrderIngredient {
  ingredient_name: string;
  required_quantity: number;
  actual_quantity: number;
  unit: string;
  supplier?: string;
  grade?: string;
  cost: number;
}

export interface WorkOrderRecipe {
  id: string;
  name: string;
  sku: string;
  category: string;
  total_yield: number;
  yield_unit: string;
}

export interface WorkOrder {
  id: string;
  work_order_number: string;
  recipe_id: string;
  recipe: WorkOrderRecipe;
  batch_size: number;
  target_quantity: number;
  actual_quantity: number;
  status: "Draft" | "Scheduled" | "In Progress" | "Completed" | "On Hold" | "Paused";
  priority: "Low" | "Medium" | "High" | "Urgent";
  scheduled_date?: string;
  due_date?: string;
  assigned_worker?: string;
  estimated_cost: number;
  notes?: string;
  created_date: string;
  last_updated: string;
  last_updated_by?: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  elapsed_time: number;
  expected_time?: number;
  ingredients: WorkOrderIngredient[];
}

export interface WorkOrderListResponse {
  items: WorkOrder[];
  count: number;
}

export interface WorkOrderListRequest {
  query?: string;
  status?: string | null;
  priority?: string | null;
  assigned_worker?: string | null;
  limit?: number;
  offset?: number;
}

export interface WorkOrderCreateRequest {
  work_order_number: string;
  recipe_id: string;
  batch_size?: number;
  target_quantity: number;
  actual_quantity?: number;
  status?: "Draft" | "Scheduled" | "In Progress" | "Completed" | "On Hold" | "Paused";
  priority?: "Low" | "Medium" | "High" | "Urgent";
  scheduled_date?: string;
  due_date?: string;
  assigned_worker?: string;
  estimated_cost?: number;
  notes?: string;
  ingredients: WorkOrderIngredient[];
  last_updated_by?: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  elapsed_time?: number;
  expected_time?: number;
}

export interface WorkOrderUpdateRequest {
  work_order_number?: string;
  id?: string;
  recipe_id?: string;
  batch_size?: number;
  target_quantity?: number;
  actual_quantity?: number;
  status?: "Draft" | "Scheduled" | "In Progress" | "Completed" | "On Hold" | "Paused";
  priority?: "Low" | "Medium" | "High" | "Urgent";
  scheduled_date?: string;
  due_date?: string;
  assigned_worker?: string;
  estimated_cost?: number;
  notes?: string;
  ingredients?: WorkOrderIngredient[];
  last_updated_by?: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  elapsed_time?: number;
  expected_time?: number;
}

/* Work Order API */

async function listWorkOrders(params: WorkOrderListRequest) {
  return post<WorkOrderListResponse>("/api/work-orders/list", {
    query: params.query ?? "",
    status: params.status ?? null,
    priority: params.priority ?? null,
    assigned_worker: params.assigned_worker ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getWorkOrder(params: GetRequest) {
  if (!params.sku && !params.id) {
    throw new Error("Provide either work_order_number or id");
  }
  return post<WorkOrder>("/api/work-orders/get", params);
}

async function createWorkOrder(payload: WorkOrderCreateRequest) {
  return post<WorkOrder>("/api/work-orders/create", payload);
}

async function updateWorkOrder(payload: WorkOrderUpdateRequest) {
  if (!payload.work_order_number && !payload.id) {
    throw new Error("Provide either work_order_number or id for update");
  }
  return post<WorkOrder>("/api/work-orders/update", payload);
}

async function deleteWorkOrder(work_order_number: string) {
  return post<{ success: boolean; message: string }>("/api/work-orders/delete", { work_order_number });
}

export const workOrdersApi = {
  list: listWorkOrders,
  get: getWorkOrder,
  create: createWorkOrder,
  update: updateWorkOrder,
  delete: deleteWorkOrder,
};

/* Purchase Order types */

export interface PurchaseOrderItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good';
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  supplier?: string;
  supplierContact?: string;
  supplierEmail?: string;
  brand?: string;
  grade?: string;
  description?: string;
  packingWeight?: number;
  packingUnit?: string;
  expectedInwardDate?: string;
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered' | 'Delayed';
  qualityStatus: 'Pending' | 'Approved' | 'Rejected';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Partially Received' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  paidAmount: number;
  paymentTerms?: string;
  notes?: string;
  approvedBy?: string;
  createdBy?: string;
  createdDate?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrder[];
  total: number;
  limit: number;
  offset: number;
}

export interface PurchaseOrderListRequest {
  query?: string;
  status?: string | null;
  supplier?: string | null;
  priority?: string | null;
  limit?: number;
  offset?: number;
}

export interface PurchaseOrderCreateRequest {
  po_number: string;
  supplier: string;
  supplier_contact?: string;
  supplier_email?: string;
  supplier_address?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status?: 'Draft' | 'Sent' | 'Confirmed' | 'Partially Received' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  total_amount?: number;
  paid_amount?: number;
  payment_terms?: string;
  notes?: string;
  approved_by?: string;
  created_by?: string;
  last_updated_by?: string;
  items: Array<{
    name: string;
    type: string;
    category: string;
    quantity: number;
    unit: string;
    rate: number;
    total_amount: number;
    supplier?: string;
    supplier_contact?: string;
    supplier_email?: string;
    brand?: string;
    grade?: string;
    description?: string;
    packing_weight?: number;
    packing_unit?: string;
    expected_inward_date?: string;
    delivery_status?: string;
    quality_status?: string;
  }>;
}

export interface PurchaseOrderUpdateRequest {
  id: string;
  po_number?: string;
  supplier?: string;
  supplier_contact?: string;
  supplier_email?: string;
  supplier_address?: string;
  order_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status?: 'Draft' | 'Sent' | 'Confirmed' | 'Partially Received' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  total_amount?: number;
  paid_amount?: number;
  payment_terms?: string;
  notes?: string;
  approved_by?: string;
  last_updated_by?: string;
  items?: Array<{
    name: string;
    type: string;
    category: string;
    quantity: number;
    unit: string;
    rate: number;
    total_amount: number;
    supplier?: string;
    supplier_contact?: string;
    supplier_email?: string;
    brand?: string;
    grade?: string;
    description?: string;
    packing_weight?: number;
    packing_unit?: string;
    expected_inward_date?: string;
    delivery_status?: string;
    quality_status?: string;
  }>;
}

/* Purchase Order API */

async function listPurchaseOrders(params: PurchaseOrderListRequest) {
  return post<PurchaseOrderListResponse>("/api/purchase-orders/list", {
    query: params.query ?? "",
    status: params.status ?? null,
    supplier: params.supplier ?? null,
    priority: params.priority ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getPurchaseOrder(params: { po_number?: string; id?: string }) {
  if (!params.po_number && !params.id) {
    throw new Error("Provide either po_number or id");
  }
  return post<PurchaseOrder>("/api/purchase-orders/get", params);
}

async function createPurchaseOrder(payload: PurchaseOrderCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/purchase-orders/create", payload);
}

async function updatePurchaseOrder(payload: PurchaseOrderUpdateRequest) {
  if (!payload.id) {
    throw new Error("Provide id for update");
  }
  return post<{ success: boolean; message: string }>("/api/purchase-orders/update", payload);
}

async function deletePurchaseOrder(id: string) {
  return post<{ success: boolean; message: string }>("/api/purchase-orders/delete", { id });
}

export const purchaseOrdersApi = {
  list: listPurchaseOrders,
  get: getPurchaseOrder,
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  delete: deletePurchaseOrder,
};

/* Users API */

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface UsersListResponse {
  users: User[];
}

async function listUsers() {
  return post<UsersListResponse>("/users/list", {});
}

export const usersApi = {
  list: listUsers,
};

/* Factory Transfer types */

export interface TransferItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good' | 'Inventory';
  category: string;
  currentStock: number;
  transferQuantity: number;
  unit: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedValue: number;
  requiresRefrigeration: boolean;
  expiryDate?: string | null;
  brand?: string | null;
  grade?: string | null;
}

export interface Transfer {
  id: string;
  transferNumber: string;
  fromFactory: string;
  toFactory: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  requestedDate: string;
  scheduledDate?: string | null;
  actualDeliveryDate?: string | null;
  estimatedDeliveryDate?: string | null;
  transportMode?: string | null;
  driverDetails?: string | null;
  vehicleNumber?: string | null;
  trackingNumber?: string | null;
  totalValue: number;
  notes?: string | null;
  requestedBy?: string | null;
  approvedBy?: string | null;
  completedBy?: string | null;
  createdDate?: string | null;
  lastUpdated?: string | null;
  lastUpdatedBy?: string | null;
  items: TransferItem[];
}

export interface FactoryLocation {
  id: string;
  name: string;
  location: string;
  manager?: string | null;
  contact?: string | null;
  capacity?: string | null;
  specialization?: string[];
  distance?: string | null;
  status: 'Active' | 'Maintenance' | 'Inactive';
  createdDate?: string | null;
  lastUpdated?: string | null;
}

export interface TransferListRequest {
  query?: string;
  status?: string | null;
  factory?: string | null;
  priority?: string | null;
  limit?: number;
  offset?: number;
}

export interface TransferListResponse {
  items: Transfer[];
  total: number;
  limit: number;
  offset: number;
}

export interface FactoryLocationCreateRequest {
  name: string;
  location: string;
  manager?: string;
  contact?: string;
  capacity?: string;
  specialization?: string[];
  distance?: string;
  status?: 'Active' | 'Maintenance' | 'Inactive';
}

/* Factory Transfer API */

async function listFactoryLocations() {
  const res = await fetch(`${BASE_URL}/api/factory-transfers/factories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as FactoryLocation[];
}

async function createFactoryLocation(payload: FactoryLocationCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/factory-transfers/factories/create", payload);
}

async function listTransfers(params: TransferListRequest) {
  return post<TransferListResponse>("/api/factory-transfers/list", {
    query: params.query ?? "",
    status: params.status ?? null,
    factory: params.factory ?? null,
    priority: params.priority ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getTransfer(params: { transfer_number?: string; id?: string }) {
  if (!params.transfer_number && !params.id) {
    throw new Error("Provide either transfer_number or id");
  }
  return post<Transfer>("/api/factory-transfers/get", params);
}

export interface TransferCreateRequest {
  transfer_number: string;
  from_factory: string;
  to_factory: string;
  status?: 'Draft' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Delivered' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  requested_date: string;
  scheduled_date?: string;
  actual_delivery_date?: string;
  estimated_delivery_date?: string;
  transport_mode?: 'Truck' | 'Rail' | 'Air' | 'Combination';
  driver_details?: string;
  vehicle_number?: string;
  tracking_number?: string;
  total_value?: number;
  notes?: string;
  requested_by?: string;
  approved_by?: string;
  completed_by?: string;
  last_updated_by?: string;
  items?: Array<{
    name: string;
    type: string;
    category: string;
    current_stock: number;
    transfer_quantity: number;
    unit: string;
    priority: string;
    estimated_value: number;
    requires_refrigeration: boolean;
    expiry_date?: string;
    brand?: string;
    grade?: string;
  }>;
}

async function createTransfer(payload: TransferCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/factory-transfers/create", payload);
}

export const factoryTransfersApi = {
  listFactories: listFactoryLocations,
  createFactory: createFactoryLocation,
  listTransfers: listTransfers,
  getTransfer: getTransfer,
  createTransfer: createTransfer,
};

/* Sales Order types */

export interface SalesOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  weightUnit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerCompany: string;
  customerName: string;
  customerContact?: string;
  customerEmail?: string;
  customerAddress?: string;
  orderDate: string;
  dueDate: string;
  deliveryDate?: string;
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  notes?: string;
  salesRep?: string;
  discount: number;
  taxes: number;
  finalAmount: number;
  createdBy?: string;
  createdDate?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  items: SalesOrderItem[];
}

export interface SalesOrderListResponse {
  items: SalesOrder[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalesOrderListRequest {
  query?: string;
  status?: string | null;
  payment_status?: string | null;
  priority?: string | null;
  customer?: string | null;
  limit?: number;
  offset?: number;
}

export interface SalesOrderCreateRequest {
  order_number: string;
  customer_company: string;
  customer_name: string;
  customer_contact?: string;
  customer_email?: string;
  customer_address?: string;
  order_date: string;
  due_date: string;
  delivery_date?: string;
  status?: 'Pending' | 'Confirmed' | 'In Production' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  total_amount?: number;
  paid_amount?: number;
  payment_status?: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  notes?: string;
  sales_rep?: string;
  discount?: number;
  taxes?: number;
  final_amount?: number;
  created_by?: string;
  last_updated_by?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    weight: number;
    weight_unit: string;
    unit_price: number;
    total_price: number;
  }>;
}

export interface SalesOrderUpdateRequest {
  id: string;
  order_number?: string;
  customer_company?: string;
  customer_name?: string;
  customer_contact?: string;
  customer_email?: string;
  customer_address?: string;
  order_date?: string;
  due_date?: string;
  delivery_date?: string;
  status?: 'Pending' | 'Confirmed' | 'In Production' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  total_amount?: number;
  paid_amount?: number;
  payment_status?: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  notes?: string;
  sales_rep?: string;
  discount?: number;
  taxes?: number;
  final_amount?: number;
  last_updated_by?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unit: string;
    weight: number;
    weight_unit: string;
    unit_price: number;
    total_price: number;
  }>;
}

/* Sales Order API */

async function listSalesOrders(params: SalesOrderListRequest) {
  return post<SalesOrderListResponse>("/api/sales-orders/list", {
    query: params.query ?? "",
    status: params.status ?? null,
    payment_status: params.payment_status ?? null,
    priority: params.priority ?? null,
    customer: params.customer ?? null,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

async function getSalesOrder(params: { order_number?: string; id?: string }) {
  if (!params.order_number && !params.id) {
    throw new Error("Provide either order_number or id");
  }
  return post<SalesOrder>("/api/sales-orders/get", params);
}

async function createSalesOrder(payload: SalesOrderCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/sales-orders/create", payload);
}

async function updateSalesOrder(payload: SalesOrderUpdateRequest) {
  if (!payload.id) {
    throw new Error("Provide id for update");
  }
  return post<{ success: boolean; message: string }>("/api/sales-orders/update", payload);
}

async function deleteSalesOrder(id: string) {
  return post<{ success: boolean; message: string }>("/api/sales-orders/delete", { id });
}

export const salesOrdersApi = {
  list: listSalesOrders,
  get: getSalesOrder,
  create: createSalesOrder,
  update: updateSalesOrder,
  delete: deleteSalesOrder,
};

/* User Management types */

export interface UserManagement {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: string[];
  joinedDate: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface UserManagementListResponse {
  items: UserManagement[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserManagementListRequest {
  query?: string;
  role?: string | null;
  department?: string | null;
  status?: string | null;
  limit?: number;
  offset?: number;
}

export interface UserManagementCreateRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  permissions?: string[];
  joined_date?: string;
  is_active?: boolean;
  last_updated_by?: string;
}

export interface UserManagementUpdateRequest {
  id: string;
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  permissions?: string[];
  is_active?: boolean;
  last_updated_by?: string;
}

/* User Management API */

async function listUserManagement(params: UserManagementListRequest) {
  return post<UserManagementListResponse>("/api/user-management/list", {
    query: params.query ?? "",
    role: params.role ?? null,
    department: params.department ?? null,
    status: params.status ?? null,
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  });
}

async function getUserManagement(params: { username?: string; id?: string }) {
  if (!params.username && !params.id) {
    throw new Error("Provide either username or id");
  }
  return post<UserManagement>("/api/user-management/get", params);
}

async function createUserManagement(payload: UserManagementCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/user-management/create", payload);
}

async function updateUserManagement(payload: UserManagementUpdateRequest) {
  if (!payload.id) {
    throw new Error("Provide id for update");
  }
  return post<{ success: boolean; message: string }>("/api/user-management/update", payload);
}

async function deleteUserManagement(id: string) {
  return post<{ success: boolean; message: string }>("/api/user-management/delete", { id });
}

async function toggleUserStatus(id: string) {
  return post<{ success: boolean; message: string; isActive: boolean }>("/api/user-management/toggle-status", { id });
}

export const userManagementApi = {
  list: listUserManagement,
  get: getUserManagement,
  create: createUserManagement,
  update: updateUserManagement,
  delete: deleteUserManagement,
  toggleStatus: toggleUserStatus,
};

/* Customer Management types */

export interface CustomerManagement {
  id: string;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  customerType: 'Regular' | 'Premium' | 'Wholesale' | 'Retail';
  status: 'Active' | 'Inactive' | 'Blocked';
  creditLimit: number;
  outstandingBalance: number;
  paymentTerms?: string;
  notes?: string;
  createdBy?: string;
  createdDate?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
}

export interface CustomerManagementListResponse {
  items: CustomerManagement[];
  total: number;
  limit: number;
  offset: number;
}

export interface CustomerManagementListRequest {
  query?: string;
  customer_type?: string | null;
  status?: string | null;
  city?: string | null;
  limit?: number;
  offset?: number;
}

export interface CustomerManagementCreateRequest {
  company_name: string;
  contact_person: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  customer_type?: 'Regular' | 'Premium' | 'Wholesale' | 'Retail';
  status?: 'Active' | 'Inactive' | 'Blocked';
  credit_limit?: number;
  outstanding_balance?: number;
  payment_terms?: string;
  notes?: string;
  created_by?: string;
  last_updated_by?: string;
}

export interface CustomerManagementUpdateRequest {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  customer_type?: 'Regular' | 'Premium' | 'Wholesale' | 'Retail';
  status?: 'Active' | 'Inactive' | 'Blocked';
  credit_limit?: number;
  outstanding_balance?: number;
  payment_terms?: string;
  notes?: string;
  last_updated_by?: string;
}

/* Customer Management API */

async function listCustomerManagement(params: CustomerManagementListRequest) {
  return post<CustomerManagementListResponse>("/api/customer-management/list", {
    query: params.query ?? "",
    customer_type: params.customer_type ?? null,
    status: params.status ?? null,
    city: params.city ?? null,
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  });
}

async function getCustomerManagement(id: string) {
  return post<CustomerManagement>("/api/customer-management/get", { id });
}

async function createCustomerManagement(payload: CustomerManagementCreateRequest) {
  return post<{ success: boolean; id: string; message: string }>("/api/customer-management/create", payload);
}

async function updateCustomerManagement(payload: CustomerManagementUpdateRequest) {
  if (!payload.id) {
    throw new Error("Provide id for update");
  }
  return post<{ success: boolean; message: string }>("/api/customer-management/update", payload);
}

async function deleteCustomerManagement(id: string) {
  return post<{ success: boolean; message: string }>("/api/customer-management/delete", { id });
}

export const customerManagementApi = {
  list: listCustomerManagement,
  get: getCustomerManagement,
  create: createCustomerManagement,
  update: updateCustomerManagement,
  delete: deleteCustomerManagement,
};

/* Dispatch types */

export interface DispatchOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  weightUnit: string;
  unitPrice: number;
  totalPrice: number;
  dispatchedQuantity?: number;
}

export interface DispatchOrder {
  id: string;
  orderNumber: string;
  customerCompany: string;
  customerName: string;
  customerContact?: string;
  customerEmail?: string;
  deliveryAddress: string;
  orderDate: string;
  approvedDate?: string;
  dueDate: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  status: 'Ready for Dispatch' | 'Packaging' | 'Partially Fulfilled' | 'Dispatched' | 'In Transit' | 'Delivered' | 'On Hold' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalAmount: number;
  finalAmount: number;
  items: DispatchOrderItem[];
  notes?: string;
  salesRep?: string;
  dispatchTeam?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  trackingNumber?: string;
  specialInstructions?: string;
  deliveryType?: string;
  distance?: string;
  estimatedTravelTime?: string;
  onHoldReason?: string;
  onHoldBy?: string;
  onHoldDate?: string;
}

export interface FinishedGood {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated?: string;
}

export interface WorkOrderForDispatch {
  id: string;
  workOrderNumber: string;
  recipeName: string;
  batchSize: number;
  targetQuantity: number;
  actualQuantity: number;
  status: 'In Progress' | 'Completed' | 'Scheduled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledDate?: string;
  completedDate?: string;
  assignedWorker?: string;
}

export interface DispatchOrderListResponse {
  items: DispatchOrder[];
  total: number;
}

export interface FinishedGoodsListResponse {
  items: FinishedGood[];
  total: number;
}

export interface WorkOrdersForDispatchResponse {
  items: WorkOrderForDispatch[];
  total: number;
}

export interface DispatchHistoryRecord {
  id: string;
  dispatchDate: string;
  trackingNumber: string;
  transportService: string;
  vehicleNumber: string;
  driverName?: string;
  driverContact?: string;
  status: string;
  items: Array<{
    itemName: string;
    quantity: number;
    skuAssignments: Array<{
      sku: string;
      quantity: number;
    }>;
  }>;
}

/* Dispatch API */

async function getDispatchOrders(filters?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  const params: any = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.search) params.search = filters.search;

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/dispatch-orders${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as DispatchOrderListResponse;
}

async function getDispatchOrder(id: number) {
  const res = await fetch(`${BASE_URL}/api/dispatch-orders/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as DispatchOrder;
}

async function getFinishedGoods(itemNames?: string[]) {
  const params: any = {};
  if (itemNames && itemNames.length > 0) {
    params.item_names = itemNames.join(',');
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/finished-goods${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as FinishedGoodsListResponse;
}

async function getWorkOrdersForDispatch() {
  const res = await fetch(`${BASE_URL}/api/work-orders/for-dispatch`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as WorkOrdersForDispatchResponse;
}

async function holdDispatchOrder(id: number, data: {
  reason: string;
  held_by: string
}) {
  return post<{ success: boolean; message: string }>(`/api/dispatch-orders/${id}/hold`, data);
}

async function resumeDispatchOrder(id: number) {
  return post<{ success: boolean; message: string }>(`/api/dispatch-orders/${id}/resume`, {});
}

async function completeDispatch(id: number, data: {
  inventory_assignments: Array<{
    item_id: number;
    sku_assignments: Array<{ sku: string; quantity: number }>;
  }>;
  logistics: Array<{
    transport_service: string;
    vehicle_number: string;
    driver_name?: string;
    driver_contact?: string;
    comments?: string;
    item_allocations: Record<number, number>;
  }>;
  created_by: string;
}) {
  return post<{ success: boolean; message: string; tracking_number?: string }>(`/api/dispatch-orders/${id}/complete-dispatch`, data);
}

async function getDispatchHistory(orderId: number) {
  const res = await fetch(`${BASE_URL}/api/dispatch-records/order/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as any;
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as { records: DispatchHistoryRecord[] };
}

export const dispatchApi = {
  getOrders: getDispatchOrders,
  getOrder: getDispatchOrder,
  getFinishedGoods: getFinishedGoods,
  getWorkOrders: getWorkOrdersForDispatch,
  holdOrder: holdDispatchOrder,
  resumeOrder: resumeDispatchOrder,
  completeDispatch: completeDispatch,
  getHistory: getDispatchHistory,
};
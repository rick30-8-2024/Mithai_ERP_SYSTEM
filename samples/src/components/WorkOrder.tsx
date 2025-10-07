import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, ClipboardList, Search, Plus, Filter, MoreVertical, ChevronDown, ChevronUp, Edit, Save, X, Calendar, Clock, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select } from './ui/select';
import { Label } from './ui/label';

interface WorkOrderProps {
  onNavigate: (module: ModuleName) => void;
}

interface RawMaterialIngredient {
  id: string;
  name: string;
  requiredQuantity: number;
  actualQuantity: number;
  unit: string;
  supplier: string;
  grade: string;
  cost: number;
}

interface Recipe {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalYield: number;
  yieldUnit: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: RawMaterialIngredient[];
  totalCost: number;
}

interface WorkOrderItem {
  id: string;
  workOrderNumber: string;
  recipe: Recipe;
  batchSize: number;
  targetQuantity: number;
  actualQuantity: number;
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledDate: string;
  dueDate: string;
  assignedWorker: string;
  createdDate: string;
  ingredients: RawMaterialIngredient[];
  estimatedCost: number;
  notes: string;
}

export function WorkOrder({ onNavigate }: WorkOrderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingIngredients, setEditingIngredients] = useState(false);
  const [batchMultiplier, setBatchMultiplier] = useState(1);
  const [expandedWorkOrder, setExpandedWorkOrder] = useState<string | null>(null);

  // Mock recipes data (from RecipeManagement)
  const availableRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Pedha',
      sku: 'PD-001',
      category: 'Traditional Sweet',
      totalYield: 12,
      yieldUnit: 'pcs',
      preparationTime: 30,
      cookingTime: 45,
      difficulty: 'Medium',
      totalCost: 180.50,
      ingredients: [
        { id: '1', name: 'Milk Solids', requiredQuantity: 200, actualQuantity: 200, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 45.00 },
        { id: '2', name: 'Sugar', requiredQuantity: 80, actualQuantity: 80, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 12.50 },
        { id: '3', name: 'Vanaspati Ghee', requiredQuantity: 25, actualQuantity: 25, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 15.00 },
        { id: '4', name: 'Milk', requiredQuantity: 100, actualQuantity: 100, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 8.00 }
      ]
    },
    {
      id: '2',
      name: 'Milk Cake',
      sku: 'MC-002',
      category: 'Milk Based Sweet',
      totalYield: 8,
      yieldUnit: 'pcs',
      preparationTime: 45,
      cookingTime: 60,
      difficulty: 'Hard',
      totalCost: 220.75,
      ingredients: [
        { id: '1', name: 'Milk Solids', requiredQuantity: 300, actualQuantity: 300, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 67.50 },
        { id: '2', name: 'Milk', requiredQuantity: 250, actualQuantity: 250, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 20.00 },
        { id: '3', name: 'Sugar', requiredQuantity: 120, actualQuantity: 120, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 18.75 },
        { id: '4', name: 'Vanaspati Ghee', requiredQuantity: 35, actualQuantity: 35, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 21.00 }
      ]
    },
    {
      id: '3',
      name: 'Barfi',
      sku: 'BF-003',
      category: 'Traditional Sweet',
      totalYield: 10,
      yieldUnit: 'pcs',
      preparationTime: 25,
      cookingTime: 35,
      difficulty: 'Easy',
      totalCost: 165.25,
      ingredients: [
        { id: '1', name: 'Milk Solids', requiredQuantity: 250, actualQuantity: 250, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 56.25 },
        { id: '2', name: 'Sugar', requiredQuantity: 100, actualQuantity: 100, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 15.63 },
        { id: '3', name: 'Vanaspati Ghee', requiredQuantity: 30, actualQuantity: 30, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 18.00 },
        { id: '4', name: 'Milk', requiredQuantity: 75, actualQuantity: 75, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 6.00 }
      ]
    },
    {
      id: '4',
      name: 'Kesar Pedha',
      sku: 'KP-005',
      category: 'Premium Sweet',
      totalYield: 10,
      yieldUnit: 'pcs',
      preparationTime: 35,
      cookingTime: 45,
      difficulty: 'Medium',
      totalCost: 210.25,
      ingredients: [
        { id: '1', name: 'Milk Solids', requiredQuantity: 220, actualQuantity: 220, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 49.50 },
        { id: '2', name: 'Sugar', requiredQuantity: 90, actualQuantity: 90, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 14.06 },
        { id: '3', name: 'Vanaspati Ghee', requiredQuantity: 30, actualQuantity: 30, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 18.00 },
        { id: '4', name: 'Milk', requiredQuantity: 120, actualQuantity: 120, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 9.60 }
      ]
    }
  ];

  // Mock work orders data
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([
    {
      id: '1',
      workOrderNumber: 'WO-2025-001',
      recipe: availableRecipes[0],
      batchSize: 2,
      targetQuantity: 24,
      actualQuantity: 0,
      status: 'Scheduled',
      priority: 'High',
      scheduledDate: '2025-01-20',
      dueDate: '2025-01-21',
      assignedWorker: 'Rajesh Kumar',
      createdDate: '2025-01-19',
      estimatedCost: 361.00,
      notes: 'Rush order for festival',
      ingredients: availableRecipes[0].ingredients.map(ing => ({
        ...ing,
        requiredQuantity: ing.requiredQuantity * 2,
        actualQuantity: ing.actualQuantity * 2
      }))
    },
    {
      id: '2',
      workOrderNumber: 'WO-2025-002',
      recipe: availableRecipes[1],
      batchSize: 1,
      targetQuantity: 8,
      actualQuantity: 8,
      status: 'Completed',
      priority: 'Medium',
      scheduledDate: '2025-01-18',
      dueDate: '2025-01-19',
      assignedWorker: 'Priya Sharma',
      createdDate: '2025-01-17',
      estimatedCost: 220.75,
      notes: '',
      ingredients: availableRecipes[1].ingredients
    },
    {
      id: '3',
      workOrderNumber: 'WO-2025-003',
      recipe: availableRecipes[2],
      batchSize: 3,
      targetQuantity: 30,
      actualQuantity: 15,
      status: 'In Progress',
      priority: 'Medium',
      scheduledDate: '2025-01-19',
      dueDate: '2025-01-20',
      assignedWorker: 'Amit Singh',
      createdDate: '2025-01-18',
      estimatedCost: 495.75,
      notes: '50% completed',
      ingredients: availableRecipes[2].ingredients.map(ing => ({
        ...ing,
        requiredQuantity: ing.requiredQuantity * 3,
        actualQuantity: ing.actualQuantity * 3
      }))
    }
  ]);

  const filteredWorkOrders = workOrders.filter(order =>
    order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.assignedWorker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        actualQuantity: ing.requiredQuantity * batchMultiplier
      }))
    });
  };

  const handleBatchMultiplierChange = (multiplier: number) => {
    setBatchMultiplier(multiplier);
    if (selectedRecipe) {
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: selectedRecipe.ingredients.map(ing => ({
          ...ing,
          actualQuantity: ing.requiredQuantity * multiplier
        }))
      });
    }
  };

  const handleIngredientQuantityChange = (ingredientId: string, newQuantity: number) => {
    if (selectedRecipe) {
      setSelectedRecipe({
        ...selectedRecipe,
        ingredients: selectedRecipe.ingredients.map(ing =>
          ing.id === ingredientId ? { ...ing, actualQuantity: newQuantity } : ing
        )
      });
    }
  };

  const calculateEstimatedCost = () => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.ingredients.reduce((total, ing) => {
      const ratio = ing.actualQuantity / ing.requiredQuantity;
      return total + (ing.cost * ratio);
    }, 0);
  };

  const handleCreateWorkOrder = () => {
    if (!selectedRecipe) return;

    const newWorkOrder: WorkOrderItem = {
      id: Date.now().toString(),
      workOrderNumber: `WO-2025-${String(workOrders.length + 1).padStart(3, '0')}`,
      recipe: selectedRecipe,
      batchSize: batchMultiplier,
      targetQuantity: selectedRecipe.totalYield * batchMultiplier,
      actualQuantity: 0,
      status: 'Draft',
      priority: 'Medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedWorker: 'Unassigned',
      createdDate: new Date().toISOString().split('T')[0],
      estimatedCost: calculateEstimatedCost(),
      notes: '',
      ingredients: selectedRecipe.ingredients
    };

    setWorkOrders([newWorkOrder, ...workOrders]);
    setShowCreateOrder(false);
    setSelectedRecipe(null);
    setBatchMultiplier(1);
    setEditingIngredients(false);
  };

  const toggleWorkOrderExpansion = (orderId: string) => {
    setExpandedWorkOrder(expandedWorkOrder === orderId ? null : orderId);
  };

  // Calculate work order statistics
  const totalWorkOrders = workOrders.length;
  const completedOrders = workOrders.filter(order => order.status === 'Completed').length;
  const inProgressOrders = workOrders.filter(order => order.status === 'In Progress').length;
  const scheduledOrders = workOrders.filter(order => order.status === 'Scheduled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100">
            <ClipboardList className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Work Order Management</h1>
            <p className="text-slate-600">Create and manage production work orders</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-800">{totalWorkOrders}</div>
            <div className="text-sm text-slate-600">Total Orders</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{inProgressOrders}</div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-purple-600">{scheduledOrders}</div>
            <div className="text-sm text-slate-600">Scheduled</div>
          </div>
        </Card>
        <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{completedOrders}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by work order number, recipe, or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateOrder(true)}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
          <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Create New Work Order</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateOrder(false);
                    setSelectedRecipe(null);
                    setBatchMultiplier(1);
                    setEditingIngredients(false);
                  }}
                  className="rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {!selectedRecipe ? (
                <div>
                  <h3 className="font-medium text-slate-800 mb-4">Select a Recipe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRecipes.map((recipe) => (
                      <Card
                        key={recipe.id}
                        className="rounded-xl border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                        onClick={() => handleRecipeSelect(recipe)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-slate-800">{recipe.name}</h4>
                            <p className="text-sm text-slate-600">SKU: {recipe.sku}</p>
                          </div>
                          <Badge className="text-xs rounded-lg bg-purple-100 text-purple-800 border-purple-200">
                            {recipe.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Yield:</span>
                            <span className="text-slate-800">{recipe.totalYield} {recipe.yieldUnit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Time:</span>
                            <span className="text-slate-800">{recipe.preparationTime + recipe.cookingTime}min</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Cost:</span>
                            <span className="text-slate-800">₹{recipe.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-800">Configure Work Order: {selectedRecipe.name}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecipe(null)}
                      className="rounded-lg"
                    >
                      Change Recipe
                    </Button>
                  </div>

                  {/* Batch Size Configuration */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <Label className="text-sm font-medium text-slate-800 mb-3 block">Batch Configuration</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Batch Multiplier</Label>
                        <Input
                          type="number"
                          min="1"
                          value={batchMultiplier}
                          onChange={(e) => handleBatchMultiplierChange(parseInt(e.target.value) || 1)}
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Target Quantity</Label>
                        <div className="flex items-center h-10 px-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-sm text-slate-800">
                            {selectedRecipe.totalYield * batchMultiplier} {selectedRecipe.yieldUnit}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Estimated Cost</Label>
                        <div className="flex items-center h-10 px-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-sm text-slate-800">₹{calculateEstimatedCost().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients Configuration */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-sm font-medium text-slate-800">Required Ingredients</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIngredients(!editingIngredients)}
                        className="rounded-lg"
                      >
                        {editingIngredients ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quantities
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedRecipe.ingredients.map((ingredient) => (
                        <div key={ingredient.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 text-sm">{ingredient.name}</div>
                            <div className="text-xs text-slate-600">{ingredient.supplier} • {ingredient.grade}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            {editingIngredients ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={ingredient.actualQuantity}
                                  onChange={(e) => handleIngredientQuantityChange(ingredient.id, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-xs rounded-lg"
                                />
                                <span className="text-xs text-slate-600">{ingredient.unit}</span>
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="font-medium text-slate-800 text-sm">
                                  {ingredient.actualQuantity} {ingredient.unit}
                                </div>
                                <div className="text-xs text-slate-600">
                                  ₹{((ingredient.cost * ingredient.actualQuantity) / ingredient.requiredQuantity).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleCreateWorkOrder}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                    >
                      Create Work Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWorkOrders.map((order) => (
          <Card key={order.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800">{order.workOrderNumber}</h3>
                    <Badge className={`text-xs rounded-lg ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <Badge className={`text-xs rounded-lg ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-2">{order.recipe.name} • Batch Size: {order.batchSize}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {order.dueDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {order.assignedWorker}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {order.recipe.preparationTime + order.recipe.cookingTime}min
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-800 mb-1">
                    {order.actualQuantity}/{order.targetQuantity} {order.recipe.yieldUnit}
                  </div>
                  <div className="text-sm text-slate-600 mb-2">₹{order.estimatedCost.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkOrderExpansion(order.id)}
                      className="rounded-lg"
                    >
                      {expandedWorkOrder === order.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((order.actualQuantity / order.targetQuantity) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((order.actualQuantity / order.targetQuantity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedWorkOrder === order.id && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-800 mb-4">Required Ingredients</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-sm">{ingredient.name}</div>
                          <div className="text-xs text-slate-600">{ingredient.supplier}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-slate-800 text-sm">
                            {ingredient.actualQuantity} {ingredient.unit}
                          </div>
                          <div className="text-xs text-slate-600">
                            ₹{((ingredient.cost * ingredient.actualQuantity) / ingredient.requiredQuantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-800 mr-2">Notes:</span>
                      <span className="text-sm text-slate-600">{order.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No work orders found</h3>
          <p className="text-slate-500">Create your first work order to get started</p>
        </div>
      )}
    </div>
  );
}
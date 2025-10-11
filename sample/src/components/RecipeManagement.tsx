import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, ChefHat, Search, Plus, Filter, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface RecipeManagementProps {
  onNavigate: (module: ModuleName) => void;
}

interface RawMaterialIngredient {
  id: string;
  name: string;
  quantity: number;
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
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
  brand: string;
  grade: string;
  packingWeight: number;
  packingUnit: string;
  packingQuantityApx: number;
  ingredients: RawMaterialIngredient[];
  totalCost: number;
  instructions: string[];
}

export function RecipeManagement({ onNavigate }: RecipeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  
  // Mock recipe data combining finished goods with raw materials
  const recipes: Recipe[] = [
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
      status: 'Active',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium',
      packingWeight: 250,
      packingUnit: 'g/box',
      packingQuantityApx: 12,
      totalCost: 180.50,
      ingredients: [
        { id: '1', name: 'Milk Solids', quantity: 200, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 45.00 },
        { id: '2', name: 'Sugar', quantity: 80, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 12.50 },
        { id: '3', name: 'Vanaspati Ghee', quantity: 25, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 15.00 },
        { id: '4', name: 'Milk', quantity: 100, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 8.00 }
      ],
      instructions: [
        'Heat milk in heavy-bottomed pan',
        'Add milk solids gradually while stirring',
        'Cook until mixture thickens',
        'Add sugar and mix well',
        'Add ghee and cook until mixture leaves sides',
        'Shape into small pedhas while warm'
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
      status: 'Active',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium',
      packingWeight: 500,
      packingUnit: 'g/box',
      packingQuantityApx: 8,
      totalCost: 220.75,
      ingredients: [
        { id: '1', name: 'Milk Solids', quantity: 300, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 67.50 },
        { id: '2', name: 'Milk', quantity: 250, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 20.00 },
        { id: '3', name: 'Sugar', quantity: 120, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 18.75 },
        { id: '4', name: 'Vanaspati Ghee', quantity: 35, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 21.00 }
      ],
      instructions: [
        'Boil milk and reduce to half',
        'Add milk solids slowly',
        'Continue cooking until very thick',
        'Add sugar and cook until crystallized',
        'Add ghee and mix thoroughly',
        'Set in greased tray and cut when cool'
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
      status: 'Active',
      lastUpdated: '2025-01-18',
      brand: 'Royal Sweets',
      grade: 'Standard',
      packingWeight: 500,
      packingUnit: 'g/box',
      packingQuantityApx: 10,
      totalCost: 165.25,
      ingredients: [
        { id: '1', name: 'Milk Solids', quantity: 250, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 56.25 },
        { id: '2', name: 'Sugar', quantity: 100, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 15.63 },
        { id: '3', name: 'Vanaspati Ghee', quantity: 30, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 18.00 },
        { id: '4', name: 'Milk', quantity: 75, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 6.00 }
      ],
      instructions: [
        'Mix milk solids with milk',
        'Cook on medium heat',
        'Add sugar when mixture thickens',
        'Add ghee and continue cooking',
        'Spread on greased plate',
        'Cut into squares when set'
      ]
    },
    {
      id: '4',
      name: 'Malai Pedha',
      sku: 'MP-004',
      category: 'Premium Sweet',
      totalYield: 15,
      yieldUnit: 'pcs',
      preparationTime: 40,
      cookingTime: 50,
      difficulty: 'Hard',
      status: 'Draft',
      lastUpdated: '2025-01-17',
      brand: 'Royal Sweets',
      grade: 'Premium Plus',
      packingWeight: 300,
      packingUnit: 'g/box',
      packingQuantityApx: 15,
      totalCost: 195.00,
      ingredients: [
        { id: '1', name: 'Milk Solids', quantity: 180, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 40.50 },
        { id: '2', name: 'Milk', quantity: 150, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 12.00 },
        { id: '3', name: 'Sugar', quantity: 70, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 10.94 },
        { id: '4', name: 'Vanaspati Ghee', quantity: 40, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 24.00 }
      ],
      instructions: [
        'Prepare rich milk base',
        'Add premium milk solids',
        'Cook with special technique',
        'Shape with traditional method',
        'Garnish appropriately'
      ]
    },
    {
      id: '5',
      name: 'Kesar Pedha',
      sku: 'KP-005',
      category: 'Premium Sweet',
      totalYield: 10,
      yieldUnit: 'pcs',
      preparationTime: 35,
      cookingTime: 45,
      difficulty: 'Medium',
      status: 'Active',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium Plus',
      packingWeight: 250,
      packingUnit: 'g/box',
      packingQuantityApx: 10,
      totalCost: 210.25,
      ingredients: [
        { id: '1', name: 'Milk Solids', quantity: 220, unit: 'g', supplier: 'Amul Dairy Co-op', grade: 'Premium', cost: 49.50 },
        { id: '2', name: 'Sugar', quantity: 90, unit: 'g', supplier: 'Bajaj Hindusthan Sugar', grade: 'Refined', cost: 14.06 },
        { id: '3', name: 'Vanaspati Ghee', quantity: 30, unit: 'g', supplier: 'Dalda Foods Ltd', grade: 'Commercial', cost: 18.00 },
        { id: '4', name: 'Milk', quantity: 120, unit: 'ml', supplier: 'Mother Dairy', grade: 'Full Cream', cost: 9.60 }
      ],
      instructions: [
        'Prepare base pedha mixture',
        'Add saffron soaked in warm milk',
        'Cook until proper consistency',
        'Shape with saffron garnish',
        'Cool and pack carefully'
      ]
    }
  ];

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleRecipeExpansion = (recipeId: string) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

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
          <div className="p-2 rounded-xl bg-purple-100">
            <ChefHat className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Recipe Management</h1>
            <p className="text-slate-600">Create and manage product recipes with ingredients</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name, SKU, category, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
          <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
            {/* Recipe Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">{recipe.name}</h3>
                  <p className="text-sm text-slate-600">SKU: {recipe.sku}</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Yield</span>
                  <span className="text-sm font-medium text-slate-800">
                    {recipe.totalYield} {recipe.yieldUnit}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Time</span>
                  <span className="text-sm text-slate-600">
                    {recipe.preparationTime + recipe.cookingTime}min
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Cost</span>
                  <span className="text-sm font-medium text-slate-800">
                    ₹{recipe.totalCost.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Difficulty</span>
                  <Badge className={`text-xs rounded-lg ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={`text-xs rounded-lg ${getStatusColor(recipe.status)}`}>
                  {recipe.status}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRecipeExpansion(recipe.id)}
                className="w-full rounded-lg border-slate-200"
              >
                {expandedRecipe === recipe.id ? (
                  <>
                    Hide Ingredients <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    View Ingredients <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Ingredients Section (Expandable) */}
            {expandedRecipe === recipe.id && (
              <div className="p-6 bg-slate-50/50">
                <h4 className="font-medium text-slate-800 mb-4">Raw Materials Required</h4>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 text-sm">{ingredient.name}</div>
                        <div className="text-xs text-slate-600">{ingredient.supplier} • {ingredient.grade}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-800 text-sm">
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                        <div className="text-xs text-slate-600">₹{ingredient.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">Total Material Cost</span>
                    <span className="font-semibold text-slate-800">₹{recipe.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50/30 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Last updated: {recipe.lastUpdated}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No recipes found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
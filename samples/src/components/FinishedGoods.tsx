import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Cookie, Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface FinishedGoodsProps {
  onNavigate: (module: ModuleName) => void;
}

interface FinishedGoodItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
  brand: string;
  grade: string;
  quantity: number;
  packingWeight: number;
  packingUnit: string;
  packingQuantityApx: number;
}

export function FinishedGoods({ onNavigate }: FinishedGoodsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock finished goods data
  const finishedGoodItems: FinishedGoodItem[] = [
    {
      id: '1',
      name: 'Pedha',
      sku: 'PD-001',
      category: 'Traditional Sweet',
      currentStock: 240,
      minStock: 50,
      maxStock: 500,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium',
      quantity: 240,
      packingWeight: 250,
      packingUnit: 'g/box',
      packingQuantityApx: 12
    },
    {
      id: '2',
      name: 'Milk Cake',
      sku: 'MC-002',
      category: 'Milk Based Sweet',
      currentStock: 180,
      minStock: 40,
      maxStock: 300,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium',
      quantity: 180,
      packingWeight: 500,
      packingUnit: 'g/box',
      packingQuantityApx: 8
    },
    {
      id: '3',
      name: 'Barfi',
      sku: 'BF-003',
      category: 'Traditional Sweet',
      currentStock: 35,
      minStock: 60,
      maxStock: 400,
      unit: 'pcs',
      status: 'Low Stock',
      lastUpdated: '2025-01-18',
      brand: 'Royal Sweets',
      grade: 'Standard',
      quantity: 35,
      packingWeight: 500,
      packingUnit: 'g/box',
      packingQuantityApx: 10
    },
    {
      id: '4',
      name: 'Malai Pedha',
      sku: 'MP-004',
      category: 'Premium Sweet',
      currentStock: 0,
      minStock: 30,
      maxStock: 200,
      unit: 'pcs',
      status: 'Out of Stock',
      lastUpdated: '2025-01-17',
      brand: 'Royal Sweets',
      grade: 'Premium Plus',
      quantity: 0,
      packingWeight: 300,
      packingUnit: 'g/box',
      packingQuantityApx: 15
    },
    {
      id: '5',
      name: 'Kesar Pedha',
      sku: 'KP-005',
      category: 'Premium Sweet',
      currentStock: 120,
      minStock: 40,
      maxStock: 250,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-01-19',
      brand: 'Royal Sweets',
      grade: 'Premium Plus',
      quantity: 120,
      packingWeight: 250,
      packingUnit: 'g/box',
      packingQuantityApx: 10
    }
  ];

  const filteredItems = finishedGoodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <div className="p-2 rounded-xl bg-orange-100">
            <Cookie className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Finished Goods Management</h1>
            <p className="text-slate-600">Track and manage finished products and packaging</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name, SKU, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Finished Goods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{item.name}</h3>
                <p className="text-sm text-slate-600">SKU: {item.sku}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Brand</span>
                <span className="text-sm font-medium text-slate-800">{item.brand}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Grade</span>
                <span className="text-sm font-medium text-slate-800">{item.grade}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Category</span>
                <span className="text-sm font-medium text-slate-800">{item.category}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Current Stock</span>
                <span className="text-sm font-medium text-slate-800">
                  {item.currentStock} {item.unit}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Packing Weight</span>
                <span className="text-sm text-slate-600">
                  {item.packingWeight} {item.packingUnit}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Packing Qty (apx.)</span>
                <span className="text-sm text-slate-600">
                  {item.packingQuantityApx} pcs/box
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Min/Max</span>
                <span className="text-sm text-slate-600">
                  {item.minStock}/{item.maxStock} {item.unit}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={`text-xs rounded-lg ${getStatusColor(item.status)}`}>
                  {item.status}
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Last updated: {item.lastUpdated}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Cookie className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
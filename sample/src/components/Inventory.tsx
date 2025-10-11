import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, Package, Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface InventoryProps {
  onNavigate: (module: ModuleName) => void;
}

interface InventoryItem {
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
}

export function Inventory({ onNavigate }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Sugar',
      sku: 'SGR-001',
      category: 'Raw Material',
      currentStock: 500,
      minStock: 100,
      maxStock: 1000,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2025-01-19'
    },
    {
      id: '2',
      name: 'Chocolate Chips',
      sku: 'CHC-002',
      category: 'Raw Material',
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      unit: 'kg',
      status: 'Low Stock',
      lastUpdated: '2025-01-19'
    },
    {
      id: '3',
      name: 'Vanilla Extract',
      sku: 'VAN-003',
      category: 'Raw Material',
      currentStock: 0,
      minStock: 10,
      maxStock: 50,
      unit: 'L',
      status: 'Out of Stock',
      lastUpdated: '2025-01-18'
    },
    {
      id: '4',
      name: 'Chocolate Cake',
      sku: 'CKE-001',
      category: 'Finished Good',
      currentStock: 150,
      minStock: 20,
      maxStock: 200,
      unit: 'pcs',
      status: 'In Stock',
      lastUpdated: '2025-01-19'
    }
  ];

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="p-2 rounded-xl bg-blue-100">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Inventory Management</h1>
            <p className="text-slate-600">Track and manage your inventory items</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
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
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No items found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
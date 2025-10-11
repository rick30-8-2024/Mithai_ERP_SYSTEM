import React, { useState } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, KeyRound, Plus, Search, Truck, Package, Calendar, User, Weight, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface GatePassProps {
  onNavigate: (module: ModuleName) => void;
}

interface InwardEntry {
  id: string;
  genericName: string;
  inwardFrom: string;
  quantity: number;
  weight: number;
  weightUnit: string;
  vehicleNumber: string;
  timestamp: string;
  status: 'pending' | 'processed' | 'distributed';
  addedBy: string;
}

export function GatePass({ onNavigate }: GatePassProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    genericName: '',
    inwardFrom: '',
    quantity: '',
    weight: '',
    weightUnit: 'kg',
    vehicleNumber: ''
  });

  const [inwardEntries, setInwardEntries] = useState<InwardEntry[]>([
    {
      id: 'INW001',
      genericName: 'Raw Sugar',
      inwardFrom: 'ABC Sugar Mills',
      quantity: 500,
      weight: 25000,
      weightUnit: 'kg',
      vehicleNumber: 'MH12AB1234',
      timestamp: '2025-01-20T10:30:00Z',
      status: 'pending',
      addedBy: 'John Smith'
    },
    {
      id: 'INW002',
      genericName: 'Cocoa Powder',
      inwardFrom: 'XYZ Cocoa Industries',
      quantity: 200,
      weight: 5000,
      weightUnit: 'kg',
      vehicleNumber: 'GJ05CD5678',
      timestamp: '2025-01-20T09:15:00Z',
      status: 'distributed',
      addedBy: 'Jane Doe'
    },
    {
      id: 'INW003',
      genericName: 'Almonds',
      inwardFrom: 'Premium Nuts Co.',
      quantity: 100,
      weight: 2500,
      weightUnit: 'kg',
      vehicleNumber: 'KA03EF9012',
      timestamp: '2025-01-19T16:45:00Z',
      status: 'processed',
      addedBy: 'Mike Johnson'
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.genericName || !formData.inwardFrom || !formData.quantity || !formData.weight || !formData.vehicleNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const newEntry: InwardEntry = {
      id: `INW${String(inwardEntries.length + 1).padStart(3, '0')}`,
      genericName: formData.genericName,
      inwardFrom: formData.inwardFrom,
      quantity: parseInt(formData.quantity),
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      vehicleNumber: formData.vehicleNumber,
      timestamp: new Date().toISOString(),
      status: 'pending',
      addedBy: 'John Smith'
    };

    setInwardEntries(prev => [newEntry, ...prev]);
    setFormData({
      genericName: '',
      inwardFrom: '',
      quantity: '',
      weight: '',
      weightUnit: 'kg',
      vehicleNumber: ''
    });
    setShowForm(false);
  };

  const filteredEntries = inwardEntries.filter(entry =>
    entry.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.inwardFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'distributed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
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
          <div className="p-2 rounded-xl bg-violet-100">
            <KeyRound className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1>Gate Pass / Inward</h1>
            <p className="text-slate-600">Manage inward materials and inventory</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-100">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-slate-600">Pending</p>
              <p className="text-2xl font-semibold text-slate-800">
                {inwardEntries.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-600">Processed</p>
              <p className="text-2xl font-semibold text-slate-800">
                {inwardEntries.filter(e => e.status === 'processed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100">
              <Hash className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600">Total Today</p>
              <p className="text-2xl font-semibold text-slate-800">{inwardEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by item name, supplier, vehicle number, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl"
          />
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Inward Entry
        </Button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Inward Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="genericName">Generic Name *</Label>
                <Input
                  id="genericName"
                  value={formData.genericName}
                  onChange={(e) => handleInputChange('genericName', e.target.value)}
                  placeholder="e.g. Raw Sugar, Cocoa Powder"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="inwardFrom">Inward From *</Label>
                <Input
                  id="inwardFrom"
                  value={formData.inwardFrom}
                  onChange={(e) => handleInputChange('inwardFrom', e.target.value)}
                  placeholder="e.g. ABC Sugar Mills"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="500"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="25000"
                      className="rounded-xl"
                      required
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="t">t</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                  placeholder="e.g. MH12AB1234"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Add Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-violet-100">
                    <Package className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{entry.genericName}</h3>
                    <p className="text-slate-600">ID: {entry.id}</p>
                  </div>
                  <Badge className={`ml-auto lg:ml-0 ${getStatusColor(entry.status)} rounded-lg`}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Inward From</p>
                      <p className="font-medium text-slate-800">{entry.inwardFrom}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Quantity</p>
                      <p className="font-medium text-slate-800">{entry.quantity.toLocaleString()} units</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Weight</p>
                      <p className="font-medium text-slate-800">{entry.weight.toLocaleString()} {entry.weightUnit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Vehicle</p>
                      <p className="font-medium text-slate-800">{entry.vehicleNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.timestamp)}
                  </div>
                  <div className="text-sm text-slate-500">
                    Added by: {entry.addedBy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-medium text-slate-800 mb-2">No inward entries found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first inward entry to get started'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Inward Entry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
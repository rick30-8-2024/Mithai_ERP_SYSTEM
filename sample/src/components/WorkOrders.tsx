import React, { useState, useEffect } from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, ClipboardList, Search, Play, Pause, CheckCircle, Clock, ChefHat, Package, AlertCircle, Timer, Users, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface WorkOrdersProps {
  onNavigate: (module: ModuleName) => void;
  currentUser?: string;
}

interface RawMaterialIngredient {
  id: string;
  name: string;
  requiredQuantity: number;
  actualQuantity: number;
  unit: string;
  supplier: string;
  grade: string;
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
  instructions?: string[];
}

interface WorkOrderItem {
  id: string;
  workOrderNumber: string;
  recipe: Recipe;
  batchSize: number;
  targetQuantity: number;
  actualQuantity: number;
  status: 'Scheduled' | 'In Progress' | 'Paused' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledDate: string;
  dueDate: string;
  assignedWorker: string;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  elapsedTime: number; // in minutes
  notes: string;
}

export function WorkOrders({ onNavigate, currentUser = 'John Smith' }: WorkOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'inProgress' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderItem | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [actualQuantity, setActualQuantity] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Mock work orders assigned to current user
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([
    {
      id: '1',
      workOrderNumber: 'WO-2025-001',
      recipe: {
        id: 'R001',
        name: 'Gulab Jamun',
        sku: 'GJ-001',
        category: 'Traditional Sweets',
        totalYield: 50,
        yieldUnit: 'pcs',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'Medium',
        ingredients: [
          {
            id: 'ing1',
            name: 'Khoya (Mawa)',
            requiredQuantity: 2,
            actualQuantity: 2,
            unit: 'kg',
            supplier: 'Amul Dairy',
            grade: 'Premium'
          },
          {
            id: 'ing2',
            name: 'All Purpose Flour',
            requiredQuantity: 0.5,
            actualQuantity: 0.5,
            unit: 'kg',
            supplier: 'Aashirvaad',
            grade: 'Standard'
          },
          {
            id: 'ing3',
            name: 'Sugar',
            requiredQuantity: 1.5,
            actualQuantity: 1.5,
            unit: 'kg',
            supplier: 'Parry\'s',
            grade: 'Premium'
          },
          {
            id: 'ing4',
            name: 'Cardamom Powder',
            requiredQuantity: 0.02,
            actualQuantity: 0.02,
            unit: 'kg',
            supplier: 'Everest',
            grade: 'Premium'
          }
        ],
        instructions: [
          'Mix khoya and flour until smooth consistency',
          'Divide into small equal portions and shape into balls',
          'Prepare sugar syrup with cardamom',
          'Deep fry the balls until golden brown',
          'Soak in warm sugar syrup for 2 hours'
        ]
      },
      batchSize: 2,
      targetQuantity: 100,
      actualQuantity: 0,
      status: 'Scheduled',
      priority: 'High',
      scheduledDate: '2025-10-10',
      dueDate: '2025-10-10',
      assignedWorker: currentUser,
      elapsedTime: 0,
      notes: 'Rush order for wedding'
    },
    {
      id: '2',
      workOrderNumber: 'WO-2025-002',
      recipe: {
        id: 'R002',
        name: 'Kesar Pedha',
        sku: 'KP-002',
        category: 'Premium Sweets',
        totalYield: 40,
        yieldUnit: 'pcs',
        preparationTime: 20,
        cookingTime: 30,
        difficulty: 'Easy',
        ingredients: [
          {
            id: 'ing5',
            name: 'Khoya (Mawa)',
            requiredQuantity: 1.5,
            actualQuantity: 1.5,
            unit: 'kg',
            supplier: 'Amul Dairy',
            grade: 'Premium'
          },
          {
            id: 'ing6',
            name: 'Sugar',
            requiredQuantity: 0.5,
            actualQuantity: 0.5,
            unit: 'kg',
            supplier: 'Parry\'s',
            grade: 'Premium'
          },
          {
            id: 'ing7',
            name: 'Saffron',
            requiredQuantity: 0.005,
            actualQuantity: 0.005,
            unit: 'kg',
            supplier: 'Kashmir Valley',
            grade: 'Premium'
          }
        ],
        instructions: [
          'Heat khoya in a heavy-bottomed pan',
          'Add sugar and mix continuously',
          'Add saffron soaked in milk',
          'Cook until mixture leaves the pan',
          'Shape into small rounds and garnish'
        ]
      },
      batchSize: 3,
      targetQuantity: 120,
      actualQuantity: 95,
      status: 'In Progress',
      priority: 'Urgent',
      scheduledDate: '2025-10-10',
      dueDate: '2025-10-10',
      assignedWorker: currentUser,
      startedAt: '2025-10-10T09:30:00',
      elapsedTime: 85,
      notes: 'Premium order - ensure quality'
    },
    {
      id: '3',
      workOrderNumber: 'WO-2025-004',
      recipe: {
        id: 'R004',
        name: 'Barfi',
        sku: 'BF-004',
        category: 'Traditional Sweets',
        totalYield: 40,
        yieldUnit: 'pcs',
        preparationTime: 25,
        cookingTime: 35,
        difficulty: 'Medium',
        ingredients: [
          {
            id: 'ing8',
            name: 'Khoya (Mawa)',
            requiredQuantity: 1.8,
            actualQuantity: 1.8,
            unit: 'kg',
            supplier: 'Amul Dairy',
            grade: 'Premium'
          },
          {
            id: 'ing9',
            name: 'Sugar',
            requiredQuantity: 0.8,
            actualQuantity: 0.8,
            unit: 'kg',
            supplier: 'Parry\'s',
            grade: 'Premium'
          },
          {
            id: 'ing10',
            name: 'Pistachios',
            requiredQuantity: 0.1,
            actualQuantity: 0.1,
            unit: 'kg',
            supplier: 'California Nuts',
            grade: 'Premium'
          }
        ],
        instructions: [
          'Grate khoya finely',
          'Cook with sugar on low heat',
          'Spread on greased tray',
          'Garnish with pistachios',
          'Cut into diamond shapes when cool'
        ]
      },
      batchSize: 2,
      targetQuantity: 80,
      actualQuantity: 80,
      status: 'Completed',
      priority: 'Medium',
      scheduledDate: '2025-10-09',
      dueDate: '2025-10-10',
      assignedWorker: currentUser,
      startedAt: '2025-10-09T14:00:00',
      completedAt: '2025-10-09T16:30:00',
      elapsedTime: 150,
      notes: 'Standard batch'
    }
  ]);

  // Timer for in-progress orders
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkOrders(prev => prev.map(order => {
        if (order.status === 'In Progress' && order.startedAt) {
          const startTime = new Date(order.startedAt).getTime();
          const now = new Date().getTime();
          const elapsed = Math.floor((now - startTime) / 60000); // minutes
          return { ...order, elapsedTime: elapsed };
        }
        return order;
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'scheduled' && order.status === 'Scheduled') ||
      (filterStatus === 'inProgress' && (order.status === 'In Progress' || order.status === 'Paused')) ||
      (filterStatus === 'completed' && order.status === 'Completed');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Paused':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'On Hold':
        return 'bg-red-100 text-red-800 border-red-200';
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

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStartOrder = (order: WorkOrderItem) => {
    setSelectedOrder(order);
    setShowStartDialog(true);
  };

  const confirmStartOrder = () => {
    if (!selectedOrder) return;

    const updatedOrders = workOrders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: 'In Progress' as const,
          startedAt: new Date().toISOString(),
          elapsedTime: 0
        };
      }
      return order;
    });

    setWorkOrders(updatedOrders);
    setShowStartDialog(false);
    setSelectedOrder(null);
    toast.success(`Started work order ${selectedOrder.workOrderNumber}`);
  };

  const handlePauseOrder = (order: WorkOrderItem) => {
    const updatedOrders = workOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: 'Paused' as const,
          pausedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setWorkOrders(updatedOrders);
    toast.info(`Paused work order ${order.workOrderNumber}`);
  };

  const handleResumeOrder = (order: WorkOrderItem) => {
    const updatedOrders = workOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: 'In Progress' as const,
          pausedAt: undefined
        };
      }
      return o;
    });

    setWorkOrders(updatedOrders);
    toast.success(`Resumed work order ${order.workOrderNumber}`);
  };

  const handleCompleteOrder = (order: WorkOrderItem) => {
    setSelectedOrder(order);
    setActualQuantity(order.targetQuantity.toString());
    setCompletionNotes('');
    setShowCompleteDialog(true);
  };

  const confirmCompleteOrder = () => {
    if (!selectedOrder || !actualQuantity) return;

    const updatedOrders = workOrders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: 'Completed' as const,
          actualQuantity: Number(actualQuantity),
          completedAt: new Date().toISOString(),
          notes: completionNotes || order.notes
        };
      }
      return order;
    });

    setWorkOrders(updatedOrders);
    setShowCompleteDialog(false);
    setSelectedOrder(null);
    setActualQuantity('');
    setCompletionNotes('');
    toast.success(`Completed work order ${selectedOrder.workOrderNumber}`);
  };

  const handleViewRecipe = (order: WorkOrderItem) => {
    setSelectedOrder(order);
    setShowRecipeDialog(true);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate statistics
  const myTasksCount = workOrders.filter(o => o.status === 'Scheduled').length;
  const inProgressCount = workOrders.filter(o => o.status === 'In Progress' || o.status === 'Paused').length;
  const completedTodayCount = workOrders.filter(o => {
    if (o.status !== 'Completed' || !o.completedAt) return false;
    const completedDate = new Date(o.completedAt).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return completedDate === today;
  }).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Work Orders</h1>
            <p className="text-slate-600">View and manage your assigned work orders</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card 
          className={`rounded-2xl bg-white/80 backdrop-blur-sm border-2 p-4 cursor-pointer transition-all ${
            filterStatus === 'scheduled' ? 'border-purple-300 bg-purple-50/50' : 'border-slate-200 hover:border-purple-200'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'scheduled' ? 'all' : 'scheduled')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-semibold text-purple-600">{myTasksCount}</div>
              <div className="text-sm text-slate-600">My Tasks</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card 
          className={`rounded-2xl bg-white/80 backdrop-blur-sm border-2 p-4 cursor-pointer transition-all ${
            filterStatus === 'inProgress' ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'inProgress' ? 'all' : 'inProgress')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-semibold text-blue-600">{inProgressCount}</div>
              <div className="text-sm text-slate-600">In Progress</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Timer className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card 
          className={`rounded-2xl bg-white/80 backdrop-blur-sm border-2 p-4 cursor-pointer transition-all ${
            filterStatus === 'completed' ? 'border-green-300 bg-green-50/50' : 'border-slate-200 hover:border-green-200'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-semibold text-green-600">{completedTodayCount}</div>
              <div className="text-sm text-slate-600">Completed Today</div>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by work order number or recipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 p-8">
            <div className="text-center text-slate-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No work orders found</p>
            </div>
          </Card>
        ) : (
          filteredOrders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const progressPercentage = order.targetQuantity > 0 
              ? (order.actualQuantity / order.targetQuantity) * 100 
              : 0;

            return (
              <Card key={order.id} className="rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800">{order.workOrderNumber}</h3>
                        <Badge className={`${getStatusColor(order.status)} border rounded-lg px-2 py-0.5`}>
                          {order.status}
                        </Badge>
                        <Badge className={`${getPriorityColor(order.priority)} border rounded-lg px-2 py-0.5`}>
                          {order.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <ChefHat className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{order.recipe.name}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-sm text-slate-600">{order.batchSize}x batches</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-600 mb-1">Target Quantity</div>
                      <div className="font-semibold text-slate-800">{order.targetQuantity} {order.recipe.yieldUnit}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-600 mb-1">Actual Quantity</div>
                      <div className="font-semibold text-slate-800">{order.actualQuantity} {order.recipe.yieldUnit}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-600 mb-1">Due Date</div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-600 mb-1">Time</div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.status === 'In Progress' || order.status === 'Paused' 
                          ? formatTime(order.elapsedTime)
                          : order.status === 'Completed'
                          ? formatTime(order.elapsedTime)
                          : `~${order.recipe.preparationTime + order.recipe.cookingTime}m`
                        }
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for In Progress orders */}
                  {(order.status === 'In Progress' || order.status === 'Paused') && order.actualQuantity > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-medium text-slate-700">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartOrder(order)}
                        className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {order.status === 'In Progress' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handlePauseOrder(order)}
                          className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteOrder(order)}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    {order.status === 'Paused' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleResumeOrder(order)}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteOrder(order)}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewRecipe(order)}
                      className="rounded-lg border-slate-200"
                    >
                      <ChefHat className="w-3 h-3 mr-1" />
                      View Recipe
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="rounded-lg border-slate-200 ml-auto"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      {/* Ingredients */}
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Ingredients Required (per batch):</h4>
                        <div className="space-y-1">
                          {order.recipe.ingredients.map(ing => (
                            <div key={ing.id} className="flex justify-between items-center bg-slate-50 rounded-lg p-2 text-sm">
                              <span className="text-slate-700">{ing.name}</span>
                              <span className="font-medium text-slate-800">
                                {(ing.requiredQuantity * order.batchSize).toFixed(2)} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div>
                          <h4 className="font-medium text-slate-700 mb-2">Notes:</h4>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-slate-700">
                            <AlertCircle className="w-4 h-4 inline mr-1 text-yellow-600" />
                            {order.notes}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      {(order.startedAt || order.completedAt) && (
                        <div>
                          <h4 className="font-medium text-slate-700 mb-2">Timeline:</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-3 h-3" />
                              <span>Scheduled: {new Date(order.scheduledDate).toLocaleString()}</span>
                            </div>
                            {order.startedAt && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <Play className="w-3 h-3" />
                                <span>Started: {new Date(order.startedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {order.pausedAt && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <Pause className="w-3 h-3" />
                                <span>Paused: {new Date(order.pausedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {order.completedAt && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>Completed: {new Date(order.completedAt).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Start Order Confirmation Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Start Work Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Are you ready to start work on <span className="font-medium text-slate-800">{selectedOrder?.workOrderNumber}</span>?
            </p>
            {selectedOrder && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Recipe:</span>
                  <span className="font-medium text-slate-800">{selectedOrder.recipe.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Target Quantity:</span>
                  <span className="font-medium text-slate-800">{selectedOrder.targetQuantity} {selectedOrder.recipe.yieldUnit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Estimated Time:</span>
                  <span className="font-medium text-slate-800">
                    {selectedOrder.recipe.preparationTime + selectedOrder.recipe.cookingTime} minutes
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={confirmStartOrder} className="rounded-lg bg-green-600 hover:bg-green-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Start Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Order Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-slate-600">
              Enter the actual quantity produced for <span className="font-medium text-slate-800">{selectedOrder?.workOrderNumber}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Actual Quantity Produced <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="rounded-lg"
                />
                <div className="flex items-center px-3 bg-slate-100 rounded-lg text-slate-600">
                  {selectedOrder?.recipe.yieldUnit}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target was {selectedOrder?.targetQuantity} {selectedOrder?.recipe.yieldUnit}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Completion Notes (Optional)
              </label>
              <Input
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Any notes about this batch..."
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={confirmCompleteOrder} 
              disabled={!actualQuantity || Number(actualQuantity) <= 0}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Details Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recipe Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4">
              {/* Recipe Header */}
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{selectedOrder.recipe.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-100 text-slate-800 border-slate-200 rounded-lg">
                    {selectedOrder.recipe.category}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-lg">
                    Difficulty: {selectedOrder.recipe.difficulty}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200 rounded-lg">
                    Yield: {selectedOrder.recipe.totalYield} {selectedOrder.recipe.yieldUnit}
                  </Badge>
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-xs text-orange-600 mb-1">Preparation Time</div>
                  <div className="font-semibold text-orange-800">{selectedOrder.recipe.preparationTime} min</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xs text-red-600 mb-1">Cooking Time</div>
                  <div className="font-semibold text-red-800">{selectedOrder.recipe.cookingTime} min</div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-medium text-slate-700 mb-3">
                  Ingredients (for {selectedOrder.batchSize}x batches):
                </h4>
                <div className="space-y-2">
                  {selectedOrder.recipe.ingredients.map(ing => (
                    <div key={ing.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-800">{ing.name}</span>
                        <span className="font-semibold text-slate-900">
                          {(ing.requiredQuantity * selectedOrder.batchSize).toFixed(2)} {ing.unit}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span>Supplier: {ing.supplier}</span>
                        <span>Grade: {ing.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {selectedOrder.recipe.instructions && selectedOrder.recipe.instructions.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Instructions:</h4>
                  <ol className="space-y-2">
                    {selectedOrder.recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-slate-700 pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowRecipeDialog(false)} className="rounded-lg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

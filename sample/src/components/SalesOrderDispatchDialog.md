# Complete Dispatch Dialog - Tabbed Version

Replace the content between `</DialogHeader>` and `<DialogFooter>` in the Complete Dispatch Dialog with this:

```tsx
{selectedOrder && (
  <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
    {/* Order Summary - Always visible */}
    <div className="bg-slate-50 rounded-xl p-4 mb-4">
      <h4 className="font-medium text-slate-800 mb-2">Order Details</h4>
      <div className="space-y-1 text-sm">
        <p><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</p>
        <p><span className="font-medium">Customer:</span> {selectedOrder.customerCompany}</p>
        <p><span className="font-medium">Amount:</span> ₹{selectedOrder.finalAmount.toLocaleString()}</p>
      </div>
    </div>

    {/* Tabs Navigation */}
    <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="inventory" className="rounded-lg">
        <Package className="w-4 h-4 mr-2" />
        Inventory Assignment
      </TabsTrigger>
      <TabsTrigger value="logistics" className="rounded-lg" disabled={!isInventoryValid()}>
        <Truck className="w-4 h-4 mr-2" />
        Logistics Details
      </TabsTrigger>
    </TabsList>

    {/* Tab: Inventory Assignment */}
    <TabsContent value="inventory" className="space-y-4">
      {/* Inventory assignment content - KEEP EXISTING */}
    </TabsContent>

    {/* Tab: Logistics Details */}
    <TabsContent value="logistics" className="space-y-4">
      {/* Logistics entries with multiple vehicles */}
    </TabsContent>
  </Tabs>
)}

{/* Footer with context-aware buttons */}
<DialogFooter>
  <Button 
    variant="outline" 
    onClick={() => setIsCompleteDispatchDialogOpen(false)}
    className="rounded-lg"
  >
    Cancel
  </Button>
  
  {currentTab === 'inventory' ? (
    <Button 
      onClick={() => setCurrentTab('logistics')}
      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
      disabled={!isInventoryValid()}
    >
      Next: Logistics
      <ChevronRight className="w-4 h-4 ml-2" />
    </Button>
  ) : (
    <>
      <Button 
        variant="outline"
        onClick={() => setCurrentTab('inventory')}
        className="rounded-lg"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button 
        onClick={confirmCompleteDispatch}
        className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
        disabled={!isCompleteDispatchValid()}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirm Dispatch
      </Button>
    </>
  )}
</DialogFooter>
```

This provides:
- Two separate tabs for Inventory and Logistics
- Navigation buttons (Next/Back/Confirm)
- Logistics tab disabled until inventory is valid
- Wider dialog already set to max-w-5xl

import React from 'react';
import { ModuleName } from '../App';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentTrackingProps {
  onNavigate: (module: ModuleName) => void;
}

export function PaymentTracking({ onNavigate }: PaymentTrackingProps) {
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
          <div className="p-2 rounded-xl bg-fuchsia-100">
            <CreditCard className="w-6 h-6 text-fuchsia-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Payment Tracking</h1>
            <p className="text-slate-600">Track payments and transactions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 text-center">
        <h2 className="text-lg font-medium text-slate-800 mb-2">Payment Tracking Module</h2>
        <p className="text-slate-600">This module will track customer payments, invoicing, and financial transactions.</p>
      </div>
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  BedDouble,
  Building2,
  Calendar,
  ChefHat,
  Compass,
  FileText,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext.tsx';
import { canRoleAccess } from '../../utils/hotelLogic.ts';
import { BillingView } from './views/BillingView.tsx';
import { CanteenPosView } from './views/CanteenPosView.tsx';
import { ConciergeView } from './views/ConciergeView.tsx';
import { HousekeepingView } from './views/HousekeepingView.tsx';
import { InventoryView } from './views/InventoryView.tsx';
import { OverviewView } from './views/OverviewView.tsx';
import { ReceptionView } from './views/ReceptionView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { ReservationsView } from './views/ReservationsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { WalkInCheckInModal } from './modals/WalkInCheckInModal.tsx';
import { BookingModal } from '../website/BookingModal.tsx';
import { PrintableInvoiceModal } from '../invoice/PrintableInvoiceModal.tsx';

export const HmsLayout: React.FC = () => {
  const {
    currentUser,
    hmsTab,
    setHmsTab,
    invoices,
    activeInvoice,
    setActiveInvoice,
    generateInvoiceForReservation,
  } = useHotel();

  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'reception', label: 'Reception Desk', icon: KeyRound },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'inventory', label: 'Room Inventory', icon: BedDouble },
    { id: 'billing', label: 'GST Invoices', icon: FileText },
    { id: 'canteen', label: 'Awadhi Canteen', icon: UtensilsCrossed },
    { id: 'housekeeping', label: 'Housekeeping & Maint.', icon: Wrench },
    { id: 'concierge', label: 'Sightseeing Concierge', icon: Compass },
    { id: 'reports', label: 'Accounts & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Hotel Settings', icon: Building2 },
  ];

  const handleOpenInvoiceById = (resId: string) => {
    const existing = invoices.find((i) => i.reservationId === resId);
    if (existing) {
      setActiveInvoice(existing);
    } else {
      const generated = generateInvoiceForReservation(resId);
      if (generated) setActiveInvoice(generated);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* HMS Sub-Header Bar (Royal Navy & Gold Header) */}
      <div className="bg-[#0a1e3f] border-b border-blue-900 px-4 sm:px-6 lg:px-8 py-3.5 no-print shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#c5a059]/20 text-[#f5e6c8] border border-[#c5a059]/40 glow-gold">
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
            </span>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>Laxmi HMS Console</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-900/80 text-[#f5e6c8] border border-[#c5a059]/40">
                  {currentUser?.role} Mode
                </span>
              </p>
              <p className="text-[11px] text-blue-200">
                Staff: <strong className="text-white">{currentUser?.name}</strong> • Active Shift • Vibhuti Khand, Gomti Nagar
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-[#c5a059]/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Walk-In Guest</span>
            </button>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-blue-300/30 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (White bar with Royal Blue Pills) */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto py-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = hmsTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setHmsTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2b5c] text-white shadow-sm shadow-[#0f2b5c]/25'
                      : 'text-slate-600 hover:text-[#0f2b5c] hover:bg-blue-50/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#c5a059]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hmsTab === 'overview' && (
          <OverviewView
            onOpenWalkIn={() => setIsWalkInOpen(true)}
            onOpenBooking={() => setIsBookingOpen(true)}
            onSwitchTab={setHmsTab}
          />
        )}

        {hmsTab === 'reception' && <ReceptionView />}

        {hmsTab === 'reservations' && (
          <ReservationsView
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenWalkIn={() => setIsWalkInOpen(true)}
            onViewInvoice={handleOpenInvoiceById}
          />
        )}

        {hmsTab === 'inventory' && <InventoryView />}

        {hmsTab === 'billing' && <BillingView onViewInvoice={setActiveInvoice} />}

        {hmsTab === 'canteen' && <CanteenPosView />}

        {hmsTab === 'housekeeping' && <HousekeepingView />}

        {hmsTab === 'concierge' && <ConciergeView />}

        {hmsTab === 'reports' && <ReportsView />}

        {hmsTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      {isWalkInOpen && <WalkInCheckInModal onClose={() => setIsWalkInOpen(false)} />}

      {isBookingOpen && <BookingModal onClose={() => setIsBookingOpen(false)} />}

      {activeInvoice && (
        <PrintableInvoiceModal invoice={activeInvoice} onClose={() => setActiveInvoice(null)} />
      )}
    </div>
  );
};

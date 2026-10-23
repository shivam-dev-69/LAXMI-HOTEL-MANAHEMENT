/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  KeyRound,
  LogOut,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

interface OverviewViewProps {
  onOpenWalkIn: () => void;
  onOpenBooking: () => void;
  onSwitchTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenWalkIn,
  onOpenBooking,
  onSwitchTab,
}) => {
  const { rooms, reservations, invoices, orders, auditLogs, setHmsTab } = useHotel();

  const today = new Date().toISOString().split('T')[0];

  // Room Stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const reservedRooms = rooms.filter((r) => r.status === 'RESERVED').length;
  const dirtyRooms = rooms.filter((r) => r.status === 'DIRTY' || r.status === 'CLEANING').length;
  const maintenanceRooms = rooms.filter(
    (r) => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_SERVICE'
  ).length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Today's Operations
  const todayCheckIns = reservations.filter(
    (r) => r.checkInDate === today && r.bookingStatus !== 'CANCELLED'
  );
  const todayCheckOuts = reservations.filter(
    (r) => r.checkOutDate === today && r.bookingStatus === 'CHECKED_IN'
  );

  // Financials derived from saved records
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const unpaidInvoices = invoices.filter(
    (inv) => inv.paymentStatus === 'UNPAID' || inv.paymentStatus === 'PARTIALLY_PAID'
  );
  const pendingAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const activeCanteenOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions (Royal Navy Luxury Banner) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1e3f] border-2 border-[#c5a059]/40 p-6 rounded-2xl shadow-xl glow-blue">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5e6c8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            Laxmi Hotel • Operations Command Center
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Daily Operations Executive Overview</h2>
          <p className="text-xs text-blue-200">
            Real-time status of Gomti Nagar room inventory, active guest folios, and hospitality services.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenWalkIn}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-[#c5a059]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Fast Walk-In Check-In</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-blue-300/40 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#c5a059]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 card-glow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Occupancy</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#0a1e3f]">{occupancyRate}%</span>
            <span className="text-xs text-slate-500 font-medium">
              ({occupiedRooms} of {totalRooms} rooms)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-[#0f2b5c] h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>

        {/* Total Invoiced Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 card-glow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Invoiced Billing</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#0f2b5c] border border-blue-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif text-3xl font-bold text-[#0f2b5c]">
            {formatCurrencyINR(totalRevenue)}
          </span>
          <p className="text-[11px] text-slate-500">Derived from {invoices.length} saved GST invoices</p>
        </div>

        {/* Pending Receivables */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 card-glow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pending Balances</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif text-3xl font-bold text-amber-600">
            {formatCurrencyINR(pendingAmount)}
          </span>
          <p className="text-[11px] text-slate-500">
            Across {unpaidInvoices.length} active/unpaid stays
          </p>
        </div>

        {/* Kitchen Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 card-glow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Kitchen Orders</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif text-3xl font-bold text-[#0a1e3f]">
            {activeCanteenOrders.length}
          </span>
          <p className="text-[11px] text-slate-500">F&B room service in progress</p>
        </div>
      </div>

      {/* Room Status Breakdown Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#0a1e3f] flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-[#0f2b5c]" />
            Live Room Inventory Breakdown
          </h3>
          <button
            onClick={() => setHmsTab('reception')}
            className="text-xs font-bold text-[#0f2b5c] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Interactive Floor Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs font-bold text-emerald-800">Available</p>
            <p className="font-serif text-2xl font-bold text-emerald-950 mt-1">{availableRooms}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for guest</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <p className="text-xs font-bold text-rose-800">Occupied</p>
            <p className="font-serif text-2xl font-bold text-rose-950 mt-1">{occupiedRooms}</p>
            <span className="text-[10px] text-rose-600 font-medium">Guest checked in</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs font-bold text-blue-800">Reserved</p>
            <p className="font-serif text-2xl font-bold text-blue-950 mt-1">{reservedRooms}</p>
            <span className="text-[10px] text-blue-600 font-medium">Upcoming arrival</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-xs font-bold text-amber-800">Dirty / Turnover</p>
            <p className="font-serif text-2xl font-bold text-amber-950 mt-1">{dirtyRooms}</p>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting cleaner</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <p className="text-xs font-bold text-purple-800">Maintenance</p>
            <p className="font-serif text-2xl font-bold text-purple-950 mt-1">{maintenanceRooms}</p>
            <span className="text-[10px] text-purple-600 font-medium">Work in progress</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-700">Total Rooms</p>
            <p className="font-serif text-2xl font-bold text-slate-900 mt-1">{totalRooms}</p>
            <span className="text-[10px] text-slate-500 font-medium">Floors 1 to 4</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Today's Movements & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Expected Check-ins and Check-outs */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#0a1e3f] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0f2b5c]" />
            Today's Scheduled Movements
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Arrivals & Check-Ins ({todayCheckIns.length})
              </p>
              {todayCheckIns.length > 0 ? (
                <div className="space-y-2">
                  {todayCheckIns.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#0a1e3f]">{res.guestName}</p>
                        <p className="text-[11px] text-slate-500">
                          Ref: {res.bookingRef} • Room: {res.roomNumber || 'Pending'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {res.bookingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No additional arrivals scheduled today.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Departures & Check-Outs ({todayCheckOuts.length})
              </p>
              {todayCheckOuts.length > 0 ? (
                <div className="space-y-2">
                  {todayCheckOuts.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#0a1e3f]">{res.guestName}</p>
                        <p className="text-[11px] text-slate-500">
                          Room {res.roomNumber} • Ref: {res.bookingRef}
                        </p>
                      </div>
                      <button
                        onClick={() => setHmsTab('reception')}
                        className="px-3 py-1.5 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-[10px] uppercase cursor-pointer transition-all"
                      >
                        Settle & Check Out
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No pending departures remaining today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Audit Activity Feed */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#0a1e3f] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0f2b5c]" />
            Recent System & Staff Audit Trail
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {auditLogs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0f2b5c] uppercase tracking-wider text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-700 text-xs">{log.details}</p>
                <p className="text-[10px] text-slate-400">
                  By {log.actorName} ({log.actorRole})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

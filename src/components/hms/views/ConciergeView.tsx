/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Landmark,
  MapPin,
  Phone,
  Plus,
  Send,
  UserCheck,
} from 'lucide-react';
import { TouristEnquiry } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const ConciergeView: React.FC = () => {
  const { touristEnquiries, updateTouristStatus } = useHotel();
  const [editingEnquiry, setEditingEnquiry] = useState<TouristEnquiry | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [driverDetails, setDriverDetails] = useState('');
  const [newStatus, setNewStatus] = useState<TouristEnquiry['status']>('QUOTED');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry) return;

    updateTouristStatus(
      editingEnquiry.id,
      newStatus,
      Number(quoteAmount) || editingEnquiry.estimatedCost,
      driverDetails.trim() || editingEnquiry.assignedDriver
    );

    setEditingEnquiry(null);
  };

  const statusBadges: Record<TouristEnquiry['status'], string> = {
    SUBMITTED: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    QUOTED: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    ASSIGNED: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    COMPLETED: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Concierge & City Sightseeing Dispatch
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Lucknow Sightseeing & Cab Requests</h2>
          <p className="text-xs text-slate-300">
            Manage airport/railway transfers, private chauffeur dispatches, and heritage monument tour itineraries.
          </p>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {touristEnquiries.map((enq) => (
          <div
            key={enq.id}
            className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#c5a059]">{enq.refCode}</span>
                  <h3 className="font-serif text-lg font-bold text-white">{enq.guestName}</h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    statusBadges[enq.status]
                  }`}
                >
                  {enq.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p>
                  Service: <strong className="text-white">{enq.serviceType.replace(/_/g, ' ')}</strong>
                </p>
                <p>
                  Date: <strong>{enq.date}</strong> • Persons: <strong>{enq.persons}</strong>
                </p>
                <p>Contact: {enq.guestPhone}</p>
                {enq.roomNumber && <p>Staying in Room: {enq.roomNumber}</p>}
              </div>

              {enq.destinations && enq.destinations.length > 0 && (
                <div className="p-2.5 rounded-lg bg-[#141e33] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Monuments / Itinerary:
                  </span>
                  <p className="text-[11px] text-slate-200">{enq.destinations.join(', ')}</p>
                </div>
              )}

              {enq.notes && (
                <p className="text-[11px] text-amber-300/90 italic">Notes: {enq.notes}</p>
              )}

              {enq.assignedDriver && (
                <div className="p-2 rounded bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Driver: {enq.assignedDriver}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Estimated Quote</span>
                <p className="font-serif text-base font-bold text-[#f5e6c8]">
                  {formatCurrencyINR(enq.estimatedCost)}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingEnquiry(enq);
                  setQuoteAmount(enq.estimatedCost);
                  setDriverDetails(enq.assignedDriver || '');
                  setNewStatus(enq.status);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#182338] hover:bg-[#c5a059] text-slate-200 hover:text-slate-950 font-semibold text-xs transition-colors"
              >
                Update / Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-serif text-base font-bold text-white">
              Manage Request {editingEnquiry.refCode}
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="QUOTED">QUOTED</option>
                  <option value="ASSIGNED">ASSIGNED (Driver allocated)</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Confirmed Tour / Cab Fare (₹)
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(Number(e.target.value))}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Driver Name & Vehicle Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salim Khan (Innova UP32-AX-1029)"
                  value={driverDetails}
                  onChange={(e) => setDriverDetails(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEnquiry(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] text-slate-950 font-bold uppercase tracking-wider"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

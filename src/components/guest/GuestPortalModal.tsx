/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bed,
  Calendar,
  Clock,
  Download,
  FileText,
  Key,
  Phone,
  Search,
  ShieldCheck,
  User,
  Utensils,
  X,
} from 'lucide-react';
import { Reservation } from '../../types/hotel.ts';
import { formatCurrencyINR } from '../../utils/hotelLogic.ts';
import { useHotel } from '../../context/HotelContext.tsx';

interface GuestPortalModalProps {
  onClose: () => void;
  onOpenInvoice: (resId: string) => void;
  onOrderFoodToRoom: (roomNumber: string) => void;
}

export const GuestPortalModal: React.FC<GuestPortalModalProps> = ({
  onClose,
  onOpenInvoice,
  onOrderFoodToRoom,
}) => {
  const { reservations, folios, categories, generateInvoiceForReservation } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedReservation, setMatchedReservation] = useState<Reservation | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim().toLowerCase();
    if (!clean) return;

    setHasSearched(true);
    const found = reservations.find(
      (r) =>
        r.bookingRef.toLowerCase() === clean ||
        r.guestPhone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')) ||
        r.guestEmail.toLowerCase() === clean
    );
    setMatchedReservation(found || null);
  };

  const category = matchedReservation
    ? categories.find((c) => c.id === matchedReservation.categoryId)
    : null;

  const folio = matchedReservation
    ? folios.find((f) => f.reservationId === matchedReservation.id)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#2e3e60] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141e33]">
          <div>
            <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-widest">
              Guest Self-Service Portal
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              Lookup Stay, Folio & Tax Invoice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Close portal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase">
              Enter Booking Reference or Registered Phone
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. LXH-84021 or 9811234567"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer"
              >
                Search
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Try sample booking: <code className="text-[#c5a059] font-mono">LXH-84021</code> (Rajesh Malhotra) or{' '}
              <code className="text-[#c5a059] font-mono">LXH-84022</code> (VIP Suite)
            </p>
          </form>

          {/* Search Result */}
          {hasSearched && !matchedReservation && (
            <div className="p-5 rounded-xl bg-[#162035] border border-white/5 text-center space-y-2">
              <p className="font-semibold text-white">No Active Reservation Found</p>
              <p className="text-slate-400 text-xs">
                We could not locate any booking matching "{searchTerm}". Please double-check your booking reference
                or phone number, or contact the front desk.
              </p>
            </div>
          )}

          {matchedReservation && (
            <div className="space-y-5 animate-in fade-in">
              {/* Profile & Status Card */}
              <div className="p-5 rounded-xl bg-[#141e33] border border-[#273854] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider">
                      Confirmed Reservation
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white">
                      Ref: {matchedReservation.bookingRef}
                    </h4>
                    <p className="text-slate-300">{matchedReservation.guestName}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      matchedReservation.bookingStatus === 'CHECKED_IN'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : matchedReservation.bookingStatus === 'CONFIRMED'
                        ? 'bg-sky-950 border-sky-500 text-sky-300'
                        : 'bg-slate-800 border-slate-600 text-slate-300'
                    }`}
                  >
                    {matchedReservation.bookingStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Assigned Room</span>
                    <span className="font-bold text-[#c5a059] text-sm">
                      Room {matchedReservation.roomNumber || 'Pre-allocated'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Category</span>
                    <span className="font-semibold text-white truncate block">{category?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Check-In</span>
                    <span className="font-medium text-white">{matchedReservation.checkInDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Check-Out</span>
                    <span className="font-medium text-white">{matchedReservation.checkOutDate}</span>
                  </div>
                </div>
              </div>

              {/* Folio Breakdown */}
              {folio && (
                <div className="p-4 rounded-xl bg-[#101828] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-slate-200">
                      Live Room Folio & Incurred Charges
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Folio Status: <strong className="text-emerald-400">{folio.status}</strong>
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 max-h-40 overflow-y-auto">
                    {folio.items.map((it) => (
                      <div key={it.id} className="py-2 flex items-center justify-between text-slate-300">
                        <div>
                          <p className="font-medium text-slate-100">{it.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {it.date} • {it.category}
                          </p>
                        </div>
                        <span
                          className={`font-semibold ${
                            it.category === 'PAYMENT' ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {it.category === 'PAYMENT' ? '-' : ''}
                          {formatCurrencyINR(it.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white text-xs">
                    <span>Balance Payable at Checkout</span>
                    <span
                      className={`text-sm ${
                        folio.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrencyINR(folio.balanceDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions: View Invoice & Order Food */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenInvoice(matchedReservation.id);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official GST Tax Invoice</span>
                </button>

                {matchedReservation.roomNumber && matchedReservation.bookingStatus === 'CHECKED_IN' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOrderFoodToRoom(matchedReservation.roomNumber!);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#162035] border border-[#c5a059]/40 text-[#f5e6c8] hover:bg-[#1f2d48] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Utensils className="w-4 h-4 text-[#c5a059]" />
                    <span>Order Food to Room {matchedReservation.roomNumber}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

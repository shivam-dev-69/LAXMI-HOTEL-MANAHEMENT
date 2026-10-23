/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bed,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  KeyRound,
  LogOut,
  Plus,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { BookingStatus, Reservation } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

interface ReservationsViewProps {
  onOpenBooking: () => void;
  onOpenWalkIn: () => void;
  onViewInvoice: (resId: string) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onOpenBooking,
  onOpenWalkIn,
  onViewInvoice,
}) => {
  const {
    reservations,
    categories,
    rooms,
    assignRoomToReservation,
    cancelReservation,
    checkInGuest,
    isRoomAvailable,
  } = useHotel();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Assign Room Modal
  const [assigningRes, setAssigningRes] = useState<Reservation | null>(null);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'ALL' && r.bookingStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = r.bookingRef.toLowerCase().includes(q);
      const matchGuest = r.guestName.toLowerCase().includes(q);
      const matchPhone = r.guestPhone.includes(q);
      const matchRoom = r.roomNumber?.includes(q);
      return matchRef || matchGuest || matchPhone || matchRoom;
    }
    return true;
  });

  const statusBadges: Record<BookingStatus, { bg: string; label: string }> = {
    CONFIRMED: { bg: 'bg-sky-950/80 text-sky-300 border-sky-500/40', label: 'Confirmed' },
    CHECKED_IN: { bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', label: 'Checked In' },
    CHECKED_OUT: { bg: 'bg-slate-800 text-slate-300 border-slate-600', label: 'Checked Out' },
    CANCELLED: { bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40', label: 'Cancelled' },
    NO_SHOW: { bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40', label: 'No Show' },
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRes || !selectedRoomNumber) return;

    assignRoomToReservation(assigningRes.id, selectedRoomNumber);
    setAssigningRes(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Central Booking Ledger
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Guest Reservations & Room Allocation</h2>
          <p className="text-xs text-slate-300">
            Real-time server-validated bookings, conflict-free room assignments, and check-in workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWalkIn}
            className="px-4 py-2 rounded-xl bg-[#162035] border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#c5a059]" />
            <span>Walk-In</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                statusFilter === st
                  ? 'bg-[#c5a059] text-slate-950'
                  : 'bg-[#162035] text-slate-300 hover:bg-[#1f2c47]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ref #, guest, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#162035] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-[#0d1424] border border-[#222f49] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#121a2d] border-b border-white/10 text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Guest Information</th>
                <th className="p-3.5">Category & Room</th>
                <th className="p-3.5">Check-In / Out</th>
                <th className="p-3.5 text-center">Nights</th>
                <th className="p-3.5 text-right">Tariff Total</th>
                <th className="p-3.5 text-right">Advance Paid</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredReservations.map((res) => {
                const cat = categories.find((c) => c.id === res.categoryId);

                return (
                  <tr key={res.id} className="hover:bg-[#141e33] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#f5e6c8]">
                      {res.bookingRef}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal uppercase">
                        {res.bookingSource.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-white">{res.guestName}</p>
                      <p className="text-[11px] text-slate-400">{res.guestPhone}</p>
                      {res.guestIdNumber && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified: {res.guestIdType}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-200">{cat?.name}</p>
                      {res.roomNumber ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/20 text-[#f5e6c8] border border-[#c5a059]/30 mt-0.5">
                          Room {res.roomNumber}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 mt-0.5">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>
                        <strong>In:</strong> {res.checkInDate}
                      </div>
                      <div className="text-slate-400">
                        <strong>Out:</strong> {res.checkOutDate}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-300">
                      {res.totalNights}N
                    </td>
                    <td className="p-3.5 text-right font-bold text-white">
                      {formatCurrencyINR(res.roomTotal)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-400">
                      {formatCurrencyINR(res.advanceDeposit)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusBadges[res.bookingStatus].bg
                        }`}
                      >
                        {statusBadges[res.bookingStatus].label}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {res.bookingStatus === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => {
                                setAssigningRes(res);
                                setSelectedRoomNumber(res.roomNumber || '');
                              }}
                              className="p-1.5 rounded-lg bg-[#182338] hover:bg-[#c5a059] text-slate-300 hover:text-slate-950 transition-colors"
                              title="Assign / Reallocate Room"
                            >
                              <Bed className="w-4 h-4" />
                            </button>

                            {res.roomNumber && (
                              <button
                                onClick={() => checkInGuest(res.id, res.roomNumber!)}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider"
                                title="Check In"
                              >
                                Check In
                              </button>
                            )}

                            <button
                              onClick={() => cancelReservation(res.id, 'Cancelled from staff console')}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onViewInvoice(res.id)}
                          className="p-1.5 rounded-lg bg-[#182338] hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Tax Invoice"
                        >
                          <FileText className="w-4 h-4 text-[#c5a059]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Room Modal */}
      {assigningRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-base font-bold text-white">
                Allocate Room for {assigningRes.guestName}
              </h3>
              <button
                onClick={() => setAssigningRes(null)}
                className="p-1 rounded bg-slate-800 text-slate-300"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-[#162035] text-slate-300 space-y-1">
                <p>
                  Dates: <strong>{assigningRes.checkInDate}</strong> to{' '}
                  <strong>{assigningRes.checkOutDate}</strong> ({assigningRes.totalNights} Nights)
                </p>
                <p>
                  Requested Category:{' '}
                  <strong className="text-[#c5a059]">
                    {categories.find((c) => c.id === assigningRes.categoryId)?.name}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Available Physical Room Number *
                </label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Room --</option>
                  {rooms
                    .filter((r) => r.categoryId === assigningRes.categoryId)
                    .map((r) => {
                      const avail = isRoomAvailable(
                        r.roomNumber,
                        assigningRes.checkInDate,
                        assigningRes.checkOutDate,
                        assigningRes.id
                      );
                      return (
                        <option
                          key={r.roomNumber}
                          value={r.roomNumber}
                          disabled={!avail}
                          className={avail ? 'text-white' : 'text-slate-500'}
                        >
                          Room {r.roomNumber} (Floor {r.floor}) —{' '}
                          {avail ? 'Available' : 'Booked/Overlap'}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningRes(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] text-slate-950 font-bold uppercase tracking-wider hover:brightness-110"
                >
                  Confirm Room Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

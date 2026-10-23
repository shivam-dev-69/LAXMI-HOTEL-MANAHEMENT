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
  Eye,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react';
import { Reservation, Room } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';
import { CheckOutSettlementModal } from '../modals/CheckOutSettlementModal.tsx';
import { WalkInCheckInModal } from '../modals/WalkInCheckInModal.tsx';

export const ReceptionView: React.FC = () => {
  const {
    rooms,
    categories,
    reservations,
    updateRoomStatus,
    updateRoomCleanliness,
    folios,
    setActiveInvoice,
    createHousekeepingTask,
  } = useHotel();

  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInRoomNumber, setWalkInRoomNumber] = useState<string | undefined>(undefined);
  const [checkoutReservation, setCheckoutReservation] = useState<Reservation | null>(null);

  const floors = [1, 2, 3, 4];

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'ALL' && r.floor !== selectedFloor) return false;
    if (guestSearch.trim()) {
      const q = guestSearch.toLowerCase();
      const matchNum = r.roomNumber.toLowerCase().includes(q);
      const matchGuest = r.currentGuestName?.toLowerCase().includes(q);
      return matchNum || matchGuest;
    }
    return true;
  });

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Available',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          dot: 'bg-rose-500',
          label: 'Occupied',
        };
      case 'RESERVED':
        return {
          bg: 'bg-blue-50 border-blue-300 text-blue-800',
          dot: 'bg-blue-600',
          label: 'Reserved',
        };
      case 'DIRTY':
      case 'CLEANING':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          dot: 'bg-amber-500',
          label: status === 'CLEANING' ? 'Cleaning...' : 'Dirty',
        };
      case 'MAINTENANCE':
      case 'OUT_OF_SERVICE':
        return {
          bg: 'bg-purple-50 border-purple-300 text-purple-800',
          dot: 'bg-purple-600',
          label: 'Maintenance',
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const currentResForSelected = selectedRoom?.currentReservationId
    ? reservations.find((r) => r.id === selectedRoom.currentReservationId)
    : reservations.find((r) => r.roomNumber === selectedRoom?.roomNumber && r.bookingStatus === 'CHECKED_IN');

  const folioForSelected = currentResForSelected
    ? folios.find((f) => f.reservationId === currentResForSelected.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Reception Top Bar (Royal Navy Luxury Banner) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1e3f] border-2 border-[#c5a059]/40 p-6 rounded-2xl shadow-xl glow-blue">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5e6c8] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#c5a059]" />
            Front Office & Room Allocation Grid
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Live Floor & Room Matrix</h2>
          <p className="text-xs text-blue-200">
            Real-time occupancy management, keycard issuance, and departure settlements for Gomti Nagar inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setWalkInRoomNumber(undefined);
            setIsWalkInOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 flex items-center gap-2 cursor-pointer transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>New Walk-In Registration</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Floor Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFloor === 'ALL'
                ? 'bg-[#0f2b5c] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Floors
          </button>
          {floors.map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFloor === fl
                  ? 'bg-[#0f2b5c] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        {/* Room / Guest Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search room # or guest name..."
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
          />
        </div>
      </div>

      {/* Main Floor Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rooms Matrix Cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredRooms.map((room) => {
              const category = categories.find((c) => c.id === room.categoryId);
              const badge = getStatusBadge(room.status);
              const isSelected = selectedRoom?.roomNumber === room.roomNumber;

              return (
                <button
                  key={room.roomNumber}
                  onClick={() => handleRoomClick(room)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs card-glow-hover ${
                    isSelected
                      ? 'border-[#0f2b5c] ring-2 ring-[#0f2b5c]/30 bg-blue-50/60'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        Floor {room.floor}
                      </span>
                      <span className="font-serif text-2xl font-black text-[#0a1e3f]">
                        {room.roomNumber}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 w-full space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      {category?.name || 'Deluxe'}
                    </p>
                    {room.currentGuestName ? (
                      <p className="text-[11px] text-[#0f2b5c] font-bold truncate flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#c5a059] shrink-0" />
                        <span>{room.currentGuestName}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        {formatCurrencyINR(category?.basePrice || 0)}/night
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Room Action Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          {selectedRoom ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Room Details</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      getStatusBadge(selectedRoom.status).bg
                    }`}
                  >
                    {selectedRoom.status}
                  </span>
                </div>
                <h3 className="font-serif text-3xl font-black text-[#0a1e3f] mt-1">
                  Room {selectedRoom.roomNumber}
                </h3>
                <p className="text-xs text-[#0f2b5c] font-bold">
                  {categories.find((c) => c.id === selectedRoom.categoryId)?.name} (Floor {selectedRoom.floor})
                </p>
              </div>

              {/* Status Specific Details */}
              {selectedRoom.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Sanitized & Ready for Check-in
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      This room has been cleaned, inspected, and verified with fresh linens.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setWalkInRoomNumber(selectedRoom.roomNumber);
                      setIsWalkInOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-[#c5a059]" />
                    <span>Check In Walk-In Guest into Room {selectedRoom.roomNumber}</span>
                  </button>

                  <button
                    onClick={() =>
                      updateRoomStatus(selectedRoom.roomNumber, 'DIRTY', 'Flagged by receptionist for inspection')
                    }
                    className="w-full py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold border border-slate-200 cursor-pointer"
                  >
                    Mark as Needs Turnover Cleaning
                  </button>
                </div>
              )}

              {selectedRoom.status === 'OCCUPIED' && currentResForSelected && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Active In-House Guest
                    </span>
                    <p className="font-bold text-[#0a1e3f] text-sm">{currentResForSelected.guestName}</p>
                    <p className="text-slate-600 text-[11px]">
                      Phone: <strong className="text-slate-800">{currentResForSelected.guestPhone}</strong>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Check-In: {currentResForSelected.checkInDate} | Expected Departure: {currentResForSelected.checkOutDate}
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Advance Paid: <strong className="text-emerald-700">{formatCurrencyINR(currentResForSelected.advanceDeposit)}</strong>
                    </p>

                    {folioForSelected && (
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-800">
                        <span>Current Folio Balance:</span>
                        <span className="text-[#0f2b5c]">{formatCurrencyINR(folioForSelected.balanceDue)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setCheckoutReservation(currentResForSelected)}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Settle Folio & Check Out Guest</span>
                  </button>
                </div>
              )}

              {(selectedRoom.status === 'DIRTY' || selectedRoom.status === 'CLEANING') && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <p className="font-bold text-amber-800">Awaiting Turnover Cleaning</p>
                    <p className="text-slate-600 text-[11px]">
                      {selectedRoom.notes || 'Room requires complete sanitization and linen replacement.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      createHousekeepingTask({
                        roomNumber: selectedRoom.roomNumber,
                        floor: selectedRoom.floor,
                        taskType: 'DEPARTURE_CLEAN',
                        priority: 'URGENT',
                        notes: 'Urgent reception request for quick turnover',
                      });
                      updateRoomStatus(selectedRoom.roomNumber, 'CLEANING', 'Housekeeping dispatched');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold uppercase tracking-wider text-xs hover:brightness-110 shadow-sm cursor-pointer"
                  >
                    Dispatch Housekeeping (Urgent)
                  </button>

                  <button
                    onClick={() => {
                      updateRoomCleanliness(selectedRoom.roomNumber, true);
                      updateRoomStatus(selectedRoom.roomNumber, 'AVAILABLE', 'Marked ready by supervisor');
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 cursor-pointer"
                  >
                    Force Mark as Clean & Available
                  </button>
                </div>
              )}

              {selectedRoom.status === 'MAINTENANCE' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-purple-800">
                      <Wrench className="w-4 h-4 text-purple-600" />
                      Maintenance Hold
                    </p>
                    <p className="text-slate-600 text-[11px]">{selectedRoom.notes || 'Engineering work in progress.'}</p>
                  </div>

                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.roomNumber, 'DIRTY', 'Work finished. Needs cleaning.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold text-xs border border-slate-200 cursor-pointer"
                  >
                    Mark Repairs Finished (Send to Cleaning)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bed className="w-8 h-8 text-[#0f2b5c] mx-auto opacity-40" />
              <p className="font-bold text-[#0a1e3f]">Select a Room from the Grid</p>
              <p className="text-[11px] text-slate-500">
                Click any room box above to inspect its active folio, perform walk-in check-in, or settle checkout.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isWalkInOpen && (
        <WalkInCheckInModal
          preselectedRoomNumber={walkInRoomNumber}
          onClose={() => setIsWalkInOpen(false)}
        />
      )}

      {checkoutReservation && (
        <CheckOutSettlementModal
          reservation={checkoutReservation}
          onClose={() => setCheckoutReservation(null)}
        />
      )}
    </div>
  );
};

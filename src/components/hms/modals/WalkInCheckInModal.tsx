/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, KeyRound, ShieldCheck, UserCheck, Users, X } from 'lucide-react';
import { IdProofType } from '../../../types/hotel.ts';
import { calculateRoomTariff, calculateStayNights, calculateTaxesAndTotals, formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

interface WalkInCheckInModalProps {
  onClose: () => void;
  preselectedRoomNumber?: string;
}

export const WalkInCheckInModal: React.FC<WalkInCheckInModalProps> = ({
  onClose,
  preselectedRoomNumber,
}) => {
  const { rooms, categories, createReservation, checkInGuest, settings } = useHotel();

  // Find available rooms
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    preselectedRoomNumber || availableRooms[0]?.roomNumber || ''
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrow);
  const [adults, setAdults] = useState<number>(2);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestIdType, setGuestIdType] = useState<IdProofType>('AADHAAR');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState('');

  const targetRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);
  const targetCategory = categories.find((c) => c.id === targetRoom?.categoryId) || categories[0];

  const nights = calculateStayNights(today, checkOutDate);
  const tariff = calculateRoomTariff(
    targetCategory?.basePrice || 3000,
    today,
    checkOutDate,
    adults,
    targetCategory?.capacityAdults || 2,
    targetCategory?.extraAdultPrice || 500
  );

  const taxTotals = calculateTaxesAndTotals(
    tariff.subtotal,
    0,
    0,
    0,
    settings.cgstRatePercent,
    settings.sgstRatePercent
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !selectedRoomNumber) return;

    const res = createReservation({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || 'walkin@laxmihotel.com',
      guestPhone: guestPhone.trim(),
      guestAddress: guestAddress.trim(),
      guestIdType,
      guestIdNumber: guestIdNumber.trim(),
      categoryId: targetCategory.id,
      roomNumber: selectedRoomNumber,
      checkInDate: today,
      checkOutDate,
      adults,
      children: 0,
      advanceDeposit: Number(advanceDeposit) || 0,
      specialRequests: specialRequests.trim(),
      bookingSource: 'WALK_IN',
    });

    if (res.success && res.reservation) {
      checkInGuest(res.reservation.id, selectedRoomNumber, guestIdType, guestIdNumber.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#2e3e60] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141e33]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">
              Reception Fast Track
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              Walk-In Guest Registration & Immediate Check-In
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Room Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Select Available Room *
              </label>
              <select
                value={selectedRoomNumber}
                onChange={(e) => setSelectedRoomNumber(e.target.value)}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                required
              >
                {availableRooms.map((r) => {
                  const cat = categories.find((c) => c.id === r.categoryId);
                  return (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} — {cat?.name} (Floor {r.floor})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                min={tomorrow}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Adult Occupants
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults (+ Extra Bed)</option>
              </select>
            </div>
          </div>

          {/* Guest Information */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-[#f5e6c8] uppercase tracking-wider text-[11px]">
              Guest Identity & Contact (Mandatory for Police/Govt Log)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Full Name of Guest *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alok Nath Tripathy"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98390 XXXXX"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  ID Proof Type *
                </label>
                <select
                  value={guestIdType}
                  onChange={(e) => setGuestIdType(e.target.value as IdProofType)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="AADHAAR">Aadhaar Card (India)</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Verified ID Document Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5421-9821-1204"
                  value={guestIdNumber}
                  onChange={(e) => setGuestIdNumber(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Guest Residential Address / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Civil Lines, Prayagraj, UP"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Deposit */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="bg-[#141e33] border border-[#273854] rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>
                  Room {selectedRoomNumber} ({targetCategory.name}) • {nights} Night(s)
                </span>
                <span className="font-bold text-white">{formatCurrencyINR(tariff.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Applicable GST (CGST 6% + SGST 6%)</span>
                <span>{formatCurrencyINR(taxTotals.totalTax)}</span>
              </div>
              <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-white text-xs">
                <span>Estimated Total</span>
                <span className="text-[#c5a059]">{formatCurrencyINR(taxTotals.grandTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Advance Deposit Collected (Cash / UPI)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={advanceDeposit}
                  onChange={(e) => setAdvanceDeposit(Number(e.target.value))}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Remaining Balance at Checkout
                </label>
                <div className="w-full bg-[#111929] border border-slate-800 rounded-lg p-2.5 text-xs text-amber-300 font-bold">
                  {formatCurrencyINR(Math.max(0, taxTotals.grandTotal - (advanceDeposit || 0)))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Complete Check-In & Handover Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

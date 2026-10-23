/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Info,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { IdProofType, Reservation, RoomCategory } from '../../types/hotel.ts';
import {
  calculateRoomTariff,
  calculateStayNights,
  calculateTaxesAndTotals,
  formatCurrencyINR,
} from '../../utils/hotelLogic.ts';
import { useHotel } from '../../context/HotelContext.tsx';

interface BookingModalProps {
  initialCategory?: RoomCategory | null;
  onClose: () => void;
  onBookingConfirmed?: (reservation: Reservation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialCategory,
  onClose,
  onBookingConfirmed,
}) => {
  const { categories, createReservation, settings, isRoomAvailable, getAvailableRoomsForCategory } =
    useHotel();

  // Form State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [categoryId, setCategoryId] = useState<string>(
    initialCategory?.id || categories[0]?.id || ''
  );
  const [checkInDate, setCheckInDate] = useState<string>(tomorrow);
  const [checkOutDate, setCheckOutDate] = useState<string>(dayAfter);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestIdType, setGuestIdType] = useState<IdProofType>('AADHAAR');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [depositOption, setDepositOption] = useState<'FULL' | 'ADVANCE_30'>('ADVANCE_30');

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];

  // Derived Calculations
  const nights = calculateStayNights(checkInDate, checkOutDate);
  const tariff = calculateRoomTariff(
    currentCategory.basePrice,
    checkInDate,
    checkOutDate,
    adults,
    currentCategory.capacityAdults,
    currentCategory.extraAdultPrice
  );

  const taxTotals = calculateTaxesAndTotals(
    tariff.subtotal,
    0,
    0,
    0,
    settings.cgstRatePercent,
    settings.sgstRatePercent
  );

  const advanceDepositAmount =
    depositOption === 'FULL'
      ? taxTotals.grandTotal
      : Math.round((taxTotals.grandTotal * 0.3) / 10) * 10;

  // Live availability test
  const availableRooms = getAvailableRoomsForCategory(categoryId, checkInDate, checkOutDate);
  const isAvailable = availableRooms.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAvailable) {
      setErrorMessage(
        `Selected dates have no available rooms in ${currentCategory.name}. Please select different dates or a different category.`
      );
      return;
    }

    if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
      setErrorMessage('Please provide your name, phone number, and email address.');
      return;
    }

    setIsSubmitting(true);

    const result = createReservation({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      guestAddress: guestAddress.trim(),
      guestIdType,
      guestIdNumber: guestIdNumber.trim(),
      categoryId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      advanceDeposit: advanceDepositAmount,
      specialRequests: specialRequests.trim(),
      bookingSource: 'ONLINE_PORTAL',
    });

    setIsSubmitting(false);

    if (result.success && result.reservation) {
      setConfirmedReservation(result.reservation);
      if (onBookingConfirmed) {
        onBookingConfirmed(result.reservation);
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-[#2e3e60] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141e33]">
          <div>
            <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-widest">
              Laxmi Hotel • Instant Reservation
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {confirmedReservation ? 'Booking Confirmed!' : 'Reserve Your Stay in Gomti Nagar'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6">
          {confirmedReservation ? (
            /* Confirmation View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#c5a059] font-bold">
                  Official Reservation Voucher
                </span>
                <h4 className="font-serif text-3xl font-bold text-white">
                  Booking Reference: {confirmedReservation.bookingRef}
                </h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Namaste <strong className="text-white">{confirmedReservation.guestName}</strong>, your room reservation at
                  Laxmi Hotel has been successfully confirmed and allocated.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-[#141e33] border border-[#273854] rounded-xl p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[11px]">Room Category</span>
                  <span className="font-semibold text-white text-sm">{currentCategory.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Room Number</span>
                  <span className="font-bold text-[#c5a059] text-sm">
                    Room {confirmedReservation.roomNumber || 'Pre-allocated'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Stay Period</span>
                  <span className="font-medium text-white">
                    {confirmedReservation.checkInDate} to {confirmedReservation.checkOutDate} ({confirmedReservation.totalNights} Nights)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Occupancy</span>
                  <span className="font-medium text-white">
                    {confirmedReservation.adults} Adults
                    {confirmedReservation.children > 0 ? `, ${confirmedReservation.children} Child` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Advance Deposit Paid</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrencyINR(confirmedReservation.advanceDeposit)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total with GST (12%)</span>
                  <span className="font-bold text-white text-sm">
                    {formatCurrencyINR(taxTotals.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Check-in Instructions */}
              <div className="p-4 rounded-xl bg-[#1b253b]/60 border border-white/5 text-xs text-slate-300 text-left space-y-1.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                  Check-in Guidelines:
                </p>
                <p>• Standard Check-in is at 12:00 PM. Please present your Booking Ref at the reception desk.</p>
                <p>• Carry original Government ID proof (Aadhaar / Passport / Voter ID) for verification.</p>
                <p>• Our hotel is located at TCG 4/4 Vibhuti Khand, Gomti Nagar (Near High Court), Lucknow.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all"
                >
                  Done & Back to Website
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Category & Dates */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5e6c8]">
                  1. Room Category & Stay Dates
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Select Room Type
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {formatCurrencyINR(c.basePrice)}/night ({c.acType}, {c.bedType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      min={checkInDate}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Total Nights
                    </label>
                    <div className="w-full bg-[#111929] border border-slate-800 rounded-lg p-2.5 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{nights} Night(s) Stay</span>
                    </div>
                  </div>
                </div>

                {/* Occupancy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Adults (Age 12+)
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults (Standard Double)</option>
                      <option value={3}>
                        3 Adults (+{formatCurrencyINR(currentCategory.extraAdultPrice)} extra bed/night)
                      </option>
                      <option value={4}>4 Adults (Family / Group)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Children (Under 12)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child (Complimentary with parents)</option>
                      <option value={2}>2 Children</option>
                    </select>
                  </div>
                </div>

                {/* Live Availability Banner */}
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    isAvailable
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    ></span>
                    <span>
                      {isAvailable
                        ? `Live Inventory Available: ${availableRooms.length} room(s) ready`
                        : 'No rooms available in this category for the selected dates.'}
                    </span>
                  </div>
                  {isAvailable && (
                    <span className="text-[11px] font-semibold uppercase text-emerald-400">
                      Guaranteed Instant Confirmation
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Guest Details */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5e6c8]">
                  2. Guest Identification & Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Primary Guest Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandra Sharma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Contact Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Email Address (For Tax Invoice) *
                    </label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      City / State of Residence
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi / Kanpur"
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Govt. Photo ID Type
                    </label>
                    <select
                      value={guestIdType}
                      onChange={(e) => setGuestIdType(e.target.value as IdProofType)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="AADHAAR">Aadhaar Card (India)</option>
                      <option value="PASSPORT">Passport (International/NRI)</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="VOTER_ID">Voter ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      ID Document Number (Optional pre-checkin)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5421-XXXX-XXXX"
                      value={guestIdNumber}
                      onChange={(e) => setGuestIdNumber(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Special Requests / Airport Pickup / Extra Pillows
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mention arrival time, dietary preference or taxi pickup requirements..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Tariff Breakdown & Advance Deposit */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5e6c8]">
                  3. Pricing & GST Tariff Summary
                </h4>

                <div className="bg-[#141e33] border border-[#273854] rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>
                      {currentCategory.name} ({nights} Night(s) @ {formatCurrencyINR(tariff.effectiveNightlyRate)}/night)
                    </span>
                    <span className="font-semibold text-white">{formatCurrencyINR(tariff.subtotal)}</span>
                  </div>

                  {tariff.extraAdults > 0 && (
                    <div className="flex justify-between text-amber-300 text-[11px]">
                      <span>
                        Extra Guest Charge ({tariff.extraAdults} person @ {formatCurrencyINR(currentCategory.extraAdultPrice)}/night)
                      </span>
                      <span>Included above</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Central GST (CGST @ {settings.cgstRatePercent}%)</span>
                    <span>{formatCurrencyINR(taxTotals.cgstAmount)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>State GST (SGST @ {settings.sgstRatePercent}%)</span>
                    <span>{formatCurrencyINR(taxTotals.sgstAmount)}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                    <span>Total Estimated Bill (Inclusive of all taxes)</span>
                    <span className="text-[#c5a059] text-base">{formatCurrencyINR(taxTotals.grandTotal)}</span>
                  </div>
                </div>

                {/* Advance Option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      depositOption === 'ADVANCE_30'
                        ? 'bg-[#1b253b] border-[#c5a059] text-white'
                        : 'bg-[#121929] border-white/5 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deposit"
                      checked={depositOption === 'ADVANCE_30'}
                      onChange={() => setDepositOption('ADVANCE_30')}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Pay 30% Advance Deposit ({formatCurrencyINR(advanceDepositAmount)})
                      </p>
                      <p className="text-[11px] text-slate-400">Balance payable at hotel checkout</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      depositOption === 'FULL'
                        ? 'bg-[#1b253b] border-[#c5a059] text-white'
                        : 'bg-[#121929] border-white/5 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deposit"
                      checked={depositOption === 'FULL'}
                      onChange={() => setDepositOption('FULL')}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Pay 100% Full Amount ({formatCurrencyINR(taxTotals.grandTotal)})
                      </p>
                      <p className="text-[11px] text-slate-400">Fast-track express check-in</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[11px] text-slate-400 block">Due Now</span>
                  <span className="font-serif text-2xl font-bold text-white">
                    {formatCurrencyINR(advanceDepositAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isAvailable || isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 transition-all w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isSubmitting ? 'Confirming...' : 'Confirm & Reserve Room'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

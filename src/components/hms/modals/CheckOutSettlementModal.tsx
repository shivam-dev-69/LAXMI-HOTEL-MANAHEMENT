/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  LogOut,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PaymentRecord, Reservation } from '../../../types/hotel.ts';
import { calculateFolioSummary, formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

interface CheckOutSettlementModalProps {
  reservation: Reservation;
  onClose: () => void;
  onInvoiceGenerated?: (invoiceId: string) => void;
}

export const CheckOutSettlementModal: React.FC<CheckOutSettlementModalProps> = ({
  reservation,
  onClose,
  onInvoiceGenerated,
}) => {
  const { folios, settings, checkOutGuest, setActiveInvoice, currentUser } = useHotel();
  const folio = folios.find((f) => f.reservationId === reservation.id);

  const folioSummary = folio
    ? calculateFolioSummary(folio.items, settings.cgstRatePercent, settings.sgstRatePercent)
    : {
        roomCharges: reservation.roomTotal,
        canteenCharges: 0,
        otherCharges: 0,
        discounts: 0,
        taxableAmount: reservation.roomTotal,
        cgstAmount: (reservation.roomTotal * 6) / 100,
        sgstAmount: (reservation.roomTotal * 6) / 100,
        grandTotal: reservation.roomTotal * 1.12,
        totalPayments: reservation.advanceDeposit,
        balanceDue: Math.max(0, reservation.roomTotal * 1.12 - reservation.advanceDeposit),
        paymentStatus: 'UNPAID' as any,
      };

  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('UPI');
  const [paymentRef, setPaymentRef] = useState<string>(
    'PAY-' + Math.floor(10000 + Math.random() * 90000)
  );

  const netBalanceDue = Math.max(0, folioSummary.balanceDue - (Number(discountAmount) || 0));

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentRecord =
      netBalanceDue > 0
        ? {
            amount: netBalanceDue,
            method: paymentMethod,
            reference: paymentRef.trim() || 'CASH-REC',
          }
        : undefined;

    const result = checkOutGuest(
      reservation.id,
      paymentRecord,
      Number(discountAmount) || 0,
      discountReason.trim() || undefined
    );

    if (result.success && result.invoice) {
      setActiveInvoice(result.invoice);
      if (onInvoiceGenerated) {
        onInvoiceGenerated(result.invoice.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#2e3e60] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141e33]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">
              Reception Departure Desk
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              Guest Check-Out & Final Billing Settlement
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
        <form onSubmit={handleCheckoutSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Guest Stay Summary Card */}
          <div className="p-4 rounded-xl bg-[#141e33] border border-[#273854] space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-white">{reservation.guestName}</p>
                <p className="text-[11px] text-slate-400">
                  Room {reservation.roomNumber} • Booking Ref: {reservation.bookingRef}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/20 text-[#f5e6c8] border border-[#c5a059]/30">
                {reservation.totalNights} Night(s) Stay
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Stay Dates: {reservation.checkInDate} to {reservation.checkOutDate} ({reservation.adults} Adults)
            </p>
          </div>

          {/* Folio Items Breakdown */}
          <div className="p-4 rounded-xl bg-[#101828] border border-white/5 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-300 block text-[11px]">
              Itemized Folio Transactions
            </span>

            {folio?.items && folio.items.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-40 overflow-y-auto">
                {folio.items.map((it) => (
                  <div key={it.id} className="py-1.5 flex justify-between text-slate-300">
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
                      {it.category === 'PAYMENT' ? '(-) ' : ''}
                      {formatCurrencyINR(it.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Standard Room Stay: {formatCurrencyINR(reservation.roomTotal)}</p>
            )}

            <div className="pt-2 border-t border-white/10 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Room Charges</span>
                <span>{formatCurrencyINR(folioSummary.roomCharges)}</span>
              </div>
              {folioSummary.canteenCharges > 0 && (
                <div className="flex justify-between">
                  <span>Awadhi Canteen & Room Service</span>
                  <span>{formatCurrencyINR(folioSummary.canteenCharges)}</span>
                </div>
              )}
              {folioSummary.otherCharges > 0 && (
                <div className="flex justify-between">
                  <span>Extras / Laundry</span>
                  <span>{formatCurrencyINR(folioSummary.otherCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes (CGST 6% + SGST 6%)</span>
                <span>{formatCurrencyINR(folioSummary.cgstAmount + folioSummary.sgstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-white/5">
                <span>Grand Total</span>
                <span>{formatCurrencyINR(folioSummary.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Advance Deposit Paid</span>
                <span>(-) {formatCurrencyINR(folioSummary.totalPayments)}</span>
              </div>
            </div>
          </div>

          {/* Optional Authorized Courtesy Discount */}
          <div className="p-3.5 rounded-xl bg-[#141e30] border border-white/5 space-y-2">
            <span className="font-semibold text-slate-200 block text-[11px]">
              Apply Courtesy Discount (Manager Authorization)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Discount Amount (₹)"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Corporate / Stay delay)"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Settlement Collection */}
          <div className="p-4 rounded-xl bg-[#162035] border border-[#c5a059]/40 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-white">Remaining Net Balance Due</span>
              <span className="font-serif text-2xl font-bold text-[#c5a059]">
                {formatCurrencyINR(netBalanceDue)}
              </span>
            </div>

            {netBalanceDue > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">
                  Collect Payment Via
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'CARD', 'CASH', 'BANK_TRANSFER'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-lg font-bold text-center border text-[11px] ${
                        paymentMethod === m
                          ? 'bg-[#c5a059] text-slate-950 border-[#c5a059]'
                          : 'bg-[#101828] text-slate-300 border-white/5'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Transaction / POS Reference Number
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-[#101828] border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Housekeeping Notification Warning */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Checking out will immediately switch Room {reservation.roomNumber} to <strong>DIRTY</strong> and assign
              a departure turnover cleaning task to Housekeeping.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Complete Check-Out & Generate Tax Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

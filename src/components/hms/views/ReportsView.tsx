/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const ReportsView: React.FC = () => {
  const { invoices, rooms, reservations, orders, categories, settings } = useHotel();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30'>('ALL');

  // Aggregated calculations derived directly from saved immutable database records
  const totalGrossInvoiced = invoices.reduce((s, inv) => s + inv.grandTotal, 0);
  const totalRoomRevenue = invoices.reduce((s, inv) => s + inv.roomSubtotal, 0);
  const totalCanteenRevenue = invoices.reduce((s, inv) => s + inv.canteenSubtotal, 0);
  const totalOtherRevenue = invoices.reduce((s, inv) => s + inv.extrasSubtotal, 0);
  const totalDiscounts = invoices.reduce((s, inv) => s + inv.discountAmount, 0);

  // Taxes
  const totalCgst = invoices.reduce((s, inv) => s + inv.cgstAmount, 0);
  const totalSgst = invoices.reduce((s, inv) => s + inv.sgstAmount, 0);
  const totalTaxCollected = totalCgst + totalSgst;
  const netRevenue = totalGrossInvoiced - totalTaxCollected;

  // Payments Reconciliation
  let paymentCash = 0;
  let paymentUpi = 0;
  let paymentCard = 0;
  let paymentBank = 0;

  for (const inv of invoices) {
    for (const p of inv.paymentsReceived) {
      if (p.method === 'CASH') paymentCash += p.amount;
      else if (p.method === 'UPI') paymentUpi += p.amount;
      else if (p.method === 'CARD') paymentCard += p.amount;
      else if (p.method === 'BANK_TRANSFER') paymentBank += p.amount;
    }
  }

  // Occupancy metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Average Daily Rate (ADR) = Room Revenue / Rooms Sold
  const totalNightsSold = reservations.reduce((s, r) => s + (r.bookingStatus !== 'CANCELLED' ? r.totalNights : 0), 0);
  const adr = totalNightsSold > 0 ? Math.round(totalRoomRevenue / totalNightsSold) : 0;
  // Revenue Per Available Room (RevPAR) = Total Room Revenue / Total Available Rooms
  const revpar = totalRooms > 0 ? Math.round(totalRoomRevenue / totalRooms) : 0;

  // CSV Export Generator
  const exportToCsv = () => {
    const headers = [
      'Invoice Number',
      'Booking Ref',
      'Guest Name',
      'Room Number',
      'Check In',
      'Check Out',
      'Nights',
      'Room Charges',
      'F&B Canteen',
      'Extras',
      'Discount',
      'Taxable Amount',
      'CGST (6%)',
      'SGST (6%)',
      'Grand Total',
      'Advance Paid',
      'Balance Due',
      'Payment Status',
      'Generated Date',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.bookingRef,
      `"${inv.guestDetails.name}"`,
      inv.roomDetails.roomNumber,
      inv.stayPeriod.checkInDate,
      inv.stayPeriod.checkOutDate,
      inv.stayPeriod.totalNights,
      inv.roomSubtotal,
      inv.canteenSubtotal,
      inv.extrasSubtotal,
      inv.discountAmount,
      inv.taxableAmount,
      inv.cgstAmount,
      inv.sgstAmount,
      inv.grandTotal,
      inv.advanceDeposit,
      inv.balanceDue,
      inv.paymentStatus,
      inv.generatedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laxmi_Hotel_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Financial Audit & Analytics Desk
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">
            Revenue, GST & Hospitality Performance
          </h2>
          <p className="text-xs text-slate-300">
            Certified accounting summaries derived from immutable database transactions and Indian tax slabs.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Full Ledger to CSV</span>
        </button>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Billed Sales */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-lg space-y-2">
          <span className="text-xs font-semibold text-slate-400">Gross Invoiced Revenue</span>
          <p className="font-serif text-3xl font-bold text-white">
            {formatCurrencyINR(totalGrossInvoiced)}
          </p>
          <span className="text-[11px] text-slate-500">Inclusive of room stay & F&B</span>
        </div>

        {/* Total GST Tax Collected */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-lg space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total GST Collected (12%)</span>
          <p className="font-serif text-3xl font-bold text-sky-400">
            {formatCurrencyINR(totalTaxCollected)}
          </p>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>CGST: {formatCurrencyINR(totalCgst)}</span>
            <span>SGST: {formatCurrencyINR(totalSgst)}</span>
          </div>
        </div>

        {/* Average Daily Rate */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-lg space-y-2">
          <span className="text-xs font-semibold text-slate-400">Average Daily Rate (ADR)</span>
          <p className="font-serif text-3xl font-bold text-[#c5a059]">
            {formatCurrencyINR(adr)}
          </p>
          <span className="text-[11px] text-slate-500">Across {totalNightsSold} guest room nights</span>
        </div>

        {/* RevPAR */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-lg space-y-2">
          <span className="text-xs font-semibold text-slate-400">RevPAR (Per Available Room)</span>
          <p className="font-serif text-3xl font-bold text-emerald-400">
            {formatCurrencyINR(revpar)}
          </p>
          <span className="text-[11px] text-slate-500">{occupancyPercentage}% live occupancy rate</span>
        </div>
      </div>

      {/* Revenue Breakdown & Payment Mode Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departmental Revenue Mix */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#c5a059]" />
            Departmental Revenue Streams
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Room Stay & Suites Tariff</span>
                <span className="font-bold text-white">{formatCurrencyINR(totalRoomRevenue)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#c5a059] h-full"
                  style={{
                    width: `${totalGrossInvoiced > 0 ? (totalRoomRevenue / totalGrossInvoiced) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Awadhi Canteen & In-Room Dining</span>
                <span className="font-bold text-white">{formatCurrencyINR(totalCanteenRevenue)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${totalGrossInvoiced > 0 ? (totalCanteenRevenue / totalGrossInvoiced) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Other Hotel Services (Laundry/Amenities)</span>
                <span className="font-bold text-white">{formatCurrencyINR(totalOtherRevenue)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full"
                  style={{
                    width: `${totalGrossInvoiced > 0 ? (totalOtherRevenue / totalGrossInvoiced) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between text-slate-400">
              <span>Authorized Courtesy Discounts Applied:</span>
              <span className="text-rose-400 font-semibold">-{formatCurrencyINR(totalDiscounts)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Reconciliation */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#c5a059]" />
            Payment Instrument Reconciliation
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#141e33] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Unified Payments Interface (UPI)</p>
                <p className="text-[11px] text-slate-400">Google Pay, PhonePe, BHIM QR</p>
              </div>
              <span className="font-serif text-lg font-bold text-[#c5a059]">
                {formatCurrencyINR(paymentUpi)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141e33] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Credit / Debit Card Terminal POS</p>
                <p className="text-[11px] text-slate-400">Visa, MasterCard, RuPay</p>
              </div>
              <span className="font-serif text-lg font-bold text-sky-400">
                {formatCurrencyINR(paymentCard)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141e33] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Cash Currency</p>
                <p className="text-[11px] text-slate-400">Reception cash till receipts</p>
              </div>
              <span className="font-serif text-lg font-bold text-emerald-400">
                {formatCurrencyINR(paymentCash)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141e33] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Bank NEFT / RTGS Transfer</p>
                <p className="text-[11px] text-slate-400">Corporate direct billing</p>
              </div>
              <span className="font-serif text-lg font-bold text-purple-400">
                {formatCurrencyINR(paymentBank)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

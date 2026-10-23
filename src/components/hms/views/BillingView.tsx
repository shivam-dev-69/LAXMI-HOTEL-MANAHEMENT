/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Invoice, PaymentStatus } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

interface BillingViewProps {
  onViewInvoice: (invoice: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onViewInvoice }) => {
  const { invoices, recordInvoicePayment } = useHotel();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Record Payment Modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'BANK_TRANSFER'>('UPI');
  const [payRef, setPayRef] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.paymentStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchInv = inv.invoiceNumber.toLowerCase().includes(q);
      const matchGuest = inv.guestDetails.name.toLowerCase().includes(q);
      const matchRef = inv.bookingRef.toLowerCase().includes(q);
      const matchRoom = inv.roomDetails.roomNumber.toLowerCase().includes(q);
      return matchInv || matchGuest || matchRef || matchRoom;
    }
    return true;
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalCollected = invoices.reduce(
    (s, i) => s + (i.advanceDeposit + i.paymentsReceived.reduce((pSum, p) => pSum + p.amount, 0)),
    0
  );
  const totalPending = invoices.reduce((s, i) => s + i.balanceDue, 0);

  const statusBadges: Record<PaymentStatus, { bg: string; label: string }> = {
    PAID: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', label: 'Paid in Full' },
    PARTIALLY_PAID: { bg: 'bg-amber-50 text-amber-800 border-amber-300', label: 'Partially Paid' },
    UNPAID: { bg: 'bg-rose-50 text-rose-800 border-rose-300', label: 'Unpaid / Pending' },
    REFUNDED: { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Refunded' },
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || payAmount <= 0) return;

    recordInvoicePayment(payingInvoice.id, {
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef.trim() || 'MANUAL-REC',
      collectedBy: 'Accounts Desk',
    });

    setPayingInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header (Royal Navy Luxury Banner) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1e3f] border-2 border-[#c5a059]/40 p-6 rounded-2xl shadow-xl glow-blue">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5e6c8] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
            Financial Management & Tax Compliance
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">GST Tax Invoices & Billing Archive</h2>
          <p className="text-xs text-blue-200">
            Immutable official Indian GST invoices (SAC 9963) with itemized stay, F&B, advance credits, and audit records.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs card-glow-hover">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Billed Volume</span>
          <p className="font-serif text-3xl font-bold text-[#0f2b5c] mt-1">
            {formatCurrencyINR(totalInvoiced)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">{invoices.length} invoices generated</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs card-glow-hover">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Payments Realized</span>
          <p className="font-serif text-3xl font-bold text-emerald-700 mt-1">
            {formatCurrencyINR(totalCollected)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Cash, UPI & POS verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs card-glow-hover">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Outstanding Receivables</span>
          <p className="font-serif text-3xl font-bold text-amber-600 mt-1">
            {formatCurrencyINR(totalPending)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Pending checkout settlement</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PAID', 'PARTIALLY_PAID', 'UNPAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0f2b5c] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            placeholder="Search invoice #, guest, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#0a1e3f] uppercase tracking-wider font-bold text-[11px]">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Guest & Room</th>
                <th className="p-3.5">Stay Dates</th>
                <th className="p-3.5 text-right">Taxable</th>
                <th className="p-3.5 text-right">GST (12%)</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#0f2b5c]">
                    {inv.invoiceNumber}
                    <span className="block text-[10px] text-slate-500 font-sans font-normal">
                      Ref: {inv.bookingRef}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-[#0a1e3f]">{inv.guestDetails.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Room {inv.roomDetails.roomNumber} ({inv.roomDetails.categoryName})
                    </p>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {inv.stayPeriod.checkInDate} to {inv.stayPeriod.checkOutDate}
                    <span className="block text-[10px] text-slate-500">
                      {inv.stayPeriod.totalNights} Night(s)
                    </span>
                  </td>
                  <td className="p-3.5 text-right text-slate-600 font-medium">
                    {formatCurrencyINR(inv.taxableAmount)}
                  </td>
                  <td className="p-3.5 text-right text-slate-500">
                    {formatCurrencyINR(inv.cgstAmount + inv.sgstAmount)}
                  </td>
                  <td className="p-3.5 text-right font-bold text-[#0a1e3f]">
                    {formatCurrencyINR(inv.grandTotal)}
                  </td>
                  <td className="p-3.5 text-right font-bold">
                    <span className={inv.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                      {formatCurrencyINR(inv.balanceDue)}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        statusBadges[inv.paymentStatus].bg
                      }`}
                    >
                      {statusBadges[inv.paymentStatus].label}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-[#0f2b5c] text-[#0f2b5c] hover:text-white transition-colors cursor-pointer"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setPayingInvoice(inv);
                            setPayAmount(inv.balanceDue);
                          }}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase"
                          title="Record Payment"
                        >
                          Collect
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Dialog */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#0a1e3f]">
                Record Payment for {payingInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50/70 text-slate-700 space-y-1 border border-blue-100">
                <p>
                  Guest: <strong className="text-[#0a1e3f]">{payingInvoice.guestDetails.name}</strong>
                </p>
                <p>
                  Outstanding Balance:{' '}
                  <strong className="text-amber-700">{formatCurrencyINR(payingInvoice.balanceDue)}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  max={payingInvoice.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                  Payment Mode
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CARD">Credit / Debit Card POS</option>
                  <option value="CASH">Cash Currency</option>
                  <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9840219"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer transition-all"
                >
                  Save & Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

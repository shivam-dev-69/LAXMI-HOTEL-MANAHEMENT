/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  CheckCircle,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Invoice } from '../../types/hotel.ts';
import { formatCurrencyINR } from '../../utils/hotelLogic.ts';
import { Logo } from '../common/Logo.tsx';

interface PrintableInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusColors = {
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800 border-amber-300',
    UNPAID: 'bg-rose-100 text-rose-800 border-rose-300',
    REFUNDED: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] my-auto">
        {/* Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#141e33] no-print rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c5a059]" />
            <span className="font-serif text-base font-bold text-white">
              Tax Invoice — {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              aria-label="Close invoice modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper (A4 Standard Format) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#090e17] flex justify-center">
          <div
            ref={printRef}
            className="invoice-paper w-full max-w-3xl bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-2xl space-y-6 text-xs font-sans border border-slate-200"
            style={{ color: '#0f172a' }}
          >
            {/* Header: Hotel Branding & Legal Identification */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-slate-900 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#0d1424] flex items-center justify-center p-1 border border-[#c5a059]">
                    <span className="font-serif font-black text-amber-400 text-base">LX</span>
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-black tracking-wider text-slate-950 uppercase">
                      {invoice.hotelSnapshot.name}
                    </h1>
                    <p className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold">
                      Gomti Nagar, Lucknow • Uttar Pradesh
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 max-w-sm pt-1">
                  {invoice.hotelSnapshot.address}, {invoice.hotelSnapshot.locality}, {invoice.hotelSnapshot.city} - {invoice.hotelSnapshot.pincode}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 font-medium">
                  <span>Phone: {invoice.hotelSnapshot.phone}</span>
                  <span>Email: {invoice.hotelSnapshot.email}</span>
                </div>
              </div>

              {/* Tax Invoice Title & GSTIN Info */}
              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-slate-900 text-amber-400">
                  ORIGINAL TAX INVOICE
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">{invoice.invoiceNumber}</p>
                <p className="text-[11px] text-slate-600">
                  <strong>Date:</strong> {new Date(invoice.generatedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(invoice.generatedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-[11px] text-slate-700">
                  <strong>GSTIN:</strong> {invoice.hotelSnapshot.gstin}
                </p>
                <p className="text-[11px] text-slate-700">
                  <strong>SAC Code:</strong> {invoice.hotelSnapshot.sacCode} (Accommodation)
                </p>
              </div>
            </div>

            {/* Billed To / Guest Details & Stay Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {/* Guest Profile */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Billed To / Guest Information
                </span>
                <p className="text-sm font-bold text-slate-900">{invoice.guestDetails.name}</p>
                <p className="text-slate-600 text-[11px]">Phone: {invoice.guestDetails.phone}</p>
                <p className="text-slate-600 text-[11px]">Email: {invoice.guestDetails.email}</p>
                {invoice.guestDetails.address && (
                  <p className="text-slate-600 text-[11px]">Address: {invoice.guestDetails.address}</p>
                )}
                {invoice.guestDetails.idType && (
                  <p className="text-slate-700 text-[11px]">
                    <strong>Govt ID:</strong> {invoice.guestDetails.idType}{' '}
                    {invoice.guestDetails.idNumber ? `(${invoice.guestDetails.idNumber})` : ''}
                  </p>
                )}
              </div>

              {/* Stay & Room Details */}
              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Reservation & Stay Details
                </span>
                <p className="text-slate-800 text-[11px]">
                  <strong>Booking Ref:</strong> {invoice.bookingRef}
                </p>
                <p className="text-sm font-bold text-amber-800">
                  Assigned Room: {invoice.roomDetails.roomNumber} ({invoice.roomDetails.categoryName})
                </p>
                <p className="text-slate-700 text-[11px]">
                  <strong>Check-In:</strong> {invoice.stayPeriod.checkInDate} |{' '}
                  <strong>Check-Out:</strong> {invoice.stayPeriod.checkOutDate}
                </p>
                <p className="text-slate-700 text-[11px]">
                  <strong>Duration:</strong> {invoice.stayPeriod.totalNights} Night(s) •{' '}
                  {invoice.stayPeriod.adults} Adult(s)
                  {invoice.stayPeriod.children > 0 ? `, ${invoice.stayPeriod.children} Child` : ''}
                </p>
              </div>
            </div>

            {/* Itemized Charges Table */}
            <div>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="p-2.5 border border-slate-800 w-12 text-center">#</th>
                    <th className="p-2.5 border border-slate-800">Particulars / Service Description</th>
                    <th className="p-2.5 border border-slate-800 w-20 text-center">HSN/SAC</th>
                    <th className="p-2.5 border border-slate-800 w-16 text-center">Qty</th>
                    <th className="p-2.5 border border-slate-800 w-24 text-right">Rate</th>
                    <th className="p-2.5 border border-slate-800 w-28 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {invoice.itemizedCharges.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="p-2.5 border border-slate-200 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-medium">{item.description}</td>
                      <td className="p-2.5 border border-slate-200 text-center text-slate-600">
                        {item.sacCode}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-center">{item.quantity}</td>
                      <td className="p-2.5 border border-slate-200 text-right">{formatCurrencyINR(item.rate)}</td>
                      <td className="p-2.5 border border-slate-200 text-right font-semibold">
                        {formatCurrencyINR(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals & Tax Slabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Payment Records & Mode Breakdown */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Payment Transactions Received
                  </span>
                  {invoice.paymentsReceived.length > 0 ? (
                    <div className="space-y-1 text-[11px] text-slate-700">
                      {invoice.paymentsReceived.map((p) => (
                        <div key={p.id} className="flex justify-between border-b border-slate-200 pb-1">
                          <span>
                            {p.date} • {p.method} ({p.referenceNumber})
                          </span>
                          <span className="font-semibold text-emerald-800">{formatCurrencyINR(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic">No advance payments recorded.</p>
                  )}
                </div>

                {/* Payment Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-medium text-[11px]">Invoice Settlement Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                      statusColors[invoice.paymentStatus]
                    }`}
                  >
                    {invoice.paymentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Financial Subtotals & Tax Breakdown */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Room Tariff Subtotal</span>
                  <span className="font-semibold">{formatCurrencyINR(invoice.roomSubtotal)}</span>
                </div>

                {invoice.canteenSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>F&B / In-Room Dining Charges</span>
                    <span className="font-semibold">{formatCurrencyINR(invoice.canteenSubtotal)}</span>
                  </div>
                )}

                {invoice.extrasSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Other Services (Laundry/Amenities)</span>
                    <span className="font-semibold">{formatCurrencyINR(invoice.extrasSubtotal)}</span>
                  </div>
                )}

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Authorized Discount ({invoice.discountReason || 'Courtesy'})</span>
                    <span>-{formatCurrencyINR(invoice.discountAmount)}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-300 flex justify-between font-semibold text-slate-800">
                  <span>Taxable Base Value</span>
                  <span>{formatCurrencyINR(invoice.taxableAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Central GST (CGST @ {invoice.cgstRate}%)</span>
                  <span>{formatCurrencyINR(invoice.cgstAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>State GST (SGST @ {invoice.sgstRate}%)</span>
                  <span>{formatCurrencyINR(invoice.sgstAmount)}</span>
                </div>

                <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-950">
                  <span>Grand Total (INR)</span>
                  <span className="text-base">{formatCurrencyINR(invoice.grandTotal)}</span>
                </div>

                <div className="flex justify-between text-emerald-800 font-bold pt-1">
                  <span>Total Payments Settled</span>
                  <span>
                    {formatCurrencyINR(
                      invoice.advanceDeposit +
                        invoice.paymentsReceived.reduce((s, p) => s + p.amount, 0)
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-slate-950 pt-1 border-t border-slate-200">
                  <span>Balance Due at Checkout</span>
                  <span className={invoice.balanceDue > 0 ? 'text-rose-600 font-black' : 'text-emerald-700'}>
                    {formatCurrencyINR(invoice.balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank / UPI Payment QR Text & Authorized Signature */}
            <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div className="space-y-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-900 uppercase">Payment Modes & Remittance:</p>
                <p>• UPI ID: {invoice.hotelSnapshot.email.replace('@', '@upi') || 'laxmihotel@upi'}</p>
                <p>• Bank: State Bank of India, Gomti Nagar Branch (IFSC: SBIN0012984)</p>
                <p className="text-[10px] text-slate-500 pt-1 italic">{invoice.thankYouMessage}</p>
              </div>

              <div className="text-left sm:text-right space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500">Prepared by: {invoice.generatedBy}</p>
                  <p className="text-[10px] font-semibold text-slate-800">
                    For LAXMI HOTEL (Authorized Signatory)
                  </p>
                </div>
                <div className="w-36 border-b border-slate-900 sm:ml-auto"></div>
              </div>
            </div>

            {/* Footer Legal Terms */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
              This is a digitally generated tax invoice per Indian GST Act under SAC code 9963. No physical signature required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

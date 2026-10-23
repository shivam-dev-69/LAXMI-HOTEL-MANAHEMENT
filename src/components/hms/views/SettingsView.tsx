/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { HotelSettings } from '../../../types/hotel.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, currentUser, allUsers } = useHotel();

  const [formData, setFormData] = useState<HotelSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isOwner = currentUser?.role === 'OWNER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Hotel Identity & Tax Configuration
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Hotel Profile, GST & Policies</h2>
          <p className="text-xs text-slate-300">
            Configure legal entity details, Gomti Nagar locality coordinates, Indian GST rates, check-in rules, and bank details.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      {!isOwner && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            You are logged in as <strong>{currentUser?.name} ({currentUser?.role})</strong>. Only Owner / Super Admin
            can modify core business policies and statutory tax rates. Switch role to <strong>OWNER</strong> in the header
            to edit.
          </span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Hotel Legal Identity & Address */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#c5a059]" />
            Hotel Branding & Location in Lucknow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Hotel Business Name
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Marketing Tagline
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Locality / Hub
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Complete Street Address & Landmarks
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                PIN Code
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Primary Phone Helpline
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Official Reservations Email
              </label>
              <input
                type="email"
                disabled={!isOwner}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Website URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Tax & Accounting Configuration */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c5a059]" />
            GST Tax Slabs & Invoice Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                GSTIN (Goods & Services Tax ID)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                HSN / SAC Code (Accommodation)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.sacCode}
                onChange={(e) => setFormData({ ...formData, sacCode: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Central GST Rate (CGST %)
              </label>
              <input
                type="number"
                disabled={!isOwner}
                value={formData.cgstRatePercent}
                onChange={(e) =>
                  setFormData({ ...formData, cgstRatePercent: Number(e.target.value) })
                }
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                State GST Rate (SGST %)
              </label>
              <input
                type="number"
                disabled={!isOwner}
                value={formData.sgstRatePercent}
                onChange={(e) =>
                  setFormData({ ...formData, sgstRatePercent: Number(e.target.value) })
                }
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Default Check-in Time
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.defaultCheckInTime}
                onChange={(e) => setFormData({ ...formData, defaultCheckInTime: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Default Check-out Time
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.defaultCheckOutTime}
                onChange={(e) => setFormData({ ...formData, defaultCheckOutTime: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Printed Invoice Footer / Thank You Note
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.invoiceFooter}
                onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Gateway & Bank Remittance */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-xl space-y-4">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#c5a059]" />
            Bank Accounts & UPI Remittance Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Hotel UPI Virtual Payment Address (VPA)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Bank Name & Branch
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Current Account Number
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        {isOwner && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Hotel Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

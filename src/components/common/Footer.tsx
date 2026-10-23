/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { useHotel } from '../../context/HotelContext.tsx';

export const Footer: React.FC<{ onOpenBooking: () => void; onOpenGuestPortal: () => void }> = ({
  onOpenBooking,
  onOpenGuestPortal,
}) => {
  const { settings, setActiveView, setHmsTab, currentUser, openAuthModal } = useHotel();

  return (
    <footer className="bg-[#0a1e3f] border-t-2 border-[#c5a059]/40 text-blue-100 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-blue-100/90 leading-relaxed text-xs">
              Laxmi Hotel brings timeless Awadhi luxury, sophisticated dining, and impeccable hospitality to the heart of
              Gomti Nagar, Lucknow. Conveniently situated near High Court & Indira Gandhi Pratishthan.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Government Registered & GST Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#f5e6c8]">Hotel Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('rooms-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#c5a059] transition-colors"
                >
                  AC & VIP Deluxe Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('dining-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#c5a059] transition-colors"
                >
                  Awadhi Cuisine & In-Room Dining
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('tourism-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#c5a059] transition-colors"
                >
                  Bara Imambara & Lucknow Sightseeing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('facilities-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#c5a059] transition-colors"
                >
                  Hotel Amenities & Power Backup
                </button>
              </li>
              <li>
                <button onClick={onOpenGuestPortal} className="text-[#c5a059] hover:underline font-medium">
                  Search Booking & View GST Invoice
                </button>
              </li>
            </ul>
          </div>

          {/* Hotel Policies & Regulatory */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#f5e6c8]">Hotel Policies & Hours</h4>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-slate-100">Check-in:</strong> {settings.defaultCheckInTime}
              </p>
              <p>
                <strong className="text-slate-100">Check-out:</strong> {settings.defaultCheckOutTime}
              </p>
              <p>
                <strong className="text-slate-100">Identification:</strong> Valid Indian Govt. ID (Aadhaar / Passport / DL) required.
              </p>
              <p>
                <strong className="text-slate-100">GSTIN:</strong> {settings.gstin} (SAC Code: {settings.sacCode})
              </p>
              <p className="text-[11px] text-slate-400">{settings.cancellationPolicy}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#f5e6c8]">Location & Support</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.locality}, {settings.city}, {settings.state} - {settings.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c5a059] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-[#c5a059]">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c5a059] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#c5a059]">
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  if (!currentUser || currentUser.role === 'GUEST') {
                    openAuthModal('STAFF');
                  } else {
                    setActiveView('hms');
                    setHmsTab('overview');
                  }
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-white/10 hover:bg-[#c5a059] text-white hover:text-slate-950 font-bold text-xs border border-[#c5a059]/50 transition-all cursor-pointer shadow-sm glow-gold"
              >
                Access Staff Management Console (HMS)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-200/80 text-xs">
          <p>© {new Date().getFullYear()} Laxmi Hotel, Gomti Nagar, Lucknow. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Hospitality Architecture v2.4</span>
            <span>•</span>
            <span>Powered by Secure HMS Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

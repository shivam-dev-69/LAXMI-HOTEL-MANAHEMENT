/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Compass,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { useHotel } from '../../context/HotelContext.tsx';
import { UserRole } from '../../types/hotel.ts';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenGuestPortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenGuestPortal }) => {
  const {
    currentUser,
    loginAsRole,
    logout,
    activeView,
    setActiveView,
    setHmsTab,
    settings,
    openAuthModal,
  } = useHotel();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'OWNER', title: 'Owner / Super Admin', desc: 'Full hotel authority & settings' },
    { role: 'MANAGER', title: 'Hotel Manager', desc: 'Operations, inventory & staff' },
    { role: 'RECEPTIONIST', title: 'Receptionist', desc: 'Walk-ins, check-in/out, folios' },
    { role: 'HOUSEKEEPING', title: 'Housekeeping Staff', desc: 'Room cleaning & inspection' },
    { role: 'CANTEEN', title: 'Canteen & Kitchen', desc: 'Orders, POS & room dining' },
    { role: 'ACCOUNTANT', title: 'Accountant', desc: 'Invoices, GST taxes & audits' },
    { role: 'GUEST', title: 'Customer / Guest', desc: 'Portal & private folio access' },
  ];

  const isStaffLoggedIn = currentUser && currentUser.role !== 'GUEST';

  const handleStaffPortalClick = () => {
    if (isStaffLoggedIn) {
      setActiveView(activeView === 'hms' ? 'website' : 'hms');
      if (activeView !== 'hms') setHmsTab('overview');
    } else {
      openAuthModal('STAFF');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    loginAsRole(role);
    setIsRoleDropdownOpen(false);
    if (role !== 'GUEST') {
      setActiveView('hms');
      setHmsTab('overview');
    }
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (activeView !== 'website') {
      setActiveView('website');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all no-print">
      {/* Top Utility Bar (Royal Navy & Gold Accent) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 text-xs text-blue-100 border-b border-blue-950 bg-[#0a1e3f]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Located in Vibhuti Khand, Gomti Nagar, Lucknow (UP)
          </span>
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1 hover:text-[#c5a059] transition-colors text-white font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
            {settings.phone}
          </a>
          <span className="text-blue-300">GSTIN: {settings.gstin}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenGuestPortal}
            className="hover:text-[#c5a059] flex items-center gap-1.5 transition-colors text-blue-200 font-medium"
          >
            <Search className="w-3.5 h-3.5 text-[#c5a059]" />
            Lookup Booking / Tax Invoice
          </button>
          <span className="text-blue-800">|</span>
          <span className="text-[#f5e6c8] font-semibold">Check-in: 12:00 PM • Checkout: 11:00 AM</span>
        </div>
      </div>

      {/* Main White Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          onClick={() => {
            setActiveView('website');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left cursor-pointer focus:outline-none"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => scrollToSection('rooms-section')}
            className="text-sm font-semibold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => scrollToSection('dining-section')}
            className="text-sm font-semibold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
          >
            Awadhi Canteen
          </button>
          <button
            onClick={() => scrollToSection('tourism-section')}
            className="text-sm font-semibold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
          >
            Lucknow Sightseeing
          </button>
          <button
            onClick={() => scrollToSection('facilities-section')}
            className="text-sm font-semibold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
          >
            Facilities
          </button>
          <button
            onClick={() => scrollToSection('contact-section')}
            className="text-sm font-semibold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
          >
            Location & Contact
          </button>
        </nav>

        {/* Action Controls, Login & Staff Access */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Staff HMS Portal Button */}
          {activeView === 'website' ? (
            <button
              onClick={handleStaffPortalClick}
              className="px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border border-blue-200 bg-blue-50/80 text-[#0f2b5c] hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer card-glow-hover"
              title={isStaffLoggedIn ? 'Open Hotel Management System' : 'Sign in to access HMS'}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>{isStaffLoggedIn ? 'Staff HMS Portal' : 'Staff Portal Login'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('website')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>View Public Website</span>
            </button>
          )}

          {/* Authentication & User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300 hover:border-[#1e3a8a] text-slate-800 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-[#0f2b5c] truncate max-w-[110px]">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0f2b5c] text-white uppercase font-bold">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{currentUser.email}</p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-1">Role: {currentUser.role}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (HMS Evaluation)
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {rolesList.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          currentUser?.role === r.role ? 'bg-blue-50/80 text-[#0f2b5c] font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{r.title}</p>
                          <p className="text-[10px] text-slate-500">{r.desc}</p>
                        </div>
                        {currentUser?.role === r.role && (
                          <UserCheck className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out (Lock HMS)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('STAFF')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0f2b5c] border border-blue-200 bg-white hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>Login / Sign In</span>
            </button>
          )}

          {/* Glowing Book Stay CTA */}
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 hover:brightness-110 shadow-md shadow-[#c5a059]/25 transition-all flex items-center gap-1.5 cursor-pointer glow-gold"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Stay</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c5a059] text-slate-950 glow-gold"
          >
            Book
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-slate-200 bg-white shadow-xl space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                setActiveView('website');
                setIsMobileMenuOpen(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold text-center ${
                activeView === 'website' ? 'bg-[#0f2b5c] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Public Website
            </button>
            <button
              onClick={() => {
                if (isStaffLoggedIn) {
                  setActiveView('hms');
                  setHmsTab('overview');
                  setIsMobileMenuOpen(false);
                } else {
                  setIsMobileMenuOpen(false);
                  openAuthModal('STAFF');
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold text-center ${
                activeView === 'hms' ? 'bg-[#0f2b5c] text-white' : 'bg-blue-50 text-[#0f2b5c] border border-blue-200'
              }`}
            >
              HMS Dashboard
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => scrollToSection('rooms-section')}
              className="block w-full text-left py-2 text-sm text-slate-800 font-medium"
            >
              Rooms & Suites
            </button>
            <button
              onClick={() => scrollToSection('dining-section')}
              className="block w-full text-left py-2 text-sm text-slate-800 font-medium"
            >
              Awadhi Dining
            </button>
            <button
              onClick={() => scrollToSection('tourism-section')}
              className="block w-full text-left py-2 text-sm text-slate-800 font-medium"
            >
              Lucknow Sightseeing
            </button>
            <button
              onClick={() => scrollToSection('facilities-section')}
              className="block w-full text-left py-2 text-sm text-slate-800 font-medium"
            >
              Facilities
            </button>
            <button
              onClick={() => scrollToSection('contact-section')}
              className="block w-full text-left py-2 text-sm text-slate-800 font-medium"
            >
              Location & Contact
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenGuestPortal();
              }}
              className="block w-full text-left py-2 text-sm text-[#0f2b5c] font-bold"
            >
              Search Booking / GST Invoice
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-800">
                  {currentUser.name} ({currentUser.role})
                </span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1 rounded bg-rose-50 text-rose-700 font-semibold text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('STAFF');
                }}
                className="w-full py-2 rounded-xl bg-blue-50 text-[#0f2b5c] font-bold text-xs border border-blue-200"
              >
                Sign In / Staff Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

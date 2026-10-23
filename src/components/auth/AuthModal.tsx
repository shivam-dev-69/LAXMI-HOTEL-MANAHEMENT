/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { UserRole } from '../../types/hotel.ts';
import { useHotel } from '../../context/HotelContext.tsx';
import { Logo } from '../common/Logo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'STAFF' | 'GUEST';
  onSuccessLogin?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'STAFF',
  onSuccessLogin,
}) => {
  const { allUsers, loginAsRole, loginWithEmail, registerUser, setActiveView, setHmsTab } = useHotel();

  const [activeTab, setActiveTab] = useState<'STAFF' | 'GUEST'>(defaultTab);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const staffProfiles: { role: UserRole; title: string; email: string; desc: string; color: string }[] = [
    {
      role: 'OWNER',
      title: 'Owner / Super Admin',
      email: 'owner@laxmihotel.com',
      desc: 'Master hotel control, tariffs & policy settings',
      color: 'border-amber-400/60 bg-amber-500/10 text-amber-900',
    },
    {
      role: 'MANAGER',
      title: 'Hotel Manager',
      email: 'manager@laxmihotel.com',
      desc: 'Operations, room allocations & employee shifts',
      color: 'border-blue-500/40 bg-blue-50/80 text-blue-900',
    },
    {
      role: 'RECEPTIONIST',
      title: 'Receptionist',
      email: 'reception@laxmihotel.com',
      desc: 'Front desk, walk-ins, check-in/out & folios',
      color: 'border-emerald-500/40 bg-emerald-50/80 text-emerald-900',
    },
    {
      role: 'CANTEEN',
      title: 'Canteen & Kitchen Chef',
      email: 'canteen@laxmihotel.com',
      desc: 'Awadhi KDS queue, room-service orders & POS',
      color: 'border-orange-500/40 bg-orange-50/80 text-orange-900',
    },
    {
      role: 'HOUSEKEEPING',
      title: 'Housekeeping Supervisor',
      email: 'housekeeping@laxmihotel.com',
      desc: 'Room cleaning checklists & maintenance tickets',
      color: 'border-teal-500/40 bg-teal-50/80 text-teal-900',
    },
    {
      role: 'ACCOUNTANT',
      title: 'Accountant (CA)',
      email: 'accounts@laxmihotel.com',
      desc: 'GST tax invoices, revenue reconciliation & audits',
      color: 'border-indigo-500/40 bg-indigo-50/80 text-indigo-900',
    },
  ];

  const handleStaffRoleLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsRole(role);
      setIsLoading(false);
      onClose();
      setActiveView('hms');
      setHmsTab('overview');
      if (onSuccessLogin) onSuccessLogin(role);
    }, 350);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'STAFF') {
      const match = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role !== 'GUEST'
      );
      if (match) {
        setIsLoading(true);
        setTimeout(() => {
          loginAsRole(match.role);
          setIsLoading(false);
          onClose();
          setActiveView('hms');
          setHmsTab('overview');
          if (onSuccessLogin) onSuccessLogin(match.role);
        }, 350);
      } else {
        setErrorMessage('Invalid staff email address. Please select one of the authorized staff accounts below.');
      }
    } else {
      // Guest Login or Register
      if (isRegisterMode) {
        if (!fullName.trim() || !phone.trim() || !email.trim()) {
          setErrorMessage('Please fill in all required registration fields.');
          return;
        }
        setIsLoading(true);
        setTimeout(() => {
          registerUser(fullName.trim(), email.trim(), phone.trim(), 'GUEST');
          setIsLoading(false);
          onClose();
          setActiveView('website');
        }, 350);
      } else {
        if (!email.trim()) {
          setErrorMessage('Please enter your registered email address.');
          return;
        }
        setIsLoading(true);
        setTimeout(() => {
          loginWithEmail(email.trim());
          setIsLoading(false);
          onClose();
          setActiveView('website');
        }, 350);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,43,92,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Decorative Blue & Gold Gradient Header */}
        <div className="relative bg-gradient-to-r from-[#0a1e3f] via-[#102d60] to-[#1e3a8a] p-6 text-white overflow-hidden">
          {/* Subtle Glowing Aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/20 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#f5e6c8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                Laxmi Hotel • Security Gate
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
                Authorized Hotel Portal Access
              </h2>
              <p className="text-xs text-blue-100/90 font-light">
                Sign in to manage room allocations, folios, and invoices, or look up guest stays.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close login modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector: Staff vs Guest */}
          <div className="flex gap-2 mt-5 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => {
                setActiveTab('STAFF');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'STAFF'
                  ? 'bg-white text-[#0f2b5c] shadow-md shadow-black/10'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Staff Login (HMS)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('GUEST');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'GUEST'
                  ? 'bg-white text-[#0f2b5c] shadow-md shadow-black/10'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Guest Portal Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 bg-white">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'STAFF' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
                    Fast 1-Click Role Login (Instant Access)
                  </span>
                  <span className="text-[10px] text-[#0f2b5c] font-semibold">
                    Select your staff role:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {staffProfiles.map((sp) => (
                    <button
                      key={sp.role}
                      type="button"
                      onClick={() => handleStaffRoleLogin(sp.role)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between hover:border-[#1e3a8a] hover:shadow-md transition-all cursor-pointer group card-glow-hover ${sp.color}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-[#1e3a8a]">
                          {sp.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-1">{sp.desc}</p>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">{sp.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Or manual email/password input */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">
                  Or Log In with Staff Email & Password
                </span>

                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Staff Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="e.g. owner@laxmihotel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Access Passcode
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0f2b5c] to-[#1e3a8a] hover:from-[#0d234a] hover:to-[#173075] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer glow-blue"
                  >
                    <KeyRound className="w-4 h-4 text-[#c5a059]" />
                    <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to HMS Dashboard'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Guest Login / Register Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-sm">
                  {isRegisterMode ? 'Create New Guest Account' : 'Guest Sign In'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage('');
                  }}
                  className="text-xs font-semibold text-[#1e3a8a] hover:underline"
                >
                  {isRegisterMode ? 'Already registered? Sign In' : 'New guest? Create Profile'}
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Chandra Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="e.g. guest@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-blue-600 inline mr-1" />
                  Your guest credentials let you check real-time room status, view itemized charges, and download official
                  GST invoices anytime.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer glow-gold"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Processing...'
                      : isRegisterMode
                      ? 'Complete Guest Registration'
                      : 'Sign In to Guest Portal'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

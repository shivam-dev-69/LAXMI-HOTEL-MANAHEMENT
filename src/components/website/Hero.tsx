/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, ChevronRight, MapPin, Shield, Sparkles, Users, Wifi, Zap } from 'lucide-react';
import { useHotel } from '../../context/HotelContext.tsx';

interface HeroProps {
  onSearchRooms: (params: { checkIn: string; checkOut: string; categoryId: string; guests: number }) => void;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearchRooms, onOpenBooking }) => {
  const { categories } = useHotel();

  // Date defaults: tomorrow and day after tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfter);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [guests, setGuests] = useState<number>(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchRooms({
      checkIn,
      checkOut,
      categoryId: selectedCategory,
      guests,
    });
    // Scroll to rooms
    const el = document.getElementById('rooms-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Background with Ambient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e17] via-[#090e17]/80 to-[#090e17]/60"></div>
        {/* Subtle royal pattern sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        {/* Prestige Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b253b]/80 border border-[#c5a059]/40 text-[#f5e6c8] text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Vibhuti Khand, Gomti Nagar • Lucknow</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          Awadhi Hospitality{' '}
          <span
            className="italic font-normal block sm:inline"
            style={{
              background: 'linear-gradient(to right, #ffffff, #f7e6ca, #c5a059)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Redefined.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base md:text-lg font-normal leading-relaxed">
          Welcome to <strong className="text-white font-medium">Laxmi Hotel</strong>. Discover refined AC luxury rooms,
          authentic Nawabi cuisine, and seamless hospitality within minutes of Lucknow High Court & Indira Gandhi
          Pratishthan.
        </p>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#c5a059]" />
            100% 24/7 Power Backup
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-[#c5a059]" />
            Gigabit High-Speed Wi-Fi
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#c5a059]" />
            Sanitized & Soundproof
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#c5a059]" />
            Heart of Gomti Nagar
          </span>
        </div>

        {/* Interactive Booking Search Widget */}
        <div className="pt-6 w-full max-w-4xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="bg-white/95 border-2 border-[#0f2b5c]/20 shadow-[0_16px_50px_rgba(15,43,92,0.25)] rounded-2xl p-4 sm:p-5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end text-left glow-blue"
          >
            {/* Check-In Date */}
            <div>
              <label htmlFor="hero-checkin" className="block text-[11px] font-bold text-[#0a1e3f] uppercase tracking-wider mb-1.5">
                Check-In
              </label>
              <div className="relative">
                <input
                  id="hero-checkin"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  required
                />
              </div>
            </div>

            {/* Check-Out Date */}
            <div>
              <label htmlFor="hero-checkout" className="block text-[11px] font-bold text-[#0a1e3f] uppercase tracking-wider mb-1.5">
                Check-Out
              </label>
              <div className="relative">
                <input
                  id="hero-checkout"
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  required
                />
              </div>
            </div>

            {/* Room Category */}
            <div>
              <label htmlFor="hero-category" className="block text-[11px] font-bold text-[#0a1e3f] uppercase tracking-wider mb-1.5">
                Room Category
              </label>
              <select
                id="hero-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
              >
                <option value="all">All Room Types</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (from ₹{cat.basePrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="hero-guests" className="block text-[11px] font-bold text-[#0a1e3f] uppercase tracking-wider mb-1.5">
                Guests
              </label>
              <div className="relative">
                <select
                  id="hero-guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                >
                  <option value={1}>1 Adult (Single)</option>
                  <option value={2}>2 Adults (Couple / Double)</option>
                  <option value={3}>3 Adults (Extra Bed)</option>
                  <option value={4}>4 Adults (Family Suite)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full h-[42px] rounded-lg bg-gradient-to-r from-[#0f2b5c] via-[#1e3a8a] to-[#0a1e3f] hover:from-[#1e3a8a] hover:to-[#0f2b5c] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#c5a059]/40 hover:scale-[1.02]"
              >
                <span className="text-[#f5e6c8]">Check Rates</span>
                <ChevronRight className="w-4 h-4 text-[#c5a059]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

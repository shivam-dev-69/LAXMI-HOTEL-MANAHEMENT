/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bed, Calendar, Check, Eye, Star, Users, Wind } from 'lucide-react';
import { RoomCategory } from '../../types/hotel.ts';
import { formatCurrencyINR } from '../../utils/hotelLogic.ts';
import { useHotel } from '../../context/HotelContext.tsx';
import { RoomModal } from './RoomModal.tsx';

interface RoomsSectionProps {
  onSelectCategoryForBooking: (category: RoomCategory) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ onSelectCategoryForBooking }) => {
  const { categories, rooms } = useHotel();
  const [filter, setFilter] = useState<string>('all');
  const [inspectCategory, setInspectCategory] = useState<RoomCategory | null>(null);

  const filteredCategories = categories.filter((cat) => {
    if (filter === 'all') return true;
    if (filter === 'ac') return cat.acType === 'AC';
    if (filter === 'non-ac') return cat.acType === 'Non-AC';
    if (filter === 'suite') return cat.code === 'VIP_SUITE' || cat.code === 'FAMILY_SUITE';
    if (filter === 'single') return cat.code === 'SINGLE_BIZ';
    return true;
  });

  return (
    <section id="rooms-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c5a059]">
          Accommodations & Suites
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f2b5c]">
          Refined Living in Gomti Nagar
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto rounded-full"></div>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm leading-relaxed">
          Every room is designed with soundproof comfort, premium bedding, high-speed Wi-Fi, and 24/7 power backup
          to ensure your stay in Lucknow is effortless and memorable.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            { id: 'all', label: 'All Room Types' },
            { id: 'ac', label: 'Air-Conditioned' },
            { id: 'suite', label: 'VIP & Family Suites' },
            { id: 'single', label: 'Single Business' },
            { id: 'non-ac', label: 'Economy Non-AC' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                filter === item.id
                  ? 'bg-[#0f2b5c] text-white shadow-md shadow-[#0f2b5c]/25 glow-blue'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Cards Grid (White & Royal Blue Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((category) => {
          const totalRooms = rooms.filter((r) => r.categoryId === category.id).length;
          const availableCount = rooms.filter(
            (r) => r.categoryId === category.id && r.status === 'AVAILABLE'
          ).length;

          return (
            <div
              key={category.id}
              className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#1e3a8a] transition-all duration-300 shadow-[0_4px_20px_rgba(15,43,92,0.06)] flex flex-col justify-between card-glow-hover"
            >
              {/* Image Container with Badges */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={category.images[0]}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/95 text-[#0f2b5c] shadow-sm backdrop-blur-sm border border-slate-200">
                    {category.acType}
                  </span>
                  {category.code === 'VIP_SUITE' && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md">
                      VIP Royal
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-xs font-bold text-amber-700 shadow-sm border border-slate-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{category.rating}</span>
                </div>

                {/* Live Availability Pill */}
                <div className="absolute bottom-3 left-3 text-[11px] px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 text-white">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      availableCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span>
                    {availableCount > 0 ? `${availableCount} Rooms Available` : 'Waitlist Only'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#0f2b5c] group-hover:text-[#1e3a8a] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 py-2.5 border-y border-slate-100 bg-slate-50/80 rounded-xl px-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                    <span className="font-medium">Up to {category.capacityAdults} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                    <span className="truncate font-medium">{category.bedType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                    <span className="font-medium">{category.acType} Comfort</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free Wi-Fi</span>
                  </div>
                </div>

                {/* Key Amenities Preview */}
                <div className="flex flex-wrap gap-1.5">
                  {category.amenities.slice(0, 3).map((a, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-50/80 text-[#0f2b5c] font-semibold border border-blue-100"
                    >
                      {a}
                    </span>
                  ))}
                  {category.amenities.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 text-slate-500 font-semibold">
                      +{category.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Tariff & Action Footer */}
                <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Nightly Tariff
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-2xl font-bold text-[#0f2b5c]">
                        {formatCurrencyINR(category.basePrice)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">+ GST</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectCategory(category)}
                      className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0f2b5c] hover:bg-slate-200 transition-colors"
                      title="View Details & Gallery"
                      aria-label="View room details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectCategoryForBooking(category)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-[#c5a059]/25 transition-all flex items-center gap-1.5 cursor-pointer glow-gold"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Inspection Modal */}
      {inspectCategory && (
        <RoomModal
          category={inspectCategory}
          onClose={() => setInspectCategory(null)}
          onBookNow={(cat) => onSelectCategoryForBooking(cat)}
        />
      )}
    </section>
  );
};

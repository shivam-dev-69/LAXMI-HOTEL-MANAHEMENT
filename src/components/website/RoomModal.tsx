/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bed,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Maximize2,
  Shield,
  Star,
  Users,
  Wind,
  X,
} from 'lucide-react';
import { RoomCategory } from '../../types/hotel.ts';
import { formatCurrencyINR } from '../../utils/hotelLogic.ts';
import { useHotel } from '../../context/HotelContext.tsx';

interface RoomModalProps {
  category: RoomCategory | null;
  onClose: () => void;
  onBookNow: (category: RoomCategory) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({ category, onClose, onBookNow }) => {
  const { rooms } = useHotel();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!category) return null;

  const totalRooms = rooms.filter((r) => r.categoryId === category.id).length;
  const availableRooms = rooms.filter(
    (r) => r.categoryId === category.id && r.status === 'AVAILABLE'
  ).length;

  const images = category.images.length > 0 ? category.images : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0f172a] border border-[#2e3e60] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141e33]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#c5a059]/20 text-[#d4af37] border border-[#c5a059]/30">
                {category.acType}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{category.rating} Rating</span>
              </div>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
              {category.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Gallery Carousel */}
          <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10">
            <img
              src={images[activeImageIndex]}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-3">
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-xs text-slate-200">
              {activeImageIndex + 1} / {images.length} Photos
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#162035] border border-white/5 text-center">
              <Users className="w-4 h-4 text-[#c5a059] mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Max Capacity</p>
              <p className="text-xs font-semibold text-white">
                {category.capacityAdults} Adults, {category.capacityChildren} Child
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#162035] border border-white/5 text-center">
              <Bed className="w-4 h-4 text-[#c5a059] mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Bed Configuration</p>
              <p className="text-xs font-semibold text-white">{category.bedType}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#162035] border border-white/5 text-center">
              <Maximize2 className="w-4 h-4 text-[#c5a059] mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Room Size</p>
              <p className="text-xs font-semibold text-white">{category.sizeSqFt} sq. ft.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#162035] border border-white/5 text-center">
              <Wind className="w-4 h-4 text-[#c5a059] mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Inventory Status</p>
              <p className="text-xs font-semibold text-emerald-400">
                {availableRooms} of {totalRooms} Available Now
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5e6c8] mb-2">
              Room Description
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{category.description}</p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5e6c8] mb-3">
              Included In-Room Amenities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {category.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#141e33] border border-white/5 text-xs text-slate-200"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tariffs & Policies */}
          <div className="p-4 rounded-xl bg-[#141e30] border border-[#263753] space-y-2 text-xs text-slate-300">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#c5a059]" />
              Tariff & Check-in Rules
            </h4>
            <p>
              • Base Rate: <strong>{formatCurrencyINR(category.basePrice)}</strong> per night (Double Occupancy).
            </p>
            <p>
              • Extra Adult / Bed: <strong>{formatCurrencyINR(category.extraAdultPrice)}</strong> per night with mattress and bedding.
            </p>
            <p>• GST (CGST 6% + SGST 6%) applies on actual billing per statutory Government of India rules.</p>
            <p>• Valid Government ID proof required at arrival for all checking-in guests.</p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#141e33] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400">Starting from</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-white">
                {formatCurrencyINR(category.basePrice)}
              </span>
              <span className="text-xs text-slate-400">/ night + GST</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookNow(category);
              }}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 transition-all w-full sm:w-auto text-center cursor-pointer"
            >
              Book This Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

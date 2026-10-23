/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Landmark,
  MapPin,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext.tsx';

export const TourismSection: React.FC = () => {
  const { createTouristEnquiry, rooms } = useHotel();

  const attractions = [
    {
      id: 'att-1',
      name: 'Bara Imambara & Bhulbhulaiya',
      distance: '11 km from Hotel (Approx. 25 mins)',
      era: 'Commissioned by Nawab Asaf-ud-Daula (1784)',
      description:
        'Architectural masterpiece featuring the largest unsupported arched hall in the world and the famed labyrinthine Bhulbhulaiya with 489 identical doorways.',
      image:
        'https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=800&q=80',
      timings: '06:00 AM - 05:00 PM',
      highlight: 'Labyrinth & Grand Arched Vault',
    },
    {
      id: 'att-2',
      name: 'Chota Imambara (Palace of Lights)',
      distance: '12 km from Hotel (Approx. 28 mins)',
      era: 'Built by Nawab Muhammad Ali Shah (1838)',
      description:
        'Renowned for its breathtaking crystal chandeliers, Belgian glass mirrors, gold-gilded dome, and royal calligraphic Quranic inscriptions.',
      image:
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      timings: '06:00 AM - 05:00 PM',
      highlight: 'Belgian Chandeliers & Gold Dome',
    },
    {
      id: 'att-3',
      name: 'Rumi Darwaza (The Turkish Gate)',
      distance: '11.5 km from Hotel (Approx. 26 mins)',
      era: 'Modeled after Sublime Porte of Istanbul (1784)',
      description:
        'Standing sixty feet tall, this iconic entrance gate to old Lucknow symbolizes Awadhi grandeur, featuring octagonal lanterns and intricate stone carvings.',
      image:
        'https://images.unsplash.com/photo-1600100397608-f010f421f292?auto=format&fit=crop&w=800&q=80',
      timings: 'Open 24 Hours (Scenic night illumination)',
      highlight: 'Lucknow Heritage Symbol',
    },
    {
      id: 'att-4',
      name: 'Ambedkar Memorial Park',
      distance: '3.5 km from Hotel (Approx. 8 mins in Gomti Nagar)',
      era: 'Grand Contemporary Memorial',
      description:
        'Sprawling architectural park built with Rajasthan red sandstone in Vipin Khand, Gomti Nagar. Features monumental stupa domes and carved elephant gallery.',
      image:
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      timings: '11:00 AM - 09:00 PM',
      highlight: 'Walking distance from Hotel',
    },
  ];

  // Request Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [serviceType, setServiceType] = useState<
    'SIGHTSEEING_TOUR' | 'AIRPORT_RAILWAY_CAB' | 'PRIVATE_CHAUFFEUR' | 'FOOD_WALK_HERITAGE'
  >('SIGHTSEEING_TOUR');
  const [selectedSpots, setSelectedSpots] = useState<string[]>([
    'Bara Imambara & Bhulbhulaiya',
    'Rumi Darwaza',
  ]);
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [persons, setPersons] = useState(2);
  const [notes, setNotes] = useState('');

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const toggleSpot = (name: string) => {
    setSelectedSpots((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    const estimatedQuote =
      serviceType === 'SIGHTSEEING_TOUR'
        ? 2800 + (persons > 2 ? 600 : 0)
        : serviceType === 'AIRPORT_RAILWAY_CAB'
        ? 950
        : 3500;

    const enquiry = createTouristEnquiry({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || 'concierge@laxmihotel.com',
      roomNumber: roomNumber.trim() || undefined,
      serviceType,
      destinations: selectedSpots,
      date: preferredDate,
      persons,
      notes: notes.trim(),
      estimatedCost: estimatedQuote,
    });

    setSubmittedRef(enquiry.refCode);
  };

  return (
    <section id="tourism-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-14">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c5a059]">
          Explore The City of Nawabs
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a1e3f]">
          Lucknow Tourism & Concierge
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto"></div>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm">
          Discover the soul of Awadh with Laxmi Hotel’s dedicated travel desk. We arrange verified air-conditioned
          chauffeurs, licensed heritage guides, and airport/railway transfers.
        </p>
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {attractions.map((att) => (
          <div
            key={att.id}
            className="bg-white border border-slate-200 hover:border-[#1e3a8a] rounded-2xl overflow-hidden card-glow-hover flex flex-col shadow-xs group transition-all"
          >
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={att.image}
                alt={att.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-black/70 backdrop-blur-sm text-[#f5e6c8] border border-[#c5a059]/30">
                {att.highlight}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0a1e3f] group-hover:text-[#1e3a8a] transition-colors">
                  {att.name}
                </h3>
                <p className="text-[11px] text-[#c5a059] font-bold mt-0.5">{att.era}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{att.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0f2b5c] shrink-0" />
                  <span className="font-medium">{att.distance}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                  <span>{att.timings}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Concierge / Cab Booking Request Box */}
      <div className="bg-[#0a1e3f] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(10,30,63,0.25)] relative overflow-hidden glow-blue">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Explanatory Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2f54] border border-[#c5a059]/40 text-[#f5e6c8] text-xs font-semibold">
              <Car className="w-4 h-4 text-[#c5a059]" />
              <span>Dedicated Hotel Concierge Desk</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Book a Guided Tour or Chauffeur Cab
            </h3>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Plan your day trips across Lucknow with complete peace of mind. Our reception team coordinates with
              trusted local transport partners for transparent rates and verified drivers.
            </p>

            <div className="space-y-2 pt-2 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sanitized AC Sedans and 7-Seater Innova Crysta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Airport (Amausi) & Charbagh Railway station transfers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Knowledgeable local drivers with fluent Hindi/English</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#142646] border border-blue-900 text-[11px] text-blue-200">
              <strong className="text-[#f5e6c8] block mb-0.5">Note on Travel Bookings:</strong>
              Quotes are provided transparently based on actual vehicle type and itinerary. Charges can be settled
              directly or billed to your room folio.
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-800">
            {submittedRef ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-white">Request Received!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your concierge request has been logged under reference code:
                </p>
                <div className="text-lg font-bold text-[#c5a059] bg-[#141e30] py-2 px-4 rounded-lg inline-block border border-[#c5a059]/40">
                  {submittedRef}
                </div>
                <p className="text-[11px] text-slate-400">
                  Our front desk executive will contact your mobile or room with driver details and confirmation quote.
                </p>
                <button
                  onClick={() => setSubmittedRef(null)}
                  className="px-5 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h4 className="font-serif font-bold text-[#0a1e3f] text-base">
                  Request Concierge Assistance
                </h4>

                {/* Service Type Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'SIGHTSEEING_TOUR', label: 'Day Tour' },
                    { id: 'AIRPORT_RAILWAY_CAB', label: 'Airport Transfer' },
                    { id: 'PRIVATE_CHAUFFEUR', label: 'Chauffeur 8h' },
                    { id: 'FOOD_WALK_HERITAGE', label: 'Food Walk' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceType(s.id as any)}
                      className={`p-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                        serviceType === s.id
                          ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Sightseeing Spot Toggles */}
                {serviceType === 'SIGHTSEEING_TOUR' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1.5">
                      Select Desired Monuments to Visit
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Bara Imambara & Bhulbhulaiya',
                        'Chota Imambara',
                        'Rumi Darwaza',
                        'Ambedkar Memorial Park',
                        'British Residency',
                        'Hazratganj Evening Stroll',
                      ].map((spot) => (
                        <label
                          key={spot}
                          className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer text-slate-700 hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpots.includes(spot)}
                            onChange={() => toggleSpot(spot)}
                            className="rounded border-slate-300 text-[#0f2b5c]"
                          />
                          <span className="truncate text-xs">{spot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kunal Singhania"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 99201 XXXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                      Date of Travel
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                      Room Number (If staying with us)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 301"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                    Special Flight / Train Number or Pickup Timings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flight IndiGo 6E-204 arriving at 02:15 PM, require luggage space"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#c5a059]" />
                  <span>Submit Concierge Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

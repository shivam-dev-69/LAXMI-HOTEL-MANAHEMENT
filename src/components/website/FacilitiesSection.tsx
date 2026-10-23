/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Car,
  Clock,
  Coffee,
  HeartPulse,
  Lock,
  ShieldCheck,
  Tv,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';

export const FacilitiesSection: React.FC = () => {
  const facilities = [
    {
      icon: <Zap className="w-6 h-6 text-[#c5a059]" />,
      title: '100% 24/7 Power Backup',
      description: 'Heavy-duty silent generator setup ensures uninterrupted air-conditioning and lighting throughout.',
    },
    {
      icon: <Wifi className="w-6 h-6 text-[#c5a059]" />,
      title: 'Gigabit Fiber High-Speed Wi-Fi',
      description: 'Dedicated business-grade mesh routers on every floor with seamless 300+ Mbps connectivity.',
    },
    {
      icon: <Utensils className="w-6 h-6 text-[#c5a059]" />,
      title: 'Awadhi Canteen & 24/7 Room Dining',
      description: 'Traditional slow-cooked Mughlai & Awadhi delicacies delivered warm to your room folio anytime.',
    },
    {
      icon: <Car className="w-6 h-6 text-[#c5a059]" />,
      title: 'Valet Parking & Chauffeur Services',
      description: 'Ample CCTV-monitored basement & surface parking space for private sedans, SUVs, and coaches.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#c5a059]" />,
      title: 'Soundproof & Daily Sanitization',
      description: 'Double-glazed acoustic windows and hospital-grade sanitization protocols for peaceful sleep.',
    },
    {
      icon: <HeartPulse className="w-6 h-6 text-[#c5a059]" />,
      title: 'Doctor on Call & First Aid',
      description: 'Immediate tie-ups with leading hospitals in Gomti Nagar including Apollo & Sahara for guest emergencies.',
    },
    {
      icon: <Lock className="w-6 h-6 text-[#c5a059]" />,
      title: 'RFID Digital Keycard & Safes',
      description: 'High-security contactless keycards, electronic in-room digital lockers, and 24-hour guarded security.',
    },
    {
      icon: <Coffee className="w-6 h-6 text-[#c5a059]" />,
      title: 'In-Room Tea & Coffee Stations',
      description: 'Electric kettle with complimentary sachets of premium green tea, Assam black tea, and roasted coffee.',
    },
  ];

  return (
    <section id="facilities-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="text-center space-y-3 mb-14">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c5a059]">
          Premium Amenities
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a1e3f]">
          Engineered for Executive Comfort
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto"></div>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm">
          Whether you are visiting Lucknow for High Court proceedings, business conferences in Gomti Nagar, or
          leisure tourism, every facility is tailored to high standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {facilities.map((fac, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#1e3a8a] transition-all space-y-3 shadow-xs group card-glow-hover"
          >
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 w-fit group-hover:scale-110 transition-transform">
              {fac.icon}
            </div>
            <h3 className="font-serif text-base font-bold text-[#0a1e3f] group-hover:text-[#1e3a8a] transition-colors">
              {fac.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{fac.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

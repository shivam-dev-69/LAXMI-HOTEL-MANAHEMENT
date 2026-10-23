/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext.tsx';

export const ContactAndLocation: React.FC = () => {
  const { settings, addToast } = useHotel();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'What are the check-in and check-out timings at Laxmi Hotel?',
      a: `Standard check-in starts at ${settings.defaultCheckInTime} and check-out is by ${settings.defaultCheckOutTime}. Early check-in or late check-out is subject to room availability and can be requested through our reception desk.`,
    },
    {
      q: 'What identification documents are acceptable at check-in?',
      a: 'As per Government of Uttar Pradesh regulations, all Indian citizens must present a valid Government Photo ID (Aadhaar Card, Passport, Driving License, or Voter ID). PAN cards are not accepted as address proof. Foreign nationals must provide their original Passport with a valid Indian Visa.',
    },
    {
      q: 'How close is Laxmi Hotel to key landmarks in Gomti Nagar?',
      a: 'Laxmi Hotel is situated in Vibhuti Khand, Gomti Nagar. We are 5 minutes from Lucknow High Court, 6 minutes from Indira Gandhi Pratishthan (IGP), 8 minutes from Ambedkar Memorial Park, 10 minutes from Gomti Riverfront, and 20 minutes from Charbagh Railway Station.',
    },
    {
      q: 'Are food and canteen charges billable to the room folio?',
      a: 'Yes, guests staying in checked-in rooms can order authentic Awadhi cuisine, breakfast, and beverages from our canteen directly to their room. All orders will be cleanly itemized on your final checkout GST tax invoice.',
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: settings.cancellationPolicy,
    },
    {
      q: 'Does the hotel provide GST tax invoices with business GSTIN?',
      a: 'Yes. Laxmi Hotel provides official computer-generated GST Tax Invoices (HSN/SAC 9963) with your company GSTIN, legal address, and itemized room/dining tariffs for seamless corporate tax deductions.',
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    addToast(
      'success',
      'Inquiry Submitted',
      `Thank you ${name}. Our front desk team will contact you at ${phone} promptly.`
    );
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <section id="contact-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="text-center space-y-3 mb-14">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c5a059]">
          Prime Location in Lucknow
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a1e3f]">
          Location, Contact & FAQs
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto"></div>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm">
          Centrally located in Vibhuti Khand, Gomti Nagar — the premier judicial, corporate, and residential hub of
          Lucknow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Location & Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Address Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs card-glow-hover">
            <h3 className="font-serif text-lg font-bold text-[#0a1e3f] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0f2b5c]" />
              Hotel Address & Coordinates
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-[#0a1e3f] block text-sm font-semibold">{settings.hotelName}</strong>
              {settings.address}, {settings.locality}, {settings.city}, {settings.state} - {settings.pincode}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">High Court Lucknow:</span>
                <span className="font-bold text-[#0f2b5c]">1.8 km (5 mins)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Indira Gandhi Pratishthan:</span>
                <span className="font-bold text-[#0f2b5c]">2.2 km (6 mins)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Ambedkar Memorial Park:</span>
                <span className="font-bold text-[#0f2b5c]">3.5 km (8 mins)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Charbagh Railway Station:</span>
                <span className="font-semibold text-slate-800">10 km (20 mins)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">CCS International Airport:</span>
                <span className="font-semibold text-slate-800">22 km (35 mins)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://maps.google.com/?q=Laxmi+Hotel+Vibhuti+Khand+Gomti+Nagar+Lucknow`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50/80 border border-blue-200 hover:bg-[#0f2b5c] hover:text-white text-[#0f2b5c] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#c5a059]" />
                <span>Open in Google Maps Navigation</span>
              </a>
            </div>
          </div>

          {/* Quick Contact & WhatsApp */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs text-xs">
            <h3 className="font-serif text-base font-bold text-[#0a1e3f] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0f2b5c]" />
              Front Desk & Helpdesk
            </h3>
            <p className="text-slate-600">
              Reception Desk: <strong className="text-[#0a1e3f]">{settings.phone}</strong> (24/7 Helpline)
            </p>
            <p className="text-slate-600">
              Email: <strong className="text-[#0a1e3f]">{settings.email}</strong>
            </p>
            <p className="text-slate-600">
              GST Registration: <strong className="text-[#0f2b5c] font-semibold">{settings.gstin}</strong>
            </p>
          </div>

          {/* Quick Inquiry Form */}
          <div className="p-6 rounded-2xl bg-white border-2 border-blue-100 shadow-md space-y-4">
            <h3 className="font-serif text-base font-bold text-[#0a1e3f] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0f2b5c]" />
              Send Direct Hotel Inquiry
            </h3>
            <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Your Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="Mobile Phone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Inquire about corporate bulk bookings, wedding rooms, or stay dates..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer transition-all"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive FAQ Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#0f2b5c]" />
            <h3 className="font-serif text-xl font-bold text-[#0a1e3f]">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-slate-200 hover:border-blue-300 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0a1e3f] hover:text-[#1e3a8a] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#0f2b5c] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Business Credentials Notice */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-[#0a1e3f]">Regulatory & Transparency Notice:</p>
            <p>
              In accordance with ethical hospitality compliance, Laxmi Hotel operates with registered commercial
              licensing in Lucknow. All room rates, occupancy constraints, and GSTIN details are fully verifiable at our
              on-site reception desk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

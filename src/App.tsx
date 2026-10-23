/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { Hero } from './components/website/Hero.tsx';
import { RoomsSection } from './components/website/RoomsSection.tsx';
import { DiningSection } from './components/website/DiningSection.tsx';
import { TourismSection } from './components/website/TourismSection.tsx';
import { FacilitiesSection } from './components/website/FacilitiesSection.tsx';
import { ContactAndLocation } from './components/website/ContactAndLocation.tsx';
import { BookingModal } from './components/website/BookingModal.tsx';
import { GuestPortalModal } from './components/guest/GuestPortalModal.tsx';
import { PrintableInvoiceModal } from './components/invoice/PrintableInvoiceModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HmsLayout } from './components/hms/HmsLayout.tsx';
import { RoomCategory } from './types/hotel.ts';

const HotelApp: React.FC = () => {
  const {
    activeView,
    activeInvoice,
    setActiveInvoice,
    generateInvoiceForReservation,
    invoices,
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
  } = useHotel();

  // Public Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCategoryForBooking, setSelectedCategoryForBooking] = useState<RoomCategory | null>(
    null
  );

  // Guest Self-Service Portal Modal
  const [isGuestPortalOpen, setIsGuestPortalOpen] = useState(false);

  const handleOpenBookingWithCategory = (cat: RoomCategory) => {
    setSelectedCategoryForBooking(cat);
    setIsBookingModalOpen(true);
  };

  const handleHeroSearch = (params: {
    checkIn: string;
    checkOut: string;
    categoryId: string;
    guests: number;
  }) => {
    // Scroll to rooms section
    const el = document.getElementById('rooms-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenInvoiceForReservation = (resId: string) => {
    const existing = invoices.find((inv) => inv.reservationId === resId);
    if (existing) {
      setActiveInvoice(existing);
    } else {
      const generated = generateInvoiceForReservation(resId);
      if (generated) {
        setActiveInvoice(generated);
      }
    }
  };

  const handleOrderFoodToRoom = (roomNumber: string) => {
    // Scroll to dining section
    const el = document.getElementById('dining-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#0f2b5c]/20 selection:text-[#0f2b5c]">
      {/* Top Header */}
      <Header
        onOpenBooking={() => {
          setSelectedCategoryForBooking(null);
          setIsBookingModalOpen(true);
        }}
        onOpenGuestPortal={() => setIsGuestPortalOpen(true)}
      />

      {/* Main View Switcher */}
      {activeView === 'hms' ? (
        <HmsLayout />
      ) : (
        <main className="flex-1">
          {/* Public Website Sections */}
          <Hero
            onSearchRooms={handleHeroSearch}
            onOpenBooking={() => {
              setSelectedCategoryForBooking(null);
              setIsBookingModalOpen(true);
            }}
          />

          <RoomsSection onSelectCategoryForBooking={handleOpenBookingWithCategory} />

          <DiningSection />

          <TourismSection />

          <FacilitiesSection />

          <ContactAndLocation />
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenBooking={() => {
          setSelectedCategoryForBooking(null);
          setIsBookingModalOpen(true);
        }}
        onOpenGuestPortal={() => setIsGuestPortalOpen(true)}
      />

      {/* Modals & Overlays */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          defaultTab={authModalTab}
        />
      )}

      {isBookingModalOpen && (
        <BookingModal
          initialCategory={selectedCategoryForBooking}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}

      {isGuestPortalOpen && (
        <GuestPortalModal
          onClose={() => setIsGuestPortalOpen(false)}
          onOpenInvoice={handleOpenInvoiceForReservation}
          onOrderFoodToRoom={handleOrderFoodToRoom}
        />
      )}

      {activeInvoice && (
        <PrintableInvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <HotelApp />
    </HotelProvider>
  );
}

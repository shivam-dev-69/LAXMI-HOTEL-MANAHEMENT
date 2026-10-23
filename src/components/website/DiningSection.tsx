/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  ChefHat,
  Clock,
  Flame,
  Plus,
  ShoppingBag,
  Sparkles,
  Utensils,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CanteenMenuItem, MenuCategory } from '../../types/hotel.ts';
import { formatCurrencyINR } from '../../utils/hotelLogic.ts';
import { useHotel } from '../../context/HotelContext.tsx';

interface DiningSectionProps {
  onOpenOrderModal?: () => void;
}

export const DiningSection: React.FC<DiningSectionProps> = () => {
  const { menu, rooms, createCanteenOrder, reservations } = useHotel();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  // Cart State for Instant Room Service / Dine-in order
  const [cart, setCart] = useState<{ item: CanteenMenuItem; quantity: number }[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<'ROOM_SERVICE' | 'DINE_IN' | 'TAKEAWAY'>('ROOM_SERVICE');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'Complete Menu' },
    { id: 'LUCKNOWI_AWADHI', label: 'Awadhi Dastarkhwan' },
    { id: 'BREAKFAST', label: 'Morning Breakfast' },
    { id: 'MAIN_COURSE', label: 'Royal Main Course' },
    { id: 'BEVERAGES', label: 'Chai & Drinks' },
    { id: 'DESSERTS', label: 'Mithai & Desserts' },
  ];

  const filteredMenu = menu.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (filterVegOnly && !item.isVeg) return false;
    return true;
  });

  const addToCart = (item: CanteenMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartTax = Math.round(((cartTotal * 5) / 100) * 100) / 100;
  const cartGrandTotal = Math.round((cartTotal + cartTax) * 100) / 100;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let targetGuestName = guestName.trim();
    let resId: string | undefined;

    if (orderType === 'ROOM_SERVICE' && selectedRoomNumber) {
      const activeRes = reservations.find(
        (r) => r.roomNumber === selectedRoomNumber && r.bookingStatus === 'CHECKED_IN'
      );
      if (activeRes) {
        targetGuestName = activeRes.guestName;
        resId = activeRes.id;
      }
    }

    createCanteenOrder({
      orderType,
      roomNumber: orderType === 'ROOM_SERVICE' ? selectedRoomNumber : undefined,
      guestName: targetGuestName || 'Valued Guest',
      reservationId: resId,
      items: cart.map((c) => ({
        menuItemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
      })),
      paymentMethod: orderType === 'ROOM_SERVICE' ? 'ROOM_FOLIO' : 'UPI',
      specialInstructions: specialInstructions.trim(),
    });

    setCart([]);
    setIsOrderModalOpen(false);
  };

  return (
    <section id="dining-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c5a059]">
          The Awadhi Dastarkhwan
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a1e3f]">
          Culinary Heritage of Lucknow
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto"></div>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm">
          Indulge in time-honored slow-cooked delicacies, fragrant Dum Biryanis, artisanal Galawati Kebabs, and
          creamy Shahi gravies prepared by master chefs adhering to authentic royal Awadhi gastronomy.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#0f2b5c] text-white shadow-md shadow-[#0f2b5c]/25 border border-[#0f2b5c]'
                  : 'bg-white text-slate-700 hover:bg-blue-50/60 hover:text-[#0f2b5c] border border-slate-200 shadow-xs'
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* Veg Only Toggle */}
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
              filterVegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${filterVegOnly ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'}`}
            ></span>
            <span>Pure Vegetarian Only</span>
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((item) => {
          const cartItem = cart.find((c) => c.item.id === item.id);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-[#1e3a8a] rounded-2xl overflow-hidden card-glow-hover flex flex-col justify-between shadow-xs transition-all"
            >
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Dietary Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center bg-white shadow-xs ${
                      item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}
                    ></span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-black/70 backdrop-blur-sm text-white">
                    {item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                  </span>
                </div>

                {item.isChefSpecial && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-bold uppercase shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Chef Special</span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 text-[11px] text-white bg-black/65 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#c5a059]" />
                  <span>{item.preparationMinutes} mins prep</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0a1e3f]">{item.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Tariff</span>
                    <p className="font-serif text-xl font-bold text-[#0f2b5c]">
                      {formatCurrencyINR(item.price)}
                    </p>
                  </div>

                  {cartItem ? (
                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg p-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded bg-white text-slate-800 font-bold hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#0a1e3f] px-1.5">{cartItem.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 rounded bg-[#0f2b5c] text-white font-bold hover:bg-[#1e3a8a] flex items-center justify-center text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-3.5 py-2 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Tray</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tray / Order Bar if items in cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 no-print animate-in slide-in-from-bottom-4">
          <div className="bg-[#0a1e3f] border-2 border-[#c5a059]/60 shadow-[0_12px_40px_rgba(10,30,63,0.35)] rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md glow-blue">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#c5a059]" />
                <span className="text-xs font-bold text-white">
                  {cart.reduce((s, c) => s + c.quantity, 0)} Items Selected
                </span>
              </div>
              <p className="text-sm font-bold text-[#f5e6c8]">{formatCurrencyINR(cartGrandTotal)} (incl. 5% GST)</p>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/30 transition-all cursor-pointer"
            >
              Order to Room / Table
            </button>
          </div>
        </div>
      )}

      {/* Order Submission Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900 bg-[#0a1e3f]">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#c5a059]" />
                <h3 className="font-serif text-lg font-bold text-white">Confirm Food & Dining Order</h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 text-slate-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Order Type */}
              <div>
                <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1.5">
                  Service Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ROOM_SERVICE', label: 'Room Service' },
                    { id: 'DINE_IN', label: 'Dine-In Canteen' },
                    { id: 'TAKEAWAY', label: 'Takeaway Box' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOrderType(t.id as any)}
                      className={`p-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                        orderType === t.id
                          ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection if Room Service */}
              {orderType === 'ROOM_SERVICE' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                    Deliver to Room Number *
                  </label>
                  <select
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                    required
                  >
                    <option value="">-- Choose Assigned Room --</option>
                    {occupiedRooms.map((r) => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.currentGuestName || 'Occupied'})
                      </option>
                    ))}
                    {rooms.map((r) => (
                      <option key={'opt-' + r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} (Floor {r.floor})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Room charges will be posted to your room folio and billed at checkout.
                  </p>
                </div>
              )}

              {/* Guest Name if Dine In / Takeaway */}
              {orderType !== 'ROOM_SERVICE' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                    Customer Name / Table Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 / Ankit Verma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                    required
                  />
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-[#0a1e3f] uppercase mb-1">
                  Preparation Notes / Spice Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild spice, extra onions and lemon, cutlery required"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c]"
                />
              </div>

              {/* Itemized Order Preview */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5">
                <p className="font-bold text-[#0a1e3f] text-[11px] uppercase">Selected Dishes</p>
                <div className="divide-y divide-blue-100 max-h-36 overflow-y-auto">
                  {cart.map((c) => (
                    <div key={c.item.id} className="py-1.5 flex justify-between text-slate-700">
                      <span>
                        {c.quantity}x {c.item.name}
                      </span>
                      <span className="font-semibold text-[#0a1e3f]">
                        {formatCurrencyINR(c.item.price * c.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between font-bold text-[#0a1e3f] text-sm">
                  <span>Grand Total (with 5% GST)</span>
                  <span className="text-[#0f2b5c]">{formatCurrencyINR(cartGrandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

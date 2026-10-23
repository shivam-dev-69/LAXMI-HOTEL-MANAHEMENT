/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Utensils,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CanteenMenuItem, CanteenOrder, OrderType } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const CanteenPosView: React.FC = () => {
  const {
    menu,
    orders,
    rooms,
    reservations,
    createCanteenOrder,
    updateOrderStatus,
    toggleMenuItemAvailability,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'KDS' | 'NEW_ORDER' | 'MENU_ITEMS'>('KDS');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // New Order State
  const [orderType, setOrderType] = useState<OrderType>('ROOM_SERVICE');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ROOM_FOLIO' | 'CASH' | 'UPI' | 'CARD'>('ROOM_FOLIO');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderCart, setOrderCart] = useState<{ menuItem: CanteenMenuItem; quantity: number }[]>([]);

  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ACTIVE') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (statusFilter === 'DELIVERED') return o.status === 'DELIVERED';
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const cartSubtotal = orderCart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartTax = Math.round(((cartSubtotal * 5) / 100) * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;

  const handleAddDish = (dish: CanteenMenuItem) => {
    setOrderCart((prev) => {
      const match = prev.find((c) => c.menuItem.id === dish.id);
      if (match) {
        return prev.map((c) => (c.menuItem.id === dish.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { menuItem: dish, quantity: 1 }];
    });
  };

  const handleRemoveDish = (dishId: string) => {
    setOrderCart((prev) =>
      prev
        .map((c) => (c.menuItem.id === dishId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderCart.length === 0) return;

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
      guestName: targetGuestName || 'Walk-in Dining',
      reservationId: resId,
      items: orderCart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
      })),
      paymentMethod,
      specialInstructions: specialInstructions.trim(),
    });

    setOrderCart([]);
    setActiveTab('KDS');
  };

  const totalFnbRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Awadhi Canteen & Kitchen Operations
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Kitchen Display & In-Room Dining POS</h2>
          <p className="text-xs text-slate-300">
            Real-time kitchen order ticket (KOT) queue, automatic room-folio billing, and recipe catalog management.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#141e33] p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('KDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'KDS' ? 'bg-[#c5a059] text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Kitchen Queue ({orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length})
          </button>
          <button
            onClick={() => setActiveTab('NEW_ORDER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'NEW_ORDER' ? 'bg-[#c5a059] text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            + New Order POS
          </button>
          <button
            onClick={() => setActiveTab('MENU_ITEMS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'MENU_ITEMS' ? 'bg-[#c5a059] text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Manage Menu ({menu.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Kitchen Display System (KDS) */}
      {activeTab === 'KDS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter Queue:</span>
              {(['ACTIVE', 'ORDERED', 'PREPARING', 'READY_OUT_FOR_DELIVERY', 'DELIVERED', 'ALL'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      statusFilter === st
                        ? 'bg-[#c5a059] text-slate-950'
                        : 'bg-[#141e33] text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                )
              )}
            </div>

            <span className="text-xs text-slate-400">
              Total F&B Billed: <strong className="text-emerald-400">{formatCurrencyINR(totalFnbRevenue)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const statusColors = {
                ORDERED: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
                PREPARING: 'border-sky-500/50 bg-sky-950/20 text-sky-300',
                READY_OUT_FOR_DELIVERY: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
                DELIVERED: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
                CANCELLED: 'border-rose-500/50 bg-rose-950/20 text-rose-300',
              };

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 bg-[#0d1424] ${
                    statusColors[order.status]
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 border border-white/10">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="pt-1">
                      <p className="font-bold text-white text-sm">
                        {order.roomNumber ? `Deliver to Room ${order.roomNumber}` : order.guestName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Type: {order.orderType.replace('_', ' ')} • Billed:{' '}
                        {order.postedToFolio ? 'Room Folio' : order.paymentMethod}
                      </p>
                    </div>

                    {/* Order Items List */}
                    <div className="bg-[#121929] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-200">
                          <span>
                            <strong>{it.quantity}x</strong> {it.name}
                          </span>
                          <span className="text-slate-400">{formatCurrencyINR(it.price * it.quantity)}</span>
                        </div>
                      ))}
                      {order.specialInstructions && (
                        <p className="text-[10px] text-amber-300 italic pt-1 border-t border-white/5">
                          Note: {order.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Next Status */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="font-bold text-[#c5a059] text-sm">
                      {formatCurrencyINR(order.grandTotal)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {order.status === 'ORDERED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Start Cooking
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'READY_OUT_FOR_DELIVERY')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Send for Delivery
                        </button>
                      )}

                      {order.status === 'READY_OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white transition-colors"
                          title="Cancel Order"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: New Order POS Builder */}
      {activeTab === 'NEW_ORDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Picker (Left) */}
          <div className="lg:col-span-7 bg-[#0d1424] border border-[#222f49] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-[#c5a059]" />
              Select Dishes from Kitchen Menu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {menu.map((dish) => (
                <div
                  key={dish.id}
                  className="p-3 rounded-xl bg-[#141e33] border border-white/5 flex items-center justify-between gap-3 hover:border-[#c5a059]/40 transition-all text-xs"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{dish.name}</p>
                    <p className="text-[11px] text-[#c5a059] font-bold">
                      {formatCurrencyINR(dish.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddDish(dish)}
                    className="p-2 rounded-lg bg-[#182338] hover:bg-[#c5a059] text-slate-300 hover:text-slate-950 font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tray & Post to Folio Form (Right) */}
          <div className="lg:col-span-5 bg-[#0d1424] border border-[#222f49] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#c5a059]" />
              Order Ticket & Folio Posting
            </h3>

            <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Destination / Delivery Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ROOM_SERVICE', 'DINE_IN', 'TAKEAWAY'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`p-2 rounded-lg text-center font-bold text-[10px] border ${
                        orderType === t
                          ? 'bg-[#c5a059] text-slate-950 border-[#c5a059]'
                          : 'bg-[#162035] text-slate-300 border-white/5'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === 'ROOM_SERVICE' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Deliver to Room Number *
                  </label>
                  <select
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    required
                  >
                    <option value="">-- Select In-House Room --</option>
                    {occupiedRooms.map((r) => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} — {r.currentGuestName}
                      </option>
                    ))}
                    {rooms.map((r) => (
                      <option key={'opt-' + r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} (Floor {r.floor})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Guest Name / Table # *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 3 / Vikas Roy"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Billing Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="ROOM_FOLIO">Post to Guest Room Folio (Checkout Pay)</option>
                  <option value="UPI">Direct UPI Instant</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Card POS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Chef Preparation Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra mint chutney, less oil, served with glasses"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              {/* Order Cart Review */}
              <div className="bg-[#121a2d] p-3.5 rounded-xl border border-white/5 space-y-2">
                <span className="font-bold text-white uppercase text-[10px] block">Order Tray</span>
                {orderCart.length > 0 ? (
                  <div className="divide-y divide-white/5 max-h-36 overflow-y-auto">
                    {orderCart.map((c) => (
                      <div key={c.menuItem.id} className="py-1.5 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{c.menuItem.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {c.quantity} x {formatCurrencyINR(c.menuItem.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveDish(c.menuItem.id)}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-white px-1">{c.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleAddDish(c.menuItem)}
                            className="w-5 h-5 rounded bg-[#c5a059] text-slate-950 hover:brightness-110 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No dishes selected yet.</p>
                )}

                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-xs">
                  <span>Grand Total (with 5% GST)</span>
                  <span className="text-[#c5a059] text-sm">{formatCurrencyINR(cartTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderCart.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-40 cursor-pointer"
              >
                Send Order to Kitchen & Post Charge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Menu Item Catalog Management */}
      {activeTab === 'MENU_ITEMS' && (
        <div className="bg-[#0d1424] border border-[#222f49] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white">Menu Item Catalog & Availability</h3>
            <span className="text-xs text-slate-400">Toggle live inventory status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {menu.map((dish) => (
              <div
                key={dish.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  dish.isAvailable
                    ? 'bg-[#141e33] border-white/5'
                    : 'bg-[#1f1719] border-rose-900/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#c5a059]">
                      {dish.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300">
                      {dish.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm mt-1">{dish.name}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{dish.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="font-serif text-base font-bold text-[#f5e6c8]">
                    {formatCurrencyINR(dish.price)}
                  </span>

                  <button
                    onClick={() => toggleMenuItemAvailability(dish.id)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      dish.isAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {dish.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

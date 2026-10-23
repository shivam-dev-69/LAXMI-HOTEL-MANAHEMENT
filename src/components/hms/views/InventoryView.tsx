/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bed,
  CheckCircle2,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Room, RoomCategory, RoomStatus } from '../../../types/hotel.ts';
import { formatCurrencyINR } from '../../../utils/hotelLogic.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const InventoryView: React.FC = () => {
  const { rooms, categories, updateRoomStatus, addRoom } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Room State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState<number>(1);
  const [newCategoryId, setNewCategoryId] = useState<string>(categories[0]?.id || '');
  const [newStatus, setNewStatus] = useState<RoomStatus>('AVAILABLE');
  const [newNotes, setNewNotes] = useState('');

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'ALL' && r.floor !== selectedFloor) return false;
    return true;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    const ok = addRoom({
      roomNumber: newRoomNumber.trim(),
      floor: Number(newFloor),
      categoryId: newCategoryId,
      status: newStatus,
      isClean: newStatus === 'AVAILABLE',
      notes: newNotes.trim() || undefined,
    });

    if (ok) {
      setNewRoomNumber('');
      setNewNotes('');
      setIsAddModalOpen(false);
    }
  };

  const statusColors: Record<RoomStatus, string> = {
    AVAILABLE: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    OCCUPIED: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    RESERVED: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
    DIRTY: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    CLEANING: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    MAINTENANCE: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    OUT_OF_SERVICE: 'bg-slate-800 text-slate-300 border-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Physical Inventory Configuration
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Room Inventory & Tariffs</h2>
          <p className="text-xs text-slate-300">
            Configure rooms, floors, base prices, amenities, and operational availability status.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#c5a059]/25 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Physical Room</span>
        </button>
      </div>

      {/* Category Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const totalInCat = rooms.filter((r) => r.categoryId === cat.id).length;
          const availInCat = rooms.filter((r) => r.categoryId === cat.id && r.status === 'AVAILABLE').length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-[#0d1424] border border-[#222f49] shadow-lg flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#162035] text-[#c5a059]">
                    {cat.acType}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {availInCat} / {totalInCat} Available
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-white mt-1.5">{cat.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Bed: {cat.bedType} • Max: {cat.capacityAdults} Adults
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Base Tariff</span>
                  <p className="font-serif text-lg font-bold text-[#f5e6c8]">
                    {formatCurrencyINR(cat.basePrice)}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  +{formatCurrencyINR(cat.extraAdultPrice)} extra adult
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rooms Floor Table */}
      <div className="bg-[#0d1424] border border-[#222f49] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#101828]">
          <h3 className="font-serif text-base font-bold text-white">Configured Rooms Directory</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedFloor('ALL')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                selectedFloor === 'ALL' ? 'bg-[#c5a059] text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4].map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  selectedFloor === fl ? 'bg-[#c5a059] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Floor {fl}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#121a2d] border-b border-white/10 text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <th className="p-3.5">Room #</th>
                <th className="p-3.5">Floor</th>
                <th className="p-3.5">Room Category</th>
                <th className="p-3.5">Tariff</th>
                <th className="p-3.5">Cleanliness</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-center">Set Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredRooms.map((room) => {
                const cat = categories.find((c) => c.id === room.categoryId);

                return (
                  <tr key={room.roomNumber} className="hover:bg-[#141e33] transition-colors">
                    <td className="p-3.5 font-bold font-serif text-base text-white">
                      {room.roomNumber}
                    </td>
                    <td className="p-3.5 text-slate-300">Floor {room.floor}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-white">{cat?.name}</p>
                      <p className="text-[10px] text-slate-400">{cat?.bedType}</p>
                    </td>
                    <td className="p-3.5 font-medium text-[#f5e6c8]">
                      {formatCurrencyINR(cat?.basePrice || 0)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          room.isClean
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {room.isClean ? 'Sanitized' : 'Dirty'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          statusColors[room.status]
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate text-[11px]">
                      {room.notes || '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      <select
                        value={room.status}
                        onChange={(e) => updateRoomStatus(room.roomNumber, e.target.value as RoomStatus)}
                        className="bg-[#162035] border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:outline-none focus:border-[#c5a059]"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OCCUPIED">OCCUPIED</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="DIRTY">DIRTY</option>
                        <option value="CLEANING">CLEANING</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-base font-bold text-white">Add New Room to Hotel</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-300"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 501"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Floor Level
                </label>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(Number(e.target.value))}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value={1}>1st Floor</option>
                  <option value={2}>2nd Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Room Category
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatCurrencyINR(c.basePrice)}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="AVAILABLE">AVAILABLE (Clean & Inspected)</option>
                  <option value="DIRTY">DIRTY (Needs setup)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Fitting)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corner room facing courtyard"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] text-slate-950 font-bold uppercase tracking-wider hover:brightness-110"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

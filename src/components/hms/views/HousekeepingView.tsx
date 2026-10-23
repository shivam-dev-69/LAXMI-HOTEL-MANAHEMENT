/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { CleaningTaskType, MaintenanceTicket, TaskPriority } from '../../../types/hotel.ts';
import { useHotel } from '../../../context/HotelContext.tsx';

export const HousekeepingView: React.FC = () => {
  const {
    housekeepingTasks,
    toggleChecklistItem,
    completeHousekeepingTask,
    createHousekeepingTask,
    maintenanceTickets,
    createMaintenanceTicket,
    resolveMaintenanceTicket,
    rooms,
    currentUser,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'CLEANING' | 'MAINTENANCE'>('CLEANING');

  // New Maintenance Ticket Modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketRoom, setTicketRoom] = useState(rooms[0]?.roomNumber || '101');
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket['category']>('AC_HVAC');
  const [ticketPriority, setTicketPriority] = useState<TaskPriority>('HIGH');
  const [ticketIssue, setTicketIssue] = useState('');

  // New Housekeeping Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskRoom, setTaskRoom] = useState(rooms[0]?.roomNumber || '101');
  const [taskType, setTaskType] = useState<CleaningTaskType>('DEPARTURE_CLEAN');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('URGENT');
  const [taskNotes, setTaskNotes] = useState('');

  // Ticket Resolution Modal
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIssue.trim()) return;

    createMaintenanceTicket({
      roomNumber: ticketRoom,
      issue: ticketIssue.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      reportedBy: currentUser?.name || 'Staff',
    });

    setTicketIssue('');
    setIsTicketModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const r = rooms.find((rm) => rm.roomNumber === taskRoom);

    createHousekeepingTask({
      roomNumber: taskRoom,
      floor: r?.floor || 1,
      taskType,
      priority: taskPriority,
      notes: taskNotes.trim() || undefined,
    });

    setTaskNotes('');
    setIsTaskModalOpen(false);
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId || !resolutionNotes.trim()) return;

    resolveMaintenanceTicket(resolvingTicketId, resolutionNotes.trim());
    setResolvingTicketId(null);
    setResolutionNotes('');
  };

  const priorityBadges: Record<TaskPriority, string> = {
    URGENT: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    HIGH: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    NORMAL: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    LOW: 'bg-slate-800 text-slate-300 border-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424] border border-[#233352] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Housekeeping & Facilities Maintenance
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Room Readiness & Engineering Desk</h2>
          <p className="text-xs text-slate-300">
            Sanitization checklists, turnover workflows, maintenance tickets, and readiness enforcement.
          </p>
        </div>

        {/* Tab & Modal Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#141e33] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('CLEANING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'CLEANING'
                  ? 'bg-[#c5a059] text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Turnover Tasks ({housekeepingTasks.filter((t) => t.status !== 'COMPLETED').length})
            </button>
            <button
              onClick={() => setActiveTab('MAINTENANCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'MAINTENANCE'
                  ? 'bg-[#c5a059] text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Maintenance ({maintenanceTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length})
            </button>
          </div>

          {activeTab === 'CLEANING' ? (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9e7a32] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </button>
          ) : (
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Log Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Cleaning Tasks View */}
      {activeTab === 'CLEANING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {housekeepingTasks.map((task) => {
            const completedCount = task.checklist.filter((c) => c.done).length;
            const progress = Math.round((completedCount / task.checklist.length) * 100);

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 bg-[#0d1424] ${
                  task.status === 'COMPLETED' ? 'border-emerald-500/30' : 'border-[#222f49]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Floor {task.floor}
                      </span>
                      <h3 className="font-serif text-2xl font-black text-white">
                        Room {task.roomNumber}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          priorityBadges[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-[#c5a059] font-medium">
                        {task.taskType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {task.assignedStaffName && (
                    <p className="text-[11px] text-slate-300 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Assigned to: {task.assignedStaffName}</span>
                    </p>
                  )}

                  {task.notes && (
                    <p className="p-2.5 rounded-lg bg-[#141e33] text-[11px] text-amber-300 border border-white/5">
                      {task.notes}
                    </p>
                  )}

                  {/* Checklist Items */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Sanitization Checklist ({completedCount}/{task.checklist.length})
                    </p>
                    <div className="space-y-1">
                      {task.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleChecklistItem(task.id, item.id)}
                          className={`w-full p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-colors ${
                            item.done
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 line-through'
                              : 'bg-[#141e33] border-white/5 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              item.done
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-600'
                            }`}
                          >
                            {item.done && <Check className="w-3 h-3 font-bold" />}
                          </div>
                          <span className="text-[11px]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{progress}% Completed</span>

                  {task.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => completeHousekeepingTask(task.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                    >
                      Mark Ready & Inspected
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready for Guest</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Tickets View */}
      {activeTab === 'MAINTENANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maintenanceTickets.map((ticket) => {
            const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 bg-[#0d1424] ${
                  isResolved ? 'border-emerald-500/30' : 'border-purple-500/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#c5a059]">
                        {ticket.ticketNumber}
                      </span>
                      <h3 className="font-serif text-2xl font-black text-white">
                        Room {ticket.roomNumber}
                      </h3>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        priorityBadges[ticket.priority]
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-semibold">{ticket.issue}</p>
                  <p className="text-[11px] text-slate-400">
                    Category: <strong className="text-slate-200">{ticket.category}</strong> • Reported By:{' '}
                    {ticket.reportedBy}
                  </p>

                  {ticket.resolutionDetails && (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300">
                      <strong>Resolution:</strong> {ticket.resolutionDetails}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isResolved ? 'bg-emerald-950 text-emerald-300' : 'bg-purple-950 text-purple-300'
                    }`}
                  >
                    {ticket.status}
                  </span>

                  {!isResolved && (
                    <button
                      onClick={() => setResolvingTicketId(ticket.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase"
                    >
                      Log Resolution
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Maintenance Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-base font-bold text-white">Log Engineering Maintenance Issue</h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Affecting Room *
                </label>
                <select
                  value={ticketRoom}
                  onChange={(e) => setTicketRoom(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {rooms.map((r) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Maintenance Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="AC_HVAC">Air Conditioning & HVAC</option>
                  <option value="PLUMBING">Plumbing, Shower & Geyser</option>
                  <option value="ELECTRICAL">Lighting & Electrical Outlets</option>
                  <option value="KEYCARD">Electronic Door Lock / Keycard</option>
                  <option value="FURNITURE">Teakwood Furniture / Bedding</option>
                  <option value="OTHER">Other Repairs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Priority Level
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="URGENT">URGENT (Guest in room)</option>
                  <option value="HIGH">HIGH (Before next checkin)</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Describe Problem in Detail *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. AC compressor humming loud, water dripping into balcony"
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
                >
                  Submit & Hold Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {resolvingTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-serif text-base font-bold text-white">Record Maintenance Resolution</h3>

            <form onSubmit={handleResolveTicket} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Parts Replaced / Work Completed *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Replaced capacitor on outdoor AC unit. Refrigeration cooling tested to 21°C."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicketId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase"
                >
                  Resolve & Send to Cleaning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Housekeeping Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-[#2e3e60] rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-base font-bold text-white">Create Housekeeping Turnover Task</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Target Room *
                </label>
                <select
                  value={taskRoom}
                  onChange={(e) => setTaskRoom(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {rooms.map((r) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Status: {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="DEPARTURE_CLEAN">Departure Turnover Clean</option>
                  <option value="STAYOVER_CLEAN">Stayover Guest Refresh</option>
                  <option value="DEEP_CLEAN">Deep Sanitization</option>
                  <option value="INSPECTION">Supervisor Readiness Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Task Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="URGENT">URGENT (Guest waiting)</option>
                  <option value="HIGH">HIGH</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP guest arrival at 2:00 PM"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] text-slate-950 font-bold uppercase tracking-wider"
                >
                  Dispatch Cleaner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

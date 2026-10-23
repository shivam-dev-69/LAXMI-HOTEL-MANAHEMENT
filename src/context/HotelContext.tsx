/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditLog,
  CanteenMenuItem,
  CanteenOrder,
  CleaningTaskType,
  Folio,
  FolioCategory,
  FolioItem,
  HotelSettings,
  HousekeepingTask,
  Invoice,
  MaintenanceTicket,
  OrderType,
  PaymentRecord,
  PaymentStatus,
  Reservation,
  Room,
  RoomCategory,
  RoomStatus,
  TaskPriority,
  TouristEnquiry,
  User,
  UserRole,
} from '../types/hotel.ts';
import {
  INITIAL_CANTEEN_ORDERS,
  INITIAL_FOLIOS,
  INITIAL_HOTEL_SETTINGS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_INVOICES,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_MENU,
  INITIAL_RESERVATIONS,
  INITIAL_ROOM_CATEGORIES,
  INITIAL_ROOMS,
  INITIAL_TOURIST_ENQUIRIES,
  INITIAL_USERS,
} from '../data/initialData.ts';
import {
  buildTaxInvoice,
  calculateRoomTariff,
  calculateStayNights,
  calculateTaxesAndTotals,
  checkRoomAvailability,
} from '../utils/hotelLogic.ts';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface HotelContextType {
  // Auth & Roles
  currentUser: User | null;
  allUsers: User[];
  loginAsRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => boolean;
  registerUser: (name: string, email: string, phone: string, role?: UserRole) => User;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'STAFF' | 'GUEST';
  openAuthModal: (tab?: 'STAFF' | 'GUEST') => void;
  closeAuthModal: () => void;

  // Navigation State
  activeView: string; // 'website' | 'hms'
  hmsTab: string; // 'overview' | 'reception' | 'inventory' | 'reservations' | 'billing' | 'canteen' | 'housekeeping' | 'concierge' | 'reports' | 'settings'
  setActiveView: (view: string) => void;
  setHmsTab: (tab: string) => void;

  // Hotel Settings
  settings: HotelSettings;
  updateSettings: (newSettings: Partial<HotelSettings>) => void;

  // Inventory & Categories
  categories: RoomCategory[];
  rooms: Room[];
  updateRoomStatus: (roomNumber: string, status: RoomStatus, notes?: string) => void;
  updateRoomCleanliness: (roomNumber: string, isClean: boolean) => void;
  addRoom: (room: Omit<Room, 'id'>) => boolean;

  // Reservations & Availability
  reservations: Reservation[];
  isRoomAvailable: (roomNumber: string, checkIn: string, checkOut: string, excludeResId?: string) => boolean;
  getAvailableRoomsForCategory: (categoryId: string, checkIn: string, checkOut: string) => Room[];
  createReservation: (data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestAddress?: string;
    guestIdType?: Reservation['guestIdType'];
    guestIdNumber?: string;
    categoryId: string;
    roomNumber?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    advanceDeposit: number;
    specialRequests?: string;
    bookingSource: Reservation['bookingSource'];
  }) => { success: boolean; message: string; reservation?: Reservation };
  cancelReservation: (reservationId: string, reason?: string) => void;
  assignRoomToReservation: (reservationId: string, roomNumber: string) => boolean;

  // Check-In and Check-Out Operations
  checkInGuest: (reservationId: string, roomNumber: string, idType?: Reservation['guestIdType'], idNumber?: string) => boolean;
  checkOutGuest: (
    reservationId: string,
    paymentRecord?: { amount: number; method: PaymentRecord['method']; reference: string },
    discountAmount?: number,
    discountReason?: string
  ) => { success: boolean; invoice?: Invoice; message: string };

  // Folios
  folios: Folio[];
  getFolioByReservationId: (reservationId: string) => Folio | undefined;
  addFolioItem: (folioId: string, item: Omit<FolioItem, 'id' | 'folioId' | 'createdAt'>) => void;

  // Invoices
  invoices: Invoice[];
  activeInvoice: Invoice | null;
  setActiveInvoice: (inv: Invoice | null) => void;
  generateInvoiceForReservation: (reservationId: string, discountAmount?: number, discountReason?: string) => Invoice | null;
  recordInvoicePayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'date'>) => boolean;

  // Canteen & Restaurant
  menu: CanteenMenuItem[];
  orders: CanteenOrder[];
  createCanteenOrder: (order: {
    orderType: OrderType;
    roomNumber?: string;
    guestName: string;
    reservationId?: string;
    items: { menuItemId: string; name: string; price: number; quantity: number }[];
    paymentMethod: 'ROOM_FOLIO' | 'CASH' | 'UPI' | 'CARD';
    specialInstructions?: string;
  }) => { success: boolean; order?: CanteenOrder; message: string };
  updateOrderStatus: (orderId: string, status: CanteenOrder['status']) => void;
  toggleMenuItemAvailability: (menuItemId: string) => void;

  // Housekeeping & Maintenance
  housekeepingTasks: HousekeepingTask[];
  createHousekeepingTask: (task: {
    roomNumber: string;
    floor: number;
    taskType: CleaningTaskType;
    priority: TaskPriority;
    notes?: string;
  }) => void;
  toggleChecklistItem: (taskId: string, checkId: string) => void;
  completeHousekeepingTask: (taskId: string) => void;

  maintenanceTickets: MaintenanceTicket[];
  createMaintenanceTicket: (ticket: {
    roomNumber: string;
    issue: string;
    category: MaintenanceTicket['category'];
    priority: TaskPriority;
    reportedBy: string;
  }) => void;
  resolveMaintenanceTicket: (ticketId: string, resolution: string) => void;

  // Tourist Concierge
  touristEnquiries: TouristEnquiry[];
  createTouristEnquiry: (enquiry: Omit<TouristEnquiry, 'id' | 'refCode' | 'createdAt' | 'status'>) => TouristEnquiry;
  updateTouristStatus: (id: string, status: TouristEnquiry['status'], quote?: number, driver?: string) => void;

  // Audit Logs & Toasts
  auditLogs: AuditLog[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial data
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to Owner for evaluation
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [activeView, setActiveView] = useState<string>('website'); // 'website' or 'hms'
  const [hmsTab, setHmsTab] = useState<string>('overview');

  const [settings, setSettings] = useState<HotelSettings>(() => {
    const saved = localStorage.getItem('laxmi_hotel_settings');
    return saved ? JSON.parse(saved) : INITIAL_HOTEL_SETTINGS;
  });

  const [categories, setCategories] = useState<RoomCategory[]>(INITIAL_ROOM_CATEGORIES);

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [folios, setFolios] = useState<Folio[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_folios');
    return saved ? JSON.parse(saved) : INITIAL_FOLIOS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const [menu, setMenu] = useState<CanteenMenuItem[]>(INITIAL_MENU);

  const [orders, setOrders] = useState<CanteenOrder[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_orders');
    return saved ? JSON.parse(saved) : INITIAL_CANTEEN_ORDERS;
  });

  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_hk');
    return saved ? JSON.parse(saved) : INITIAL_HOUSEKEEPING_TASKS;
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_maint');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
  });

  const [touristEnquiries, setTouristEnquiries] = useState<TouristEnquiry[]>(() => {
    const saved = localStorage.getItem('laxmi_hotel_tours');
    return saved ? JSON.parse(saved) : INITIAL_TOURIST_ENQUIRIES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      actorId: 'user-owner',
      actorName: 'Shri Ramakant Trivedi',
      actorRole: 'OWNER',
      action: 'SYSTEM_BOOT',
      details: 'Laxmi Hotel HMS initialized with verified Gomti Nagar room inventory and tax slabs.',
    },
  ]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('laxmi_hotel_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_folios', JSON.stringify(folios));
  }, [folios]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_hk', JSON.stringify(housekeepingTasks));
  }, [housekeepingTasks]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_maint', JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  useEffect(() => {
    localStorage.setItem('laxmi_hotel_tours', JSON.stringify(touristEnquiries));
  }, [touristEnquiries]);

  // Toast Helpers
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'guest',
      actorName: currentUser?.name || 'Guest User',
      actorRole: currentUser?.role || 'GUEST',
      action,
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Auth Operations
  const loginAsRole = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      addToast('info', 'Active User Switched', `Logged in as ${target.name} (${role})`);
      addLog('ROLE_SWITCH', `Switched session role to ${role}`);
    }
  };

  const loginWithEmail = (email: string): boolean => {
    const target = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setCurrentUser(target);
      addToast('success', 'Welcome Back', `Logged in as ${target.name} (${target.role})`);
      addLog('USER_LOGIN', `Logged in via email ${email}`);
      return true;
    }
    // Auto register as guest if not found
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0],
      email,
      role: 'GUEST',
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast('success', 'Guest Account Created', `Signed in as ${newUser.name}`);
    addLog('USER_REGISTER', `New guest registered: ${email}`);
    return true;
  };

  const registerUser = (name: string, email: string, phone: string, role: UserRole = 'GUEST'): User => {
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      role,
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast('success', 'Registration Successful', `Account created for ${name}`);
    addLog('USER_REGISTER', `Created account for ${name} (${role})`);
    return newUser;
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'STAFF' | 'GUEST'>('STAFF');

  const openAuthModal = (tab: 'STAFF' | 'GUEST' = 'STAFF') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    addLog('USER_LOGOUT', `User ${currentUser?.name} logged out`);
    setCurrentUser(null);
    setActiveView('website');
    addToast('info', 'Logged Out', 'You have been signed out safely. HMS console locked.');
  };

  const updateSettings = (newSettings: Partial<HotelSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Updated', 'Hotel profile, policies, and tax rates updated.');
    addLog('UPDATE_SETTINGS', 'Hotel configuration updated by ' + currentUser?.name);
  };

  // Room Inventory Operations
  const updateRoomStatus = (roomNumber: string, status: RoomStatus, notes?: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              status,
              notes: notes !== undefined ? notes : r.notes,
              isClean: status === 'AVAILABLE' ? true : status === 'DIRTY' ? false : r.isClean,
            }
          : r
      )
    );
    addToast('info', 'Room Status Changed', `Room ${roomNumber} is now ${status}`);
    addLog('ROOM_STATUS_CHANGE', `Room ${roomNumber} set to ${status}${notes ? ` (${notes})` : ''}`);
  };

  const updateRoomCleanliness = (roomNumber: string, isClean: boolean) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              isClean,
              status: isClean && r.status === 'CLEANING' ? 'AVAILABLE' : r.status,
            }
          : r
      )
    );
    addToast('info', 'Cleanliness Updated', `Room ${roomNumber} marked as ${isClean ? 'Clean & Inspected' : 'Dirty'}`);
  };

  const addRoom = (roomData: Omit<Room, 'id'>): boolean => {
    if (rooms.some((r) => r.roomNumber === roomData.roomNumber)) {
      addToast('error', 'Duplicate Room Number', `Room ${roomData.roomNumber} already exists in inventory.`);
      return false;
    }
    const newRoom: Room = {
      ...roomData,
      id: 'room-' + roomData.roomNumber,
    };
    setRooms((prev) => [...prev, newRoom]);
    addToast('success', 'Room Added', `Room ${roomData.roomNumber} added to Floor ${roomData.floor}`);
    addLog('ADD_ROOM', `Added room ${roomData.roomNumber} on floor ${roomData.floor}`);
    return true;
  };

  // Availability & Booking Logic
  const isRoomAvailable = (roomNumber: string, checkIn: string, checkOut: string, excludeResId?: string): boolean => {
    const targetRoom = rooms.find((r) => r.roomNumber === roomNumber);
    if (!targetRoom) return false;
    if (targetRoom.status === 'MAINTENANCE' || targetRoom.status === 'OUT_OF_SERVICE') {
      return false;
    }
    return checkRoomAvailability(reservations, roomNumber, checkIn, checkOut, excludeResId);
  };

  const getAvailableRoomsForCategory = (categoryId: string, checkIn: string, checkOut: string): Room[] => {
    return rooms.filter((r) => {
      if (r.categoryId !== categoryId) return false;
      if (r.status === 'MAINTENANCE' || r.status === 'OUT_OF_SERVICE') return false;
      return checkRoomAvailability(reservations, r.roomNumber, checkIn, checkOut);
    });
  };

  const createReservation = (data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestAddress?: string;
    guestIdType?: Reservation['guestIdType'];
    guestIdNumber?: string;
    categoryId: string;
    roomNumber?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    advanceDeposit: number;
    specialRequests?: string;
    bookingSource: Reservation['bookingSource'];
  }): { success: boolean; message: string; reservation?: Reservation } => {
    const category = categories.find((c) => c.id === data.categoryId);
    if (!category) {
      return { success: false, message: 'Invalid room category selected.' };
    }

    const nights = calculateStayNights(data.checkInDate, data.checkOutDate);
    const tariff = calculateRoomTariff(
      category.basePrice,
      data.checkInDate,
      data.checkOutDate,
      data.adults,
      category.capacityAdults,
      category.extraAdultPrice
    );

    let assignedRoom = data.roomNumber;
    if (assignedRoom) {
      const isAvailable = isRoomAvailable(assignedRoom, data.checkInDate, data.checkOutDate);
      if (!isAvailable) {
        return {
          success: false,
          message: `Room ${assignedRoom} is not available for ${data.checkInDate} to ${data.checkOutDate}. Overlap detected.`,
        };
      }
    } else {
      // Auto-assign first available room in category
      const availableRooms = getAvailableRoomsForCategory(data.categoryId, data.checkInDate, data.checkOutDate);
      if (availableRooms.length === 0) {
        return {
          success: false,
          message: `No ${category.name} rooms available between ${data.checkInDate} and ${data.checkOutDate}.`,
        };
      }
      assignedRoom = availableRooms[0].roomNumber;
    }

    const bookingRef = 'LXH-' + Math.floor(10000 + Math.random() * 90000);
    const reservationId = 'res-' + Date.now();
    const folioId = 'fol-' + Date.now();

    const paymentStatus: PaymentStatus =
      data.advanceDeposit >= tariff.subtotal
        ? 'PAID'
        : data.advanceDeposit > 0
        ? 'PARTIALLY_PAID'
        : 'UNPAID';

    const newReservation: Reservation = {
      id: reservationId,
      bookingRef,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestAddress: data.guestAddress,
      guestIdType: data.guestIdType,
      guestIdNumber: data.guestIdNumber,
      isIdVerified: !!data.guestIdNumber,
      categoryId: data.categoryId,
      roomNumber: assignedRoom,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      adults: data.adults,
      children: data.children,
      nightlyRate: tariff.effectiveNightlyRate,
      totalNights: nights,
      roomTotal: tariff.subtotal,
      advanceDeposit: data.advanceDeposit,
      paymentStatus,
      bookingStatus: 'CONFIRMED',
      specialRequests: data.specialRequests,
      bookingSource: data.bookingSource,
      folioId,
      createdAt: new Date().toISOString(),
    };

    // Create Initial Folio
    const initialFolioItems: FolioItem[] = [
      {
        id: 'fi-' + Date.now() + '-1',
        folioId,
        date: data.checkInDate,
        category: 'ROOM_CHARGE',
        description: `Accommodation: ${category.name} (Room ${assignedRoom}) - ${nights} Night(s)`,
        quantity: nights,
        unitPrice: tariff.effectiveNightlyRate,
        amount: tariff.subtotal,
        postedBy: currentUser?.name || 'System',
        createdAt: new Date().toISOString(),
      },
    ];

    if (data.advanceDeposit > 0) {
      initialFolioItems.push({
        id: 'fi-' + Date.now() + '-2',
        folioId,
        date: new Date().toISOString().split('T')[0],
        category: 'PAYMENT',
        description: `Advance Deposit Collected (${data.bookingSource})`,
        quantity: 1,
        unitPrice: data.advanceDeposit,
        amount: data.advanceDeposit,
        postedBy: currentUser?.name || 'Reservation System',
        createdAt: new Date().toISOString(),
      });
    }

    const taxes = calculateTaxesAndTotals(
      tariff.subtotal,
      0,
      0,
      0,
      settings.cgstRatePercent,
      settings.sgstRatePercent
    );

    const newFolio: Folio = {
      id: folioId,
      reservationId,
      roomNumber: assignedRoom,
      guestName: data.guestName,
      status: 'OPEN',
      totalRoomCharges: tariff.subtotal,
      totalCanteenCharges: 0,
      totalOtherCharges: 0,
      totalDiscounts: 0,
      taxableAmount: taxes.taxableAmount,
      cgstAmount: taxes.cgstAmount,
      sgstAmount: taxes.sgstAmount,
      grandTotal: taxes.grandTotal,
      totalPaid: data.advanceDeposit,
      balanceDue: Math.max(0, taxes.grandTotal - data.advanceDeposit),
      items: initialFolioItems,
    };

    setReservations((prev) => [newReservation, ...prev]);
    setFolios((prev) => [newFolio, ...prev]);

    // Mark room as reserved if check-in is today
    const today = new Date().toISOString().split('T')[0];
    if (data.checkInDate === today && assignedRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === assignedRoom
            ? {
                ...r,
                status: 'RESERVED',
                currentReservationId: reservationId,
                currentGuestName: data.guestName,
              }
            : r
        )
      );
    }

    addToast('success', 'Reservation Confirmed', `Booking Ref: ${bookingRef} allocated Room ${assignedRoom}`);
    addLog('CREATE_RESERVATION', `Reservation ${bookingRef} created for ${data.guestName} in Room ${assignedRoom}`);

    return { success: true, message: 'Reservation created successfully', reservation: newReservation };
  };

  const cancelReservation = (reservationId: string, reason?: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, bookingStatus: 'CANCELLED' } : r))
    );

    if (res.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === res.roomNumber && r.currentReservationId === reservationId
            ? { ...r, status: 'AVAILABLE', currentReservationId: undefined, currentGuestName: undefined }
            : r
        )
      );
    }

    addToast('info', 'Booking Cancelled', `Reservation ${res.bookingRef} has been cancelled.`);
    addLog('CANCEL_RESERVATION', `Cancelled reservation ${res.bookingRef}. Reason: ${reason || 'N/A'}`);
  };

  const assignRoomToReservation = (reservationId: string, roomNumber: string): boolean => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return false;

    if (!isRoomAvailable(roomNumber, res.checkInDate, res.checkOutDate, res.id)) {
      addToast('error', 'Room Conflict', `Room ${roomNumber} is unavailable for these dates.`);
      return false;
    }

    // Release old room if held
    if (res.roomNumber && res.roomNumber !== roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === res.roomNumber && r.currentReservationId === reservationId
            ? { ...r, status: 'AVAILABLE', currentReservationId: undefined, currentGuestName: undefined }
            : r
        )
      );
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, roomNumber } : r))
    );

    // Update folio room number
    setFolios((prev) =>
      prev.map((f) => (f.reservationId === reservationId ? { ...f, roomNumber } : f))
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              status: res.bookingStatus === 'CHECKED_IN' ? 'OCCUPIED' : 'RESERVED',
              currentReservationId: reservationId,
              currentGuestName: res.guestName,
            }
          : r
      )
    );

    addToast('success', 'Room Assigned', `Assigned Room ${roomNumber} to ${res.guestName}`);
    addLog('ASSIGN_ROOM', `Reservation ${res.bookingRef} assigned to Room ${roomNumber}`);
    return true;
  };

  // Check-In Guest
  const checkInGuest = (
    reservationId: string,
    roomNumber: string,
    idType?: Reservation['guestIdType'],
    idNumber?: string
  ): boolean => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return false;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? {
              ...r,
              bookingStatus: 'CHECKED_IN',
              roomNumber,
              guestIdType: idType || r.guestIdType,
              guestIdNumber: idNumber || r.guestIdNumber,
              isIdVerified: !!(idNumber || r.guestIdNumber),
            }
          : r
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              status: 'OCCUPIED',
              isClean: true,
              currentReservationId: reservationId,
              currentGuestName: res.guestName,
            }
          : r
      )
    );

    addToast('success', 'Guest Checked In', `${res.guestName} checked into Room ${roomNumber}`);
    addLog('CHECK_IN', `Guest ${res.guestName} (${res.bookingRef}) checked into Room ${roomNumber}`);
    return true;
  };

  // Folio Operations
  const getFolioByReservationId = (reservationId: string) => {
    return folios.find((f) => f.reservationId === reservationId);
  };

  const addFolioItem = (folioId: string, item: Omit<FolioItem, 'id' | 'folioId' | 'createdAt'>) => {
    const newItem: FolioItem = {
      ...item,
      id: 'fi-' + Date.now(),
      folioId,
      createdAt: new Date().toISOString(),
    };

    setFolios((prev) =>
      prev.map((f) => {
        if (f.id !== folioId) return f;
        const updatedItems = [...f.items, newItem];
        let roomTotal = 0;
        let canteenTotal = 0;
        let extrasTotal = 0;
        let discountsTotal = 0;
        let paymentsTotal = 0;

        for (const it of updatedItems) {
          if (it.category === 'ROOM_CHARGE') roomTotal += it.amount;
          else if (it.category === 'CANTEEN' || it.category === 'ROOM_SERVICE') canteenTotal += it.amount;
          else if (it.category === 'DISCOUNT') discountsTotal += Math.abs(it.amount);
          else if (it.category === 'PAYMENT') paymentsTotal += Math.abs(it.amount);
          else if (it.category !== 'TAX') extrasTotal += it.amount;
        }

        const taxes = calculateTaxesAndTotals(
          roomTotal,
          canteenTotal,
          extrasTotal,
          discountsTotal,
          settings.cgstRatePercent,
          settings.sgstRatePercent
        );

        return {
          ...f,
          items: updatedItems,
          totalRoomCharges: roomTotal,
          totalCanteenCharges: canteenTotal,
          totalOtherCharges: extrasTotal,
          totalDiscounts: discountsTotal,
          taxableAmount: taxes.taxableAmount,
          cgstAmount: taxes.cgstAmount,
          sgstAmount: taxes.sgstAmount,
          grandTotal: taxes.grandTotal,
          totalPaid: paymentsTotal,
          balanceDue: Math.max(0, taxes.grandTotal - paymentsTotal),
        };
      })
    );

    addToast('info', 'Folio Updated', `Added ₹${item.amount} (${item.description}) to folio`);
  };

  // Generate Tax Invoice Snapshot
  const generateInvoiceForReservation = (
    reservationId: string,
    discountAmount: number = 0,
    discountReason?: string
  ): Invoice | null => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return null;

    const folio = getFolioByReservationId(reservationId);
    const category = categories.find((c) => c.id === res.categoryId);

    const roomDetails = {
      roomNumber: res.roomNumber || 'Unassigned',
      categoryName: category?.name || 'Deluxe Room',
      bedType: category?.bedType || '1 Double Bed',
      acType: category?.acType || 'AC',
    };

    const invoiceId = 'inv-' + Date.now();
    const invoiceNumber = `INV-LXH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentsReceived: PaymentRecord[] = [];
    if (res.advanceDeposit > 0) {
      paymentsReceived.push({
        id: 'pay-adv-' + Date.now(),
        date: res.checkInDate,
        amount: res.advanceDeposit,
        method: 'UPI',
        referenceNumber: 'ADV-' + res.bookingRef,
        collectedBy: 'Reservation Desk',
      });
    }

    if (folio) {
      const folioPayments = folio.items.filter((i) => i.category === 'PAYMENT');
      for (const p of folioPayments) {
        if (!paymentsReceived.some((pr) => pr.amount === p.amount)) {
          paymentsReceived.push({
            id: p.id,
            date: p.date,
            amount: p.amount,
            method: 'CASH',
            referenceNumber: p.referenceId || 'FOL-PAY-' + p.id.slice(-4),
            collectedBy: p.postedBy,
          });
        }
      }
    }

    const invoice = buildTaxInvoice({
      invoiceId,
      invoiceNumber,
      reservation: res,
      hotelSettings: settings,
      roomDetails,
      folioItems: folio?.items || [],
      paymentsReceived,
      discountAmount,
      discountReason,
      authorizedBy: currentUser?.name,
      generatedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System',
    });

    setInvoices((prev) => [invoice, ...prev]);
    setActiveInvoice(invoice);

    // Link invoice to reservation
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, invoiceId } : r))
    );

    addLog('GENERATE_INVOICE', `Generated Invoice ${invoiceNumber} for ${res.guestName}`);
    return invoice;
  };

  // Check-Out Guest & Generate Final Invoice
  const checkOutGuest = (
    reservationId: string,
    paymentRecord?: { amount: number; method: PaymentRecord['method']; reference: string },
    discountAmount: number = 0,
    discountReason?: string
  ): { success: boolean; invoice?: Invoice; message: string } => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return { success: false, message: 'Reservation not found' };

    const folio = getFolioByReservationId(reservationId);
    if (paymentRecord && paymentRecord.amount > 0 && folio) {
      addFolioItem(folio.id, {
        date: new Date().toISOString().split('T')[0],
        category: 'PAYMENT',
        description: `Checkout Settlement via ${paymentRecord.method} (Ref: ${paymentRecord.reference})`,
        quantity: 1,
        unitPrice: paymentRecord.amount,
        amount: paymentRecord.amount,
        referenceId: paymentRecord.reference,
        postedBy: currentUser?.name || 'Reception Staff',
      });
    }

    // Generate Final Immutable Invoice
    const invoice = generateInvoiceForReservation(reservationId, discountAmount, discountReason);

    // Update reservation status
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? {
              ...r,
              bookingStatus: 'CHECKED_OUT',
              paymentStatus: invoice?.paymentStatus || 'PAID',
            }
          : r
      )
    );

    // Update room to DIRTY awaiting housekeeping cleaning
    if (res.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === res.roomNumber
            ? {
                ...r,
                status: 'DIRTY',
                isClean: false,
                currentReservationId: undefined,
                currentGuestName: undefined,
                notes: 'Awaiting departure turnover cleaning',
              }
            : r
        )
      );

      // Auto create housekeeping departure cleaning task
      const targetRoom = rooms.find((r) => r.roomNumber === res.roomNumber);
      createHousekeepingTask({
        roomNumber: res.roomNumber,
        floor: targetRoom?.floor || 1,
        taskType: 'DEPARTURE_CLEAN',
        priority: 'URGENT',
        notes: `Turnover after checkout of ${res.guestName}`,
      });
    }

    addToast('success', 'Checkout Complete', `Guest ${res.guestName} checked out. Invoice ${invoice?.invoiceNumber} generated.`);
    addLog('CHECK_OUT', `Completed checkout for ${res.guestName}. Room ${res.roomNumber} set to DIRTY.`);

    return {
      success: true,
      invoice: invoice || undefined,
      message: 'Checkout completed successfully',
    };
  };

  const recordInvoicePayment = (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'date'>): boolean => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newRecord: PaymentRecord = {
          ...payment,
          id: 'pay-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
        };
        const updatedPayments = [...inv.paymentsReceived, newRecord];
        const totalPaid = Math.round(
          (inv.advanceDeposit + updatedPayments.reduce((s, p) => s + p.amount, 0)) * 100
        ) / 100;
        const balanceDue = Math.max(0, Math.round((inv.grandTotal - totalPaid) * 100) / 100);
        const paymentStatus: PaymentStatus = balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

        return {
          ...inv,
          paymentsReceived: updatedPayments,
          balanceDue,
          paymentStatus,
        };
      })
    );
    addToast('success', 'Payment Recorded', `Received ₹${payment.amount} via ${payment.method}`);
    addLog('INVOICE_PAYMENT', `Recorded payment of ₹${payment.amount} for invoice ${invoiceId}`);
    return true;
  };

  // Canteen & Restaurant
  const createCanteenOrder = (orderData: {
    orderType: OrderType;
    roomNumber?: string;
    guestName: string;
    reservationId?: string;
    items: { menuItemId: string; name: string; price: number; quantity: number }[];
    paymentMethod: 'ROOM_FOLIO' | 'CASH' | 'UPI' | 'CARD';
    specialInstructions?: string;
  }): { success: boolean; order?: CanteenOrder; message: string } => {
    const subtotal = orderData.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = Math.round(((subtotal * 5) / 100) * 100) / 100; // 5% GST on Restaurant F&B
    const grandTotal = Math.round((subtotal + tax) * 100) / 100;
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ord-' + Date.now();

    const newOrder: CanteenOrder = {
      id: orderId,
      orderNumber,
      orderType: orderData.orderType,
      roomNumber: orderData.roomNumber,
      guestName: orderData.guestName,
      reservationId: orderData.reservationId,
      items: orderData.items,
      subtotal,
      tax,
      grandTotal,
      status: 'ORDERED',
      postedToFolio: false,
      paymentMethod: orderData.paymentMethod,
      specialInstructions: orderData.specialInstructions,
      createdAt: new Date().toISOString(),
    };

    // If Room Service and payment method is Room Folio, link directly to Folio
    if (orderData.orderType === 'ROOM_SERVICE' && orderData.paymentMethod === 'ROOM_FOLIO') {
      let targetFolio: Folio | undefined;
      if (orderData.reservationId) {
        targetFolio = getFolioByReservationId(orderData.reservationId);
      } else if (orderData.roomNumber) {
        targetFolio = folios.find((f) => f.roomNumber === orderData.roomNumber && f.status === 'OPEN');
      }

      if (targetFolio) {
        addFolioItem(targetFolio.id, {
          date: new Date().toISOString().split('T')[0],
          category: 'ROOM_SERVICE',
          description: `In-Room Dining (${orderNumber}): ${orderData.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
          quantity: 1,
          unitPrice: grandTotal,
          amount: grandTotal,
          referenceId: orderNumber,
          postedBy: currentUser?.name || 'Canteen Staff',
        });
        newOrder.postedToFolio = true;
      }
    }

    setOrders((prev) => [newOrder, ...prev]);
    addToast('success', 'Kitchen Order Placed', `${orderNumber} for ${orderData.roomNumber ? `Room ${orderData.roomNumber}` : orderData.guestName} placed.`);
    addLog('CANTEEN_ORDER', `Placed ${orderNumber} (${orderData.orderType}) total ₹${grandTotal}`);
    return { success: true, order: newOrder, message: 'Order submitted to kitchen' };
  };

  const updateOrderStatus = (orderId: string, status: CanteenOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    addToast('info', 'Order Status', `Order status updated to ${status}`);
    addLog('UPDATE_ORDER_STATUS', `Order ${orderId} status set to ${status}`);
  };

  const toggleMenuItemAvailability = (menuItemId: string) => {
    setMenu((prev) =>
      prev.map((m) => (m.id === menuItemId ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  // Housekeeping & Maintenance
  const createHousekeepingTask = (task: {
    roomNumber: string;
    floor: number;
    taskType: CleaningTaskType;
    priority: TaskPriority;
    notes?: string;
  }) => {
    const newTask: HousekeepingTask = {
      id: 'hk-' + Date.now(),
      roomNumber: task.roomNumber,
      floor: task.floor,
      taskType: task.taskType,
      priority: task.priority,
      status: 'PENDING',
      checklist: [
        { id: 'c1', label: 'Linen and bedsheet replacement & sanitation', done: false },
        { id: 'c2', label: 'Bathroom scrub, shower & geyser sanitization', done: false },
        { id: 'c3', label: 'Disinfect remote controls, light switches, and phone', done: false },
        { id: 'c4', label: 'Replenish mineral water, herbal toiletries & tea-kit', done: false },
        { id: 'c5', label: 'Floor vacuuming and aromatic room freshening', done: false },
      ],
      notes: task.notes,
      createdAt: new Date().toISOString(),
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);
  };

  const toggleChecklistItem = (taskId: string, checkId: string) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((c) =>
          c.id === checkId ? { ...c, done: !c.done } : c
        );
        const allDone = updatedChecklist.every((c) => c.done);
        return {
          ...t,
          checklist: updatedChecklist,
          status: allDone ? 'COMPLETED' : 'IN_PROGRESS',
        };
      })
    );
  };

  const completeHousekeepingTask = (taskId: string) => {
    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    setHousekeepingTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'COMPLETED',
              checklist: t.checklist.map((c) => ({ ...c, done: true })),
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // Update room status to AVAILABLE and clean
    updateRoomCleanliness(task.roomNumber, true);
    updateRoomStatus(task.roomNumber, 'AVAILABLE', 'Cleaned and ready for guests');
    addToast('success', 'Room Ready', `Room ${task.roomNumber} cleaned, inspected and available.`);
    addLog('HOUSEKEEPING_COMPLETED', `Housekeeping completed for room ${task.roomNumber}`);
  };

  const createMaintenanceTicket = (ticket: {
    roomNumber: string;
    issue: string;
    category: MaintenanceTicket['category'];
    priority: TaskPriority;
    reportedBy: string;
  }) => {
    const newTicket: MaintenanceTicket = {
      id: 'maint-' + Date.now(),
      ticketNumber: 'TKT-' + Math.floor(100 + Math.random() * 900),
      roomNumber: ticket.roomNumber,
      issue: ticket.issue,
      category: ticket.category,
      priority: ticket.priority,
      status: 'OPEN',
      reportedBy: ticket.reportedBy,
      createdAt: new Date().toISOString(),
    };
    setMaintenanceTickets((prev) => [newTicket, ...prev]);
    // Set room to maintenance status
    updateRoomStatus(ticket.roomNumber, 'MAINTENANCE', ticket.issue);
    addToast('warning', 'Maintenance Logged', `Room ${ticket.roomNumber} logged for ${ticket.category}.`);
  };

  const resolveMaintenanceTicket = (ticketId: string, resolution: string) => {
    const tkt = maintenanceTickets.find((t) => t.id === ticketId);
    if (!tkt) return;

    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'RESOLVED', resolutionDetails: resolution, resolvedAt: new Date().toISOString() }
          : t
      )
    );

    // Prompt housekeeping inspection
    updateRoomStatus(tkt.roomNumber, 'DIRTY', 'Maintenance resolved. Needs turnover cleaning.');
    addToast('success', 'Ticket Resolved', `Maintenance in Room ${tkt.roomNumber} resolved.`);
  };

  // Tourist Concierge
  const createTouristEnquiry = (
    enquiryData: Omit<TouristEnquiry, 'id' | 'refCode' | 'createdAt' | 'status'>
  ): TouristEnquiry => {
    const refCode = 'TOU-' + Math.floor(1000 + Math.random() * 9000);
    const newEnquiry: TouristEnquiry = {
      ...enquiryData,
      id: 'tour-' + Date.now(),
      refCode,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };
    setTouristEnquiries((prev) => [newEnquiry, ...prev]);
    addToast('success', 'Tourist Request Received', `Concierge reference ${refCode} created.`);
    addLog('TOURIST_ENQUIRY', `Created tourist service request ${refCode} for ${enquiryData.guestName}`);
    return newEnquiry;
  };

  const updateTouristStatus = (
    id: string,
    status: TouristEnquiry['status'],
    quote?: number,
    driver?: string
  ) => {
    setTouristEnquiries((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              estimatedCost: quote !== undefined ? quote : t.estimatedCost,
              assignedDriver: driver !== undefined ? driver : t.assignedDriver,
            }
          : t
      )
    );
    addToast('info', 'Concierge Updated', `Request status updated to ${status}`);
  };

  return (
    <HotelContext.Provider
      value={{
        currentUser,
        allUsers,
        loginAsRole,
        loginWithEmail,
        registerUser,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        activeView,
        hmsTab,
        setActiveView,
        setHmsTab,
        settings,
        updateSettings,
        categories,
        rooms,
        updateRoomStatus,
        updateRoomCleanliness,
        addRoom,
        reservations,
        isRoomAvailable,
        getAvailableRoomsForCategory,
        createReservation,
        cancelReservation,
        assignRoomToReservation,
        checkInGuest,
        checkOutGuest,
        folios,
        getFolioByReservationId,
        addFolioItem,
        invoices,
        activeInvoice,
        setActiveInvoice,
        generateInvoiceForReservation,
        recordInvoicePayment,
        menu,
        orders,
        createCanteenOrder,
        updateOrderStatus,
        toggleMenuItemAvailability,
        housekeepingTasks,
        createHousekeepingTask,
        toggleChecklistItem,
        completeHousekeepingTask,
        maintenanceTickets,
        createMaintenanceTicket,
        resolveMaintenanceTicket,
        touristEnquiries,
        createTouristEnquiry,
        updateTouristStatus,
        auditLogs,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

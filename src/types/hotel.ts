/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'OWNER'
  | 'MANAGER'
  | 'RECEPTIONIST'
  | 'HOUSEKEEPING'
  | 'CANTEEN'
  | 'ACCOUNTANT'
  | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  passwordHash?: string;
}

export type RoomCategoryCode = 'AC_EXEC' | 'VIP_SUITE' | 'NON_AC_ECO' | 'ROYAL_DOUBLE' | 'FAMILY_SUITE' | 'SINGLE_BIZ';

export interface RoomCategory {
  id: string;
  code: RoomCategoryCode;
  name: string;
  description: string;
  basePrice: number; // in INR ₹
  extraAdultPrice: number;
  capacityAdults: number;
  capacityChildren: number;
  bedType: string;
  acType: 'AC' | 'Non-AC';
  amenities: string[];
  images: string[];
  rating: number;
  sizeSqFt: number;
}

export type RoomStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'DIRTY'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  categoryId: string;
  status: RoomStatus;
  isClean: boolean;
  notes?: string;
  currentReservationId?: string;
  currentGuestName?: string;
}

export type PaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'REFUNDED';
export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type BookingSource = 'ONLINE_PORTAL' | 'WALK_IN' | 'PHONE_RECEPTION' | 'TRAVEL_AGENT';
export type IdProofType = 'AADHAAR' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID';

export interface Reservation {
  id: string;
  bookingRef: string; // e.g. LXH-84920
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string;
  guestIdType?: IdProofType;
  guestIdNumber?: string;
  isIdVerified: boolean;
  categoryId: string;
  roomNumber?: string; // Assigned physical room (can be unassigned initially)
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  nightlyRate: number;
  totalNights: number;
  roomTotal: number;
  advanceDeposit: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  specialRequests?: string;
  bookingSource: BookingSource;
  folioId?: string;
  invoiceId?: string;
  createdAt: string;
}

export type FolioCategory =
  | 'ROOM_CHARGE'
  | 'CANTEEN'
  | 'ROOM_SERVICE'
  | 'LAUNDRY'
  | 'EXTRA_BED'
  | 'MINIBAR'
  | 'TAX'
  | 'DISCOUNT'
  | 'PAYMENT';

export interface FolioItem {
  id: string;
  folioId: string;
  date: string;
  category: FolioCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  referenceId?: string;
  postedBy: string;
  createdAt: string;
}

export interface Folio {
  id: string;
  reservationId: string;
  roomNumber?: string;
  guestName: string;
  items: FolioItem[];
  totalRoomCharges: number;
  totalCanteenCharges: number;
  totalOtherCharges: number;
  totalDiscounts: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
  totalPaid: number;
  balanceDue: number;
  status: 'OPEN' | 'SETTLED' | 'VOID';
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE_SANDBOX';
  referenceNumber: string;
  collectedBy: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sacCode: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-LXH-2026-0042
  bookingRef: string;
  reservationId: string;
  hotelSnapshot: {
    name: string;
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    gstin: string;
    sacCode: string;
  };
  guestDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    idType?: IdProofType;
    idNumber?: string;
  };
  roomDetails: {
    roomNumber: string;
    categoryName: string;
    bedType: string;
    acType: 'AC' | 'Non-AC';
  };
  stayPeriod: {
    checkInDate: string;
    checkOutDate: string;
    totalNights: number;
    adults: number;
    children: number;
  };
  itemizedCharges: InvoiceItem[];
  roomSubtotal: number;
  canteenSubtotal: number;
  extrasSubtotal: number;
  discountAmount: number;
  discountReason?: string;
  authorizedBy?: string;
  taxableAmount: number;
  cgstRate: number; // e.g. 6%
  cgstAmount: number;
  sgstRate: number; // e.g. 6%
  sgstAmount: number;
  grandTotal: number;
  advanceDeposit: number;
  paymentsReceived: PaymentRecord[];
  balanceDue: number;
  paymentStatus: PaymentStatus;
  generatedAt: string;
  generatedBy: string;
  policyNotes: string;
  thankYouMessage: string;
}

export type MenuCategory =
  | 'BREAKFAST'
  | 'LUCKNOWI_AWADHI'
  | 'MAIN_COURSE'
  | 'TANDOOR_SNACKS'
  | 'BEVERAGES'
  | 'DESSERTS';

export interface CanteenMenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  isVeg: boolean;
  isChefSpecial: boolean;
  preparationMinutes: number;
  isAvailable: boolean;
  image: string;
}

export type OrderType = 'ROOM_SERVICE' | 'DINE_IN' | 'TAKEAWAY';
export type OrderStatus = 'ORDERED' | 'PREPARING' | 'READY_OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CanteenOrder {
  id: string;
  orderNumber: string; // ORD-2041
  orderType: OrderType;
  roomNumber?: string;
  guestName: string;
  reservationId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: OrderStatus;
  postedToFolio: boolean;
  paymentMethod?: 'ROOM_FOLIO' | 'CASH' | 'UPI' | 'CARD';
  createdAt: string;
  specialInstructions?: string;
}

export type CleaningTaskType =
  | 'DEPARTURE_CLEAN'
  | 'STAYOVER_CLEAN'
  | 'DEEP_CLEAN'
  | 'INSPECTION'
  | 'LINEN_CHANGE';

export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'INSPECTED';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor: number;
  taskType: CleaningTaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  checklist: ChecklistItem[];
  notes?: string;
  lostAndFoundNotes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string; // TKT-108
  roomNumber: string;
  issue: string;
  category: 'AC_HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'KEYCARD' | 'OTHER';
  priority: TaskPriority;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reportedBy: string;
  assignedTo?: string;
  resolutionDetails?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface TouristEnquiry {
  id: string;
  refCode: string; // TOU-392
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomNumber?: string;
  serviceType: 'SIGHTSEEING_TOUR' | 'AIRPORT_RAILWAY_CAB' | 'PRIVATE_CHAUFFEUR' | 'FOOD_WALK_HERITAGE';
  destinations: string[];
  date: string;
  persons: number;
  notes?: string;
  estimatedCost: number;
  status: 'SUBMITTED' | 'QUOTED' | 'ASSIGNED' | 'COMPLETED';
  assignedDriver?: string;
  createdAt: string;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  sacCode: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  cgstRatePercent: number; // Default 6% (standard GST 12%)
  sgstRatePercent: number; // Default 6%
  cancellationPolicy: string;
  termsConditions: string;
  invoiceFooter: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

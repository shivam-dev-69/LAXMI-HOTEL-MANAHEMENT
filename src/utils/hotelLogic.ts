/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FolioItem,
  HotelSettings,
  IdProofType,
  Invoice,
  InvoiceItem,
  PaymentRecord,
  PaymentStatus,
  Reservation,
  UserRole,
} from '../types/hotel.ts';

/**
 * Calculates number of nights between two YYYY-MM-DD dates (minimum 1)
 */
export function calculateStayNights(checkInDate: string, checkOutDate: string): number {
  if (!checkInDate || !checkOutDate) return 1;
  const start = new Date(checkInDate + 'T00:00:00Z').getTime();
  const end = new Date(checkOutDate + 'T00:00:00Z').getTime();
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Calculates room stay total with optional extra-adult charges
 */
export function calculateRoomTariff(
  nightlyRate: number,
  checkInDate: string,
  checkOutDate: string,
  adults: number = 1,
  baseCapacity: number = 2,
  extraAdultCharge: number = 500
): {
  nights: number;
  baseRatePerNight: number;
  extraAdults: number;
  extraAdultChargePerNight: number;
  effectiveNightlyRate: number;
  subtotal: number;
} {
  const nights = calculateStayNights(checkInDate, checkOutDate);
  const extraAdults = Math.max(0, adults - baseCapacity);
  const extraChargePerNight = extraAdults * Math.max(0, extraAdultCharge);
  const effectiveNightlyRate = Math.max(0, nightlyRate) + extraChargePerNight;
  const subtotal = effectiveNightlyRate * nights;

  return {
    nights,
    baseRatePerNight: Math.max(0, nightlyRate),
    extraAdults,
    extraAdultChargePerNight: extraChargePerNight,
    effectiveNightlyRate,
    subtotal: Math.round(subtotal * 100) / 100,
  };
}

/**
 * Decimal-safe GST tax calculations (CGST + SGST) for Indian Hospitality standard
 */
export function calculateTaxesAndTotals(
  roomSubtotal: number,
  canteenSubtotal: number = 0,
  extrasSubtotal: number = 0,
  discountAmount: number = 0,
  cgstRatePercent: number = 6,
  sgstRatePercent: number = 6
): {
  grossSubtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
  grandTotal: number;
} {
  const safeRoom = Math.max(0, Math.round(roomSubtotal * 100) / 100);
  const safeCanteen = Math.max(0, Math.round(canteenSubtotal * 100) / 100);
  const safeExtras = Math.max(0, Math.round(extrasSubtotal * 100) / 100);
  const grossSubtotal = Math.round((safeRoom + safeCanteen + safeExtras) * 100) / 100;

  const safeDiscount = Math.min(grossSubtotal, Math.max(0, Math.round(discountAmount * 100) / 100));
  const taxableAmount = Math.max(0, Math.round((grossSubtotal - safeDiscount) * 100) / 100);

  const cgstAmount = Math.round(((taxableAmount * cgstRatePercent) / 100) * 100) / 100;
  const sgstAmount = Math.round(((taxableAmount * sgstRatePercent) / 100) * 100) / 100;
  const totalTax = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100;

  return {
    grossSubtotal,
    discountAmount: safeDiscount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    totalTax,
    grandTotal,
  };
}

/**
 * Verifies if a room is available during requested dates without overlapping bookings.
 * Two stays overlap if (requestedStart < bookedEnd) AND (requestedEnd > bookedStart).
 */
export function checkRoomAvailability(
  existingReservations: Reservation[],
  roomNumber: string,
  reqCheckIn: string,
  reqCheckOut: string,
  excludeReservationId?: string
): boolean {
  if (!roomNumber) return false;
  const reqStart = new Date(reqCheckIn + 'T00:00:00Z').getTime();
  const reqEnd = new Date(reqCheckOut + 'T00:00:00Z').getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    return false;
  }

  for (const res of existingReservations) {
    if (excludeReservationId && res.id === excludeReservationId) {
      continue;
    }
    // Only check active reservations for the exact physical room
    if (res.roomNumber === roomNumber) {
      if (res.bookingStatus === 'CANCELLED' || res.bookingStatus === 'CHECKED_OUT') {
        continue;
      }
      const resStart = new Date(res.checkInDate + 'T00:00:00Z').getTime();
      const resEnd = new Date(res.checkOutDate + 'T00:00:00Z').getTime();

      // Check overlap condition
      if (reqStart < resEnd && reqEnd > resStart) {
        return false; // Conflicting reservation exists
      }
    }
  }

  return true;
}

/**
 * Aggregates a Guest Folio and derives billing balance
 */
export function calculateFolioSummary(
  items: FolioItem[],
  cgstRatePercent: number = 6,
  sgstRatePercent: number = 6
): {
  roomCharges: number;
  canteenCharges: number;
  otherCharges: number;
  discounts: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
  totalPayments: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
} {
  let roomCharges = 0;
  let canteenCharges = 0;
  let otherCharges = 0;
  let discounts = 0;
  let totalPayments = 0;

  for (const item of items) {
    if (item.category === 'ROOM_CHARGE') {
      roomCharges += item.amount;
    } else if (item.category === 'CANTEEN' || item.category === 'ROOM_SERVICE') {
      canteenCharges += item.amount;
    } else if (item.category === 'DISCOUNT') {
      discounts += Math.abs(item.amount);
    } else if (item.category === 'PAYMENT') {
      totalPayments += Math.abs(item.amount);
    } else if (item.category !== 'TAX') {
      otherCharges += item.amount;
    }
  }

  const taxCalc = calculateTaxesAndTotals(
    roomCharges,
    canteenCharges,
    otherCharges,
    discounts,
    cgstRatePercent,
    sgstRatePercent
  );

  const roundedPayments = Math.round(totalPayments * 100) / 100;
  const balanceDue = Math.max(0, Math.round((taxCalc.grandTotal - roundedPayments) * 100) / 100);

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (roundedPayments >= taxCalc.grandTotal && taxCalc.grandTotal > 0) {
    paymentStatus = 'PAID';
  } else if (roundedPayments > 0 && roundedPayments < taxCalc.grandTotal) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  return {
    roomCharges: taxCalc.grossSubtotal - (canteenCharges + otherCharges),
    canteenCharges,
    otherCharges,
    discounts: taxCalc.discountAmount,
    taxableAmount: taxCalc.taxableAmount,
    cgstAmount: taxCalc.cgstAmount,
    sgstAmount: taxCalc.sgstAmount,
    grandTotal: taxCalc.grandTotal,
    totalPayments: roundedPayments,
    balanceDue,
    paymentStatus,
  };
}

/**
 * Builds an immutable professional Indian GST tax invoice record
 */
export function buildTaxInvoice(params: {
  invoiceId: string;
  invoiceNumber: string;
  reservation: Reservation;
  hotelSettings: HotelSettings;
  roomDetails: {
    roomNumber: string;
    categoryName: string;
    bedType: string;
    acType: 'AC' | 'Non-AC';
  };
  folioItems: FolioItem[];
  paymentsReceived: PaymentRecord[];
  discountAmount?: number;
  discountReason?: string;
  authorizedBy?: string;
  generatedBy: string;
}): Invoice {
  const {
    invoiceId,
    invoiceNumber,
    reservation,
    hotelSettings,
    roomDetails,
    folioItems,
    paymentsReceived,
    discountAmount = 0,
    discountReason,
    authorizedBy,
    generatedBy,
  } = params;

  let roomSubtotal = 0;
  let canteenSubtotal = 0;
  let extrasSubtotal = 0;
  const itemizedCharges: InvoiceItem[] = [];

  // Group room charges
  const roomItems = folioItems.filter((i) => i.category === 'ROOM_CHARGE');
  if (roomItems.length > 0) {
    for (const r of roomItems) {
      roomSubtotal += r.amount;
      itemizedCharges.push({
        id: r.id,
        description: r.description || `Accommodation - Room ${roomDetails.roomNumber}`,
        sacCode: hotelSettings.sacCode || '996311',
        quantity: r.quantity || 1,
        rate: r.unitPrice || r.amount,
        amount: r.amount,
      });
    }
  } else {
    // Fallback to reservation default room charge
    roomSubtotal = reservation.roomTotal;
    itemizedCharges.push({
      id: 'item-room-stay',
      description: `Room Stay: ${roomDetails.categoryName} (${roomDetails.roomNumber}) - ${reservation.totalNights} Night(s)`,
      sacCode: hotelSettings.sacCode || '996311',
      quantity: reservation.totalNights,
      rate: reservation.nightlyRate,
      amount: reservation.roomTotal,
    });
  }

  // Canteen items
  const canteenItems = folioItems.filter(
    (i) => i.category === 'CANTEEN' || i.category === 'ROOM_SERVICE'
  );
  for (const c of canteenItems) {
    canteenSubtotal += c.amount;
    itemizedCharges.push({
      id: c.id,
      description: `F&B / In-Room Dining: ${c.description}`,
      sacCode: '996331',
      quantity: c.quantity || 1,
      rate: c.unitPrice || c.amount,
      amount: c.amount,
    });
  }

  // Extras items (Laundry, Extra Bed, etc.)
  const extraItems = folioItems.filter(
    (i) =>
      i.category !== 'ROOM_CHARGE' &&
      i.category !== 'CANTEEN' &&
      i.category !== 'ROOM_SERVICE' &&
      i.category !== 'DISCOUNT' &&
      i.category !== 'PAYMENT' &&
      i.category !== 'TAX'
  );
  for (const e of extraItems) {
    extrasSubtotal += e.amount;
    itemizedCharges.push({
      id: e.id,
      description: e.description,
      sacCode: '999799',
      quantity: e.quantity || 1,
      rate: e.unitPrice || e.amount,
      amount: e.amount,
    });
  }

  const taxTotals = calculateTaxesAndTotals(
    roomSubtotal,
    canteenSubtotal,
    extrasSubtotal,
    discountAmount,
    hotelSettings.cgstRatePercent,
    hotelSettings.sgstRatePercent
  );

  const totalPaymentsAmount = paymentsReceived.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = Math.round((reservation.advanceDeposit + totalPaymentsAmount) * 100) / 100;
  const balanceDue = Math.max(0, Math.round((taxTotals.grandTotal - totalPaid) * 100) / 100);

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (totalPaid >= taxTotals.grandTotal && taxTotals.grandTotal > 0) {
    paymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  return {
    id: invoiceId,
    invoiceNumber,
    bookingRef: reservation.bookingRef,
    reservationId: reservation.id,
    hotelSnapshot: {
      name: hotelSettings.hotelName,
      address: hotelSettings.address,
      locality: hotelSettings.locality,
      city: hotelSettings.city,
      state: hotelSettings.state,
      pincode: hotelSettings.pincode,
      phone: hotelSettings.phone,
      email: hotelSettings.email,
      website: hotelSettings.website,
      gstin: hotelSettings.gstin,
      sacCode: hotelSettings.sacCode,
    },
    guestDetails: {
      name: reservation.guestName,
      email: reservation.guestEmail,
      phone: reservation.guestPhone,
      address: reservation.guestAddress,
      idType: reservation.guestIdType,
      idNumber: reservation.guestIdNumber,
    },
    roomDetails: {
      roomNumber: roomDetails.roomNumber,
      categoryName: roomDetails.categoryName,
      bedType: roomDetails.bedType,
      acType: roomDetails.acType,
    },
    stayPeriod: {
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      totalNights: reservation.totalNights,
      adults: reservation.adults,
      children: reservation.children,
    },
    itemizedCharges,
    roomSubtotal,
    canteenSubtotal,
    extrasSubtotal,
    discountAmount: taxTotals.discountAmount,
    discountReason,
    authorizedBy,
    taxableAmount: taxTotals.taxableAmount,
    cgstRate: hotelSettings.cgstRatePercent,
    cgstAmount: taxTotals.cgstAmount,
    sgstRate: hotelSettings.sgstRatePercent,
    sgstAmount: taxTotals.sgstAmount,
    grandTotal: taxTotals.grandTotal,
    advanceDeposit: reservation.advanceDeposit,
    paymentsReceived,
    balanceDue,
    paymentStatus,
    generatedAt: new Date().toISOString(),
    generatedBy,
    policyNotes: hotelSettings.termsConditions,
    thankYouMessage: hotelSettings.invoiceFooter,
  };
}

/**
 * Role-Based Access Control matrix
 */
export function canRoleAccess(
  userRole: UserRole,
  permission:
    | 'VIEW_FINANCIAL_REPORTS'
    | 'MANAGE_SETTINGS'
    | 'MANAGE_ROOM_INVENTORY'
    | 'CHECK_IN_OUT'
    | 'TAKE_CANTEEN_ORDERS'
    | 'MANAGE_KITCHEN'
    | 'UPDATE_HOUSEKEEPING'
    | 'CREATE_INVOICE'
    | 'MANAGE_STAFF'
    | 'MANAGE_CONCIERGE'
): boolean {
  if (userRole === 'OWNER') return true;

  switch (permission) {
    case 'VIEW_FINANCIAL_REPORTS':
      return userRole === 'MANAGER' || userRole === 'ACCOUNTANT';
    case 'MANAGE_SETTINGS':
      return false; // Only OWNER
    case 'MANAGE_STAFF':
      return userRole === 'MANAGER';
    case 'MANAGE_ROOM_INVENTORY':
      return userRole === 'MANAGER';
    case 'CHECK_IN_OUT':
      return userRole === 'MANAGER' || userRole === 'RECEPTIONIST';
    case 'CREATE_INVOICE':
      return userRole === 'MANAGER' || userRole === 'RECEPTIONIST' || userRole === 'ACCOUNTANT';
    case 'TAKE_CANTEEN_ORDERS':
      return userRole === 'MANAGER' || userRole === 'RECEPTIONIST' || userRole === 'CANTEEN';
    case 'MANAGE_KITCHEN':
      return userRole === 'CANTEEN' || userRole === 'MANAGER';
    case 'UPDATE_HOUSEKEEPING':
      return userRole === 'HOUSEKEEPING' || userRole === 'MANAGER' || userRole === 'RECEPTIONIST';
    case 'MANAGE_CONCIERGE':
      return userRole === 'MANAGER' || userRole === 'RECEPTIONIST';
    default:
      return false;
  }
}

/**
 * Currency formatter for Indian Rupees (₹)
 */
export function formatCurrencyINR(amount: number): string {
  const safe = Math.round((amount || 0) * 100) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

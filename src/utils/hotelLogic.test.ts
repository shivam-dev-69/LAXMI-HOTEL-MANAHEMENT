/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStayNights,
  calculateRoomTariff,
  calculateTaxesAndTotals,
  checkRoomAvailability,
  calculateFolioSummary,
  canRoleAccess,
} from './hotelLogic.ts';
import { Reservation, FolioItem } from '../types/hotel.ts';

test('calculateStayNights computes correct calendar nights', () => {
  assert.equal(calculateStayNights('2026-11-01', '2026-11-04'), 3);
  assert.equal(calculateStayNights('2026-11-01', '2026-11-02'), 1);
  // Same day or invalid returns minimum 1 night
  assert.equal(calculateStayNights('2026-11-01', '2026-11-01'), 1);
});

test('calculateRoomTariff calculates base and extra occupant charges accurately', () => {
  // Base 2 adults, 3 adults booked: 1 extra adult @ ₹600/night for 2 nights
  const result = calculateRoomTariff(3500, '2026-11-10', '2026-11-12', 3, 2, 600);
  assert.equal(result.nights, 2);
  assert.equal(result.extraAdults, 1);
  assert.equal(result.extraAdultChargePerNight, 600);
  assert.equal(result.effectiveNightlyRate, 4100);
  assert.equal(result.subtotal, 8200);
});

test('calculateTaxesAndTotals calculates Indian GST (CGST + SGST) accurately', () => {
  // Room: ₹4000, Canteen: ₹1000, Extra: ₹0, Discount: ₹500
  // Taxable: ₹4500. CGST 6% = ₹270, SGST 6% = ₹270, Total tax = ₹540, Grand total = ₹5040
  const tax = calculateTaxesAndTotals(4000, 1000, 0, 500, 6, 6);
  assert.equal(tax.grossSubtotal, 5000);
  assert.equal(tax.discountAmount, 500);
  assert.equal(tax.taxableAmount, 4500);
  assert.equal(tax.cgstAmount, 270);
  assert.equal(tax.sgstAmount, 270);
  assert.equal(tax.totalTax, 540);
  assert.equal(tax.grandTotal, 5040);
});

test('checkRoomAvailability prevents double bookings for overlapping dates', () => {
  const existingBookings: Reservation[] = [
    {
      id: 'res-1',
      bookingRef: 'LXH-1001',
      guestName: 'Amitabh Sharma',
      guestEmail: 'amitabh@example.com',
      guestPhone: '9876543210',
      isIdVerified: true,
      categoryId: 'cat-ac-exec',
      roomNumber: '201',
      checkInDate: '2026-11-10',
      checkOutDate: '2026-11-15',
      adults: 2,
      children: 0,
      nightlyRate: 3500,
      totalNights: 5,
      roomTotal: 17500,
      advanceDeposit: 5000,
      paymentStatus: 'PARTIALLY_PAID',
      bookingStatus: 'CONFIRMED',
      bookingSource: 'ONLINE_PORTAL',
      createdAt: '2026-10-20T10:00:00Z',
    },
  ];

  // Overlapping request: 2026-11-12 to 2026-11-14 for room 201 should be BLOCKED
  const available1 = checkRoomAvailability(existingBookings, '201', '2026-11-12', '2026-11-14');
  assert.equal(available1, false, 'Overlapping booking must be rejected');

  // Overlapping start: 2026-11-08 to 2026-11-11 for room 201 should be BLOCKED
  const available2 = checkRoomAvailability(existingBookings, '201', '2026-11-08', '2026-11-11');
  assert.equal(available2, false, 'Overlapping start must be rejected');

  // Non-overlapping: 2026-11-15 to 2026-11-18 for room 201 (checkout day matches checkin) should be ALLOWED
  const available3 = checkRoomAvailability(existingBookings, '201', '2026-11-15', '2026-11-18');
  assert.equal(available3, true, 'Checkout day check-in should be permitted');

  // Different room: room 202 during same dates should be ALLOWED
  const available4 = checkRoomAvailability(existingBookings, '202', '2026-11-10', '2026-11-15');
  assert.equal(available4, true, 'Different room during same dates must be permitted');

  // Self-reservation edit exclusion
  const available5 = checkRoomAvailability(existingBookings, '201', '2026-11-10', '2026-11-15', 'res-1');
  assert.equal(available5, true, 'Excluding own reservation must pass');
});

test('calculateFolioSummary aggregates room, canteen and payments accurately', () => {
  const items: FolioItem[] = [
    {
      id: 'f1',
      folioId: 'fol-1',
      date: '2026-11-10',
      category: 'ROOM_CHARGE',
      description: 'Night 1 Room Charge',
      quantity: 1,
      unitPrice: 3000,
      amount: 3000,
      postedBy: 'System',
      createdAt: '2026-11-10T12:00:00Z',
    },
    {
      id: 'f2',
      folioId: 'fol-1',
      date: '2026-11-10',
      category: 'CANTEEN',
      description: 'Lucknowi Dum Biryani & Kebabs',
      quantity: 1,
      unitPrice: 850,
      amount: 850,
      postedBy: 'Canteen Staff',
      createdAt: '2026-11-10T19:30:00Z',
    },
    {
      id: 'f3',
      folioId: 'fol-1',
      date: '2026-11-10',
      category: 'PAYMENT',
      description: 'Advance Deposit via UPI',
      quantity: 1,
      unitPrice: 2000,
      amount: 2000,
      postedBy: 'Receptionist',
      createdAt: '2026-11-10T12:30:00Z',
    },
  ];

  const summary = calculateFolioSummary(items, 6, 6);
  // Subtotal = 3850. GST 12% = 462. Grand Total = 4312. Paid = 2000. Balance = 2312.
  assert.equal(summary.taxableAmount, 3850);
  assert.equal(summary.cgstAmount, 231);
  assert.equal(summary.sgstAmount, 231);
  assert.equal(summary.grandTotal, 4312);
  assert.equal(summary.totalPayments, 2000);
  assert.equal(summary.balanceDue, 2312);
  assert.equal(summary.paymentStatus, 'PARTIALLY_PAID');
});

test('canRoleAccess enforces permissions strictly', () => {
  assert.equal(canRoleAccess('OWNER', 'MANAGE_SETTINGS'), true);
  assert.equal(canRoleAccess('RECEPTIONIST', 'MANAGE_SETTINGS'), false);
  assert.equal(canRoleAccess('RECEPTIONIST', 'CHECK_IN_OUT'), true);
  assert.equal(canRoleAccess('HOUSEKEEPING', 'CHECK_IN_OUT'), false);
  assert.equal(canRoleAccess('CANTEEN', 'MANAGE_KITCHEN'), true);
  assert.equal(canRoleAccess('GUEST', 'VIEW_FINANCIAL_REPORTS'), false);
  assert.equal(canRoleAccess('ACCOUNTANT', 'VIEW_FINANCIAL_REPORTS'), true);
});

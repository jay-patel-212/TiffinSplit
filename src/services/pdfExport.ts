import { jsPDF } from 'jspdf';
import { MonthlyBill, MealResponse, User, FlatSettings } from '../types';

export function exportBillToPDF(bill: MonthlyBill, settings: FlatSettings) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.flatName || 'Flat Meal Manager', 14, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Tiffin Bill Statement (${bill.month})`, 14, 32);

  // Summary Card Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 182, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 48, 182, 32, 3, 3, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Expense: ${settings.currency}${bill.totalAmount.toLocaleString()}`, 20, 58);
  doc.text(`Total Meals Ordered: ${bill.totalMeals}`, 20, 66);
  doc.text(`Calculated Cost / Meal: ${settings.currency}${bill.costPerMeal.toFixed(2)}`, 20, 74);

  doc.text(`Payee UPI ID: ${settings.upiId}`, 110, 58);
  doc.text(`Payee Name: ${settings.payeeName}`, 110, 66);
  doc.text(`Tiffin Provider: ${settings.tiffinProviderName || 'N/A'}`, 110, 74);

  // Table Headers
  let y = 92;
  doc.setFillColor(224, 242, 254); // sky-100
  doc.rect(14, y, 182, 10, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Member Name', 18, y + 7);
  doc.text('Meals Taken', 80, y + 7);
  doc.text(`Amount (${settings.currency})`, 120, y + 7);
  doc.text('Payment Status', 160, y + 7);

  y += 12;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  bill.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 5, 182, 10, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(item.userName, 18, y + 2);
    doc.text(`${item.totalMeals} meals`, 80, y + 2);
    doc.text(`${settings.currency}${item.amount.toLocaleString()}`, 120, y + 2);

    if (item.paid) {
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text('PAID', 160, y + 2);
    } else {
      doc.setTextColor(239, 68, 68); // red-500
      doc.text('PENDING', 160, y + 2);
    }

    y += 10;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleDateString()} via Flat Meal Manager`, 14, 280);

  doc.save(`${settings.flatName.replace(/\s+/g, '_')}_Bill_${bill.month}.pdf`);
}

export function exportResponsesToCSV(date: string, responses: MealResponse[], users: User[]) {
  const headers = ['Member Name', 'Email', 'Role', 'Lunch Tiffins', 'Dinner Tiffins', 'Guests', 'Total Meals Today'];
  const rows = users.map((u) => {
    const lunchResp = responses.find((r) => r.date === date && r.type === 'lunch' && r.userId === u.id);
    const dinnerResp = responses.find((r) => r.date === date && r.type === 'dinner' && r.userId === u.id);

    const lunchQty = lunchResp ? lunchResp.quantity : 0;
    const dinnerQty = dinnerResp ? dinnerResp.quantity : 0;
    const guests = (lunchResp ? lunchResp.guestCount : 0) + (dinnerResp ? dinnerResp.guestCount : 0);
    const total = (lunchResp ? lunchResp.totalCount : 0) + (dinnerResp ? dinnerResp.totalCount : 0);

    return [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      lunchQty,
      dinnerQty,
      guests,
      total,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Meal_Orders_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

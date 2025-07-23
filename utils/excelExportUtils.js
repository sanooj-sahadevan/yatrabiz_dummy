import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/client";

// Helper to fetch ticket by PNR (with airline, locations)
async function fetchTicketByPNR(pnr) {
  const res = await apiClient.get(`/api/v1/tickets`);
  const data = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
    ? res.data
    : [];
  if (!data.length) throw new Error("No tickets found");
  return data.find((ticket) => ticket.PNR === pnr);
}

// Helper to fetch bookings by ticketId
async function fetchBookingsByTicket(ticketId) {
  const res = await apiClient.get(`/api/v1/bookings`);
  const data = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
    ? res.data
    : [];
  if (!data.length) throw new Error("No bookings found");
  return data.filter((booking) => {
    if (!booking.ticket) return false;
    if (typeof booking.ticket === "object") {
      return booking.ticket._id === ticketId;
    }
    return booking.ticket === ticketId;
  });
}

export async function exportBookingDetailsToExcel(pnr) {
  const ticket = await fetchTicketByPNR(pnr);
  if (!ticket) throw new Error("Ticket not found");
  const bookings = await fetchBookingsByTicket(ticket._id);
  if (!bookings.length) throw new Error("No bookings found for this ticket");

  // Helper to determine Type from honorific
  function getTypeFromHonorific(honorific) {
    if (!honorific) return "Adult";
    const h = honorific.toLowerCase();
    if (["mr", "mrs", "ms", "mrs.", "mr.", "ms."].includes(h)) return "Adult";
    if (["mstr", "miss", "mstr.", "miss."].includes(h)) return "Child";
    if (["infant", "baby", "infant.", "baby."].includes(h)) return "Infant";
    return "Adult";
  }
  // Helper to determine Gender from honorific
  function getGenderFromHonorific(honorific) {
    if (!honorific) return "";
    const h = honorific.toLowerCase();
    if (["mr", "mr.", "mstr", "mstr.", "baby", "baby."].includes(h))
      return "Male";
    if (
      [
        "mrs",
        "mrs.",
        "ms",
        "ms.",
        "miss",
        "miss.",
        "infant",
        "infant.",
      ].includes(h)
    )
      return "Female";
    return "";
  }

  // Check if airline is IndiGo (case-insensitive)
  const airlineName = ticket.airline?.name?.toLowerCase?.() || "";
  if (airlineName === "indigo") {
    // IndiGo-specific format
    const headers = [
      "Type",
      "Title",
      "First Name",
      "Last Name",
      "DOB",
      "Gender",
    ];
    const rows = [];
    bookings.forEach((booking) => {
      let passengers = booking.passengers || [];
      if (!Array.isArray(passengers)) passengers = [passengers];
      if (!passengers.length) {
        // If no passengers, skip row for IndiGo
        return;
      }
      passengers.forEach((p) => {
        const honorific = p.honorific || "";
        rows.push([
          p.type || getTypeFromHonorific(honorific),
          honorific,
          p.firstName || "",
          p.lastName || "",
          p.dob ? new Date(p.dob).toLocaleDateString() : "",
          getGenderFromHonorific(honorific),
        ]);
      });
    });
    const sheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Details");
    XLSX.writeFile(wb, `BookingDetails_${pnr}_IndiGo.xlsx`);
    return;
  }

  // Define headers for the flat table (modified as per request)
  const headers = [
    "SLnumber",
    "Booking Reference",
    "Title",
    "First Name",
    "Last Name",
    "Type",
    "DOB",
  ];

  const rows = [];
  let slNumber = 1;

  bookings.forEach((booking) => {
    let passengers = booking.passengers || [];
    if (!Array.isArray(passengers)) passengers = [passengers];
    if (!passengers.length) {
      // If no passengers, still add a row for the booking with empty passenger fields
      rows.push([slNumber++, booking.bookingReference, "", "", "", "", ""]);
    } else {
      passengers.forEach((p) => {
        const honorific = p.honorific || "";
        rows.push([
          slNumber++,
          booking.bookingReference,
          honorific,
          p.firstName || "",
          p.lastName || "",
          p.type || getTypeFromHonorific(honorific),
          p.dob ? new Date(p.dob).toLocaleDateString() : "",
        ]);
      });
    }
  });

  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Booking Details");
  XLSX.writeFile(wb, `BookingDetails_${pnr}.xlsx`);
}

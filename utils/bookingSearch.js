// Returns true if the booking or any of its ticket/passenger fields match the query string
export function bookingMatchesSearch(booking, query) {
  if (!query || !booking) return true;
  const q = query.trim().toLowerCase();

  // Booking fields
  const ref = booking.bookingReference?.toLowerCase() || "";
  const bookingStatus = booking.bookingStatus?.toLowerCase() || "";
  const paymentStatus = booking.paymentStatus?.toLowerCase() || "";
  const paymentMethod = booking.paymentMethod?.toLowerCase() || "";
  const totalAmount = booking.totalAmount?.toString() || "";
  const bookingDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString()
    : "";
  const remarks = booking.remarks?.toLowerCase() || "";

  // Ticket fields
  const ticket = booking.ticket || {};
  const airline =
    ticket.airline?.name?.toLowerCase?.() ||
    ticket.airline?.code?.toLowerCase?.() ||
    ticket.airline?.toLowerCase?.() ||
    "";
  const flightNumber = ticket.flightNumber?.toLowerCase() || "";
  const PNR = ticket.PNR?.toLowerCase() || "";
  const journeyType = ticket.journeyType?.toLowerCase() || "";
  const classType = ticket.classType?.toLowerCase() || "";
  const departureLocation =
    ticket.departureLocation?.name?.toLowerCase?.() ||
    ticket.departureLocation?.code?.toLowerCase?.() ||
    ticket.departureLocation?.toLowerCase?.() ||
    "";
  const arrivalLocation =
    ticket.arrivalLocation?.name?.toLowerCase?.() ||
    ticket.arrivalLocation?.code?.toLowerCase?.() ||
    ticket.arrivalLocation?.toLowerCase?.() ||
    "";
  const dateOfJourney = ticket.dateOfJourney
    ? new Date(ticket.dateOfJourney).toLocaleDateString()
    : "";
  const departureTime = ticket.departureTime?.toLowerCase() || "";
  const arrivalTime = ticket.arrivalTime?.toLowerCase() || "";
  const totalSeats = ticket.totalSeats?.toString() || "";
  const availableSeats = ticket.availableSeats?.toString() || "";
  const salePrice = ticket.salePrice?.toString() || "";
  const discount = ticket.Discount?.toString() || "";
  const purchasePrice = ticket.purchasePrice?.toString() || "";
  const outstanding = ticket.outstanding?.toString() || "";
  const advPaidAmount = ticket.advPaidAmount?.toString() || "";
  const handBaggage = ticket.handBaggage?.toLowerCase?.() || "";
  const checkedBaggage = ticket.checkedBaggage?.toLowerCase?.() || "";

  // Passengers
  const passengerFields = Array.isArray(booking.passengers)
    ? booking.passengers
        .map((p) =>
          [
            p.honorific,
            p.firstName,
            p.lastName,
            p.email,
            p.phone,
            p.passportNumber,
            p.nationality,
            p.remarks,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
        )
        .join(" ")
    : "";

  return (
    ref.includes(q) ||
    airline.includes(q) ||
    flightNumber.includes(q) ||
    PNR.includes(q) ||
    journeyType.includes(q) ||
    classType.includes(q) ||
    departureLocation.includes(q) ||
    arrivalLocation.includes(q) ||
    dateOfJourney.includes(q) ||
    departureTime.includes(q) ||
    arrivalTime.includes(q) ||
    totalSeats.includes(q) ||
    availableSeats.includes(q) ||
    salePrice.includes(q) ||
    discount.includes(q) ||
    purchasePrice.includes(q) ||
    outstanding.includes(q) ||
    advPaidAmount.includes(q) ||
    handBaggage.includes(q) ||
    checkedBaggage.includes(q) ||
    totalAmount.includes(q) ||
    paymentStatus.includes(q) ||
    bookingStatus.includes(q) ||
    paymentMethod.includes(q) ||
    bookingDate.includes(q) ||
    remarks.includes(q) ||
    passengerFields.includes(q)
  );
} 
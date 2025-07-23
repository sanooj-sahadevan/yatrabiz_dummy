import emailjs from "emailjs-com";
import { formatDate } from "@/utils/formatters";

export async function sendBookingStatusEmail({
  user,
  ticket,
  passenger,
  statusType,
  extraMessage = "",
}) {
  const ticketAirline = ticket.airline || {};
  const flightNumber = ticket.flightNumber || "-";
  const airlineName = ticketAirline.name || "-";
  const airlineCode = ticketAirline.code || "-";
  const dateOfJourney = ticket.dateOfJourney
    ? formatDate(ticket.dateOfJourney)
    : "-";

  let statusText = "";
  if (statusType === "approved") {
    statusText = "Your booking has been approved.";
  } else if (statusType === "rejected") {
    statusText = "Your booking has been rejected.";
  } else if (statusType === "payment-updated") {
    statusText = "Your booking payment status has been updated.";
  }

  let passengerDetails = "";
  if (passenger) {
    const honorific = passenger.honorific || "";
    const firstName = passenger.firstName || "";
    const lastName = passenger.lastName || "";
    const passengerName = `${honorific} ${firstName} ${lastName}`.trim();
    const isKid = passenger.isKid ? "Yes" : "No";
    const isInfant = passenger.isInfant ? "Yes" : "No";
    const dob = passenger.dob ? formatDate(passenger.dob) : "-";
    passengerDetails = `\nPassenger Name: ${passengerName}\nIs Kid: ${isKid}\nIs Infant: ${isInfant}\nDOB: ${dob}\nStatus: ${passenger.bookingStatus}\nPayment Status: ${passenger.paymentStatus}\nPayment Method: ${passenger.paymentMethod}`;
  }

  const message = `\n${statusText}\n\nBooking Details:\nPNR: ${ticket.PNR}\nFlight Number: ${flightNumber}\nAirline: ${airlineName} (${airlineCode})\nDate of Journey: ${dateOfJourney}${passengerDetails}\n${extraMessage}`;

  const now = new Date();
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    process.env.NEXT_PUBLIC_EMAILJS_SECONDTEMPLATE_ID,
    {
      name: user.name,
      email: user.email,
      time: now.toLocaleString(),
      message,
    },
    process.env.NEXT_PUBLIC_EMAILJS_USER_ID
  );
}

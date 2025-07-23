"use client";
import { formatDate, formatTime, calculateTravelDuration, formatPrice, getStatusColor } from "@/utils/formatters";
import { formatCurrency } from "@/utils/ticketCalculations";

export default function TicketInfoDisplay({ ticket, showDetails = false }) {
  if (!ticket) return null;

  const formattedTicket = {
    dateOfJourney: formatDate(ticket.dateOfJourney, 'ticket-list'),
    departureTime: formatTime(ticket.departureTime),
    arrivalTime: formatTime(ticket.arrivalTime),
    travelDuration: calculateTravelDuration(ticket.dateOfJourney, ticket.departureTime, ticket.arrivalTime),
    salePrice: formatCurrency(ticket.salePrice),
    purchasePrice: formatCurrency(ticket.purchasePrice),
    totalPrice: formatCurrency(ticket.totalPrice),
    advPaidAmount: formatCurrency(ticket.advPaidAmount),
    outstanding: formatCurrency(ticket.outstanding),
    statusColor: getStatusColor(ticket.status || 'Available'),
    availableSeats: `${ticket.availableSeats}/${ticket.totalSeats}`,
    isLowSeats: ticket.availableSeats <= 2 && ticket.availableSeats > 0,
    isNoSeats: ticket.availableSeats === 0
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900">PNR: {ticket.PNR}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${formattedTicket.statusColor}`}>
          {ticket.status || 'Available'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Date:</span>
          <span className="ml-2 font-medium">{formattedTicket.dateOfJourney}</span>
        </div>
        <div>
          <span className="text-gray-600">Duration:</span>
          <span className="ml-2 font-medium">{formattedTicket.travelDuration}</span>
        </div>
        <div>
          <span className="text-gray-600">Departure:</span>
          <span className="ml-2 font-medium">{formattedTicket.departureTime}</span>
        </div>
        <div>
          <span className="text-gray-600">Arrival:</span>
          <span className="ml-2 font-medium">{formattedTicket.arrivalTime}</span>
        </div>
        <div>
          <span className="text-gray-600">Seats:</span>
          <span className={`ml-2 font-medium ${formattedTicket.isLowSeats ? 'text-orange-600' : formattedTicket.isNoSeats ? 'text-red-600' : 'text-green-600'}`}>
            {formattedTicket.availableSeats}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Price:</span>
          <span className="ml-2 font-medium">{formattedTicket.salePrice}</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Financial Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Purchase Price:</span>
              <span className="ml-2 font-medium">{formattedTicket.purchasePrice}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Price:</span>
              <span className="ml-2 font-medium">{formattedTicket.totalPrice}</span>
            </div>
            <div>
              <span className="text-gray-600">Advance Paid:</span>
              <span className="ml-2 font-medium">{formattedTicket.advPaidAmount}</span>
            </div>
            <div>
              <span className="text-gray-600">Outstanding:</span>
              <span className="ml-2 font-medium">{formattedTicket.outstanding}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
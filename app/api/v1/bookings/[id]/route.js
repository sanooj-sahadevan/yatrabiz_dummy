import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Ticket from '@/models/Ticket'; // Import Ticket model to restore seats
import { revalidateTag } from 'next/cache';

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Restore available seats to the ticket if the booking was confirmed or pending
    if (booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Pending') {
      const ticket = await Ticket.findById(booking.ticket);
      if (ticket) {
        ticket.availableSeats += booking.numberOfSeats;
        await ticket.save();
      }
    }

    await Booking.findByIdAndDelete(id);

    revalidateTag("bookingRequest"); // Revalidate cache for booking requests

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to delete booking'
      },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";
import Admin from "@/models/Admin";
import { revalidateTag } from "next/cache";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { adminId, remarks } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.bookingStatus === "Cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }
    const updateQuery = {
      bookingStatus: "Cancelled",
      paymentStatus: "Failed",
      paymentMethod: "N/A",
      adminId,
      ...(remarks !== undefined ? { remarks } : {}),
    };
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateQuery, {
      new: true,
    })
      .populate({
        path: "ticket",
        select: "flightNumber airline dateOfJourney classType journeyType",
        populate: { path: "airline", select: "name" },
      })
      .populate("user", "name email");
    revalidateTag("bookingRequest");
    try {
      const BookingRequestAuditLog = (
        await import("@/models/BookingRequestAuditLog")
      ).default;
      await BookingRequestAuditLog.create({
        adminId,
        action: "REJECT",
        changes: {
          oldStatus: booking.bookingStatus,
          newStatus: "Cancelled",
          oldPaymentStatus: booking.paymentStatus,
          newPaymentStatus: "Failed",
        },
        booking: booking.bookingReference,
      });
    } catch (auditError) {
      console.error(
        "Error logging booking request audit (reject):",
        auditError
      );
    }
    try {
      const twilio = (await import("twilio")).default;
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      // Populate user with phoneNumber
      const populatedBooking = await Booking.findById(updatedBooking._id)
        .populate("user", "name email phoneNumber")
        .populate({
          path: "ticket",
          select: "flightNumber airline dateOfJourney classType journeyType",
          populate: { path: "airline", select: "name" },
        });
      const userPhone = populatedBooking.user.phoneNumber;
      if (userPhone) {
        const formattedPhone = userPhone.startsWith("+")
          ? userPhone
          : `+91${userPhone}`;
        const mainPassenger =
          populatedBooking.passengers && populatedBooking.passengers[0];
        const ticket = populatedBooking.ticket;
        const airlineName =
          ticket && ticket.airline && ticket.airline.name
            ? ticket.airline.name
            : "N/A";
        const flightNumber =
          ticket && ticket.flightNumber ? ticket.flightNumber : "N/A";
        const messageBody = `❌ Booking Rejected!

User: ${populatedBooking.user.name}
Booking Reference: ${populatedBooking.bookingReference}
Date of Journey: ${
          ticket && ticket.dateOfJourney
            ? ticket.dateOfJourney.toISOString().split("T")[0]
            : "N/A"
        }
Class: ${ticket && ticket.classType ? ticket.classType : "N/A"}
Journey Type: ${ticket && ticket.journeyType ? ticket.journeyType : "N/A"}
Total Seats: ${populatedBooking.numberOfSeats}
Flight Number: ${flightNumber}
Airline: ${airlineName}
Remark: ${populatedBooking.remarks || "No remark provided."}

Thank you for choosing Yatrabiz.
www.Yatrabiz.com`;
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${formattedPhone}`,
          body: messageBody,
        });
      } else {
        console.warn(
          "User phone number not found, WhatsApp rejection message not sent."
        );
      }
    } catch (err) {
      console.error(
        "Failed to send WhatsApp rejection message to user/agent:",
        err.message
      );
    }
    return NextResponse.json({
      success: true,
      message: "Booking rejected successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to reject booking",
      },
      { status: 500 }
    );
  }
}

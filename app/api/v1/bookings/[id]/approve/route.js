import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Admin from "@/models/Admin";
import CustomerLedger from "@/models/CustomerLedger";
import AirlineLedger from "@/models/AirlineLedger";
import { revalidateTag } from "next/cache";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { adminId, paymentStatus, paymentMethod, transactionId } =
      await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }
    const booking = await Booking.findById(id)
      .populate({
        path: "ticket",
        select: "flightNumber airline dateOfJourney classType journeyType PNR",
        populate: { path: "airline", select: "name" },
      })
      .populate("user", "name email phoneNumber");
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.bookingStatus === "Confirmed") {
      return NextResponse.json(
        { error: "Booking is already approved" },
        { status: 400 }
      );
    }
    let finalPaymentStatus = paymentStatus;
    if (paymentStatus === "Paid" && paymentMethod === "Offline") {
      finalPaymentStatus = "Pending";
    }
    const mapPaymentMethod = (method) => {
      switch (method) {
        case "Online":
          return "Online";
        case "Offline":
        case "Cash":
          return "Offline";
        case "N/A":
        default:
          return "N/A";
      }
    };
    const customerPaymentMethod = mapPaymentMethod(paymentMethod);
    const updateQuery = {
      bookingStatus: "Confirmed",
      paymentStatus: finalPaymentStatus,
      paymentMethod: customerPaymentMethod,
      adminId,
      agentOutstanding: ["Pending", "N/A", "Offline"].includes(
        finalPaymentStatus
      )
        ? booking.totalAmount
        : 0,
      agentCredit: finalPaymentStatus === "Paid" ? booking.totalAmount : 0,
    };
    if (customerPaymentMethod === "Online" && transactionId) {
      updateQuery.transactionId = transactionId;
    }
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateQuery, {
      new: true,
    })
      .populate({
        path: "ticket",
        select: "flightNumber airline dateOfJourney classType journeyType PNR",
        populate: { path: "airline", select: "name" },
      })
      .populate("user", "name email phoneNumber");
    // Revalidate booking request cache
    revalidateTag("bookingRequest");
    // Audit log for booking request approval
    try {
      const BookingRequestAuditLog = (
        await import("@/models/BookingRequestAuditLog")
      ).default;
      await BookingRequestAuditLog.create({
        adminId,
        action: "APPROVE",
        changes: {
          oldStatus: booking.bookingStatus,
          newStatus: "Confirmed",
          oldPaymentStatus: booking.paymentStatus,
          newPaymentStatus: finalPaymentStatus,
          oldPaymentMethod: booking.paymentMethod,
          newPaymentMethod: customerPaymentMethod,
        },
        booking: booking.bookingReference,
      });
    } catch (auditError) {
      console.error(
        "Error logging booking request audit (approve):",
        auditError
      );
    }
    try {
      const twilio = (await import("twilio")).default;
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      const userPhone = updatedBooking.user.phoneNumber;

      if (userPhone) {
        const formattedPhone = userPhone.startsWith("+")
          ? userPhone
          : `+91${userPhone}`;
        const mainPassenger =
          updatedBooking.passengers && updatedBooking.passengers[0];
        const ticket = updatedBooking.ticket;
        const airlineName =
          ticket && ticket.airline && ticket.airline.name
            ? ticket.airline.name
            : "N/A";
        const flightNumber =
          ticket && ticket.flightNumber ? ticket.flightNumber : "N/A";
        const messageBody = `✅ Booking Approved!

User: ${updatedBooking.user.name}
Booking Reference: ${updatedBooking.bookingReference}
Date of Journey: ${
          ticket && ticket.dateOfJourney
            ? ticket.dateOfJourney.toISOString().split("T")[0]
            : "N/A"
        }
Class: ${ticket && ticket.classType ? ticket.classType : "N/A"}
Journey Type: ${ticket && ticket.journeyType ? ticket.journeyType : "N/A"}
Total Seats: ${updatedBooking.numberOfSeats}
PNR: ${ticket && ticket.PNR ? ticket.PNR : "N/A"}
Flight Number: ${flightNumber}
Airline: ${airlineName}

Thank you for choosing Yatrabiz.
www.Yatrabiz.com`;
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${formattedPhone}`,
          body: messageBody,
        });
      } else {
        console.warn("User phone number not found, WhatsApp message not sent.");
      }
    } catch (err) {
      console.error(
        "Failed to send WhatsApp message to user/agent:",
        err.message
      );
    }
    return NextResponse.json({
      success: true,
      message: "Booking approved successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve booking" },
      { status: 500 }
    );
  }
}

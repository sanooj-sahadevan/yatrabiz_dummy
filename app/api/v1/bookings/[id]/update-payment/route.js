import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Admin from "@/models/Admin";
import CustomerLedger from "@/models/CustomerLedger";
import { revalidateTag } from "next/cache";
import AirlineLedger from "@/models/AirlineLedger";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { adminId, paymentStatus, paymentMethod, transactionId } =
      await request.json();

    // Validate booking ID
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id)
      .populate(
        "ticket",
        "airline PNR dateOfJourney price salePrice classType journeyType"
      )
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.bookingStatus !== "Confirmed") {
      return NextResponse.json(
        { error: "Can only update payment status for confirmed bookings" },
        { status: 400 }
      );
    }

    const mapPaymentMethod = (method) => {
      if (!method) return "N/A";

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

    const prevAgentOutstanding = booking.agentOutstanding || 0;
    const prevAgentCredit = booking.agentCredit || 0;
    let newAgentOutstanding = prevAgentOutstanding;
    let newAgentCredit = prevAgentCredit;
    if (
      (booking.paymentStatus === "Pending" ||
        booking.paymentStatus === "N/A" ||
        booking.paymentStatus === "Offline") &&
      paymentStatus === "Paid"
    ) {
      newAgentOutstanding = Math.max(
        0,
        prevAgentOutstanding - booking.totalAmount
      );
      newAgentCredit = prevAgentCredit + booking.totalAmount;
    } else if (
      paymentStatus === "Pending" ||
      paymentStatus === "N/A" ||
      paymentStatus === "Offline"
    ) {
      newAgentOutstanding = booking.totalAmount;
      newAgentCredit = 0;
    } else if (paymentStatus === "Paid") {
      newAgentOutstanding = 0;
      newAgentCredit = booking.totalAmount;
    }
    const updateQuery = {
      paymentStatus,
      paymentMethod: customerPaymentMethod,
      adminId,
      agentOutstanding: newAgentOutstanding,
      agentCredit: newAgentCredit,
    };
    if (customerPaymentMethod === "Online" && transactionId) {
      updateQuery.transactionId = transactionId;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateQuery, {
      new: true,
    })
      .populate("ticket", "airline PNR dateOfJourney classType journeyType")
      .populate("user", "name email");

    if (paymentStatus === "Paid" || paymentStatus === "Pending") {
      try {
        let customerLedger = await CustomerLedger.findOne({
          PNR: `${booking.ticket.PNR}-${booking.user._id}`,
          user: booking.user._id,
          booking: booking._id,
        });

        if (customerLedger) {
          if (paymentStatus === "Paid") {
            customerLedger.credit += booking.totalAmount;
            customerLedger.due =
              customerLedger.totalPayment - customerLedger.credit;
          }
          customerLedger.paymentMethod = customerPaymentMethod;
          customerLedger.notes = `${
            customerLedger.notes || ""
          }\nPayment update for booking ${booking.bookingReference} - ₹${
            booking.totalAmount
          }`;
          await customerLedger.save();
        }

        const filter = { PNR: booking.ticket.PNR };
        let update = {};
        const allLedgers = await CustomerLedger.find({
          PNR: { $regex: `^${booking.ticket.PNR}-` },
          booking: booking._id,
        });
        const totalOutstanding = allLedgers.reduce(
          (sum, l) => sum + (l.due || 0),
          0
        );
        if (paymentStatus === "Paid") {
          update = {
            $inc: { customerPaidAmount: booking.totalAmount },
            $set: { customerOutstanding: totalOutstanding },
          };
        } else if (paymentStatus === "Pending") {
          update = {
            $inc: { customerPaidAmount: booking.totalAmount },
            $set: { customerOutstanding: totalOutstanding },
          };
        }
        const res = await AirlineLedger.findOneAndUpdate(filter, update, {
          new: true,
        });
      } catch (ledgerError) {
        console.error("Error updating ledgers:", ledgerError);
      }
    }

    revalidateTag("bookingRequest");

    try {
      const BookingRequestAuditLog = (
        await import("@/models/BookingRequestAuditLog")
      ).default;
      await BookingRequestAuditLog.create({
        adminId,
        action: "PAYMENT_STATUS_CHANGE",
        changes: {
          oldPaymentStatus: booking.paymentStatus,
          newPaymentStatus: paymentStatus,
          oldPaymentMethod: booking.paymentMethod,
          newPaymentMethod: customerPaymentMethod,
        },
        booking: booking.bookingReference,
      });
    } catch (auditError) {
      console.error(
        "Error logging booking request audit (payment status):",
        auditError
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking payment status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking payment status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking payment status" },
      { status: 500 }
    );
  }
}

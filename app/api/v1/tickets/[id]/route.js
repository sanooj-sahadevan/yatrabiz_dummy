import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import Airline from "@/models/Airline";
import Ticket from "@/models/Ticket";
import TicketAuditLog from "@/models/TicketAuditLog";
import AirlineLedger from "@/models/AirlineLedger";
import { createTicketAuditLog } from "@/utils/auditLogger";

function getChanges(oldData, newData) {
  const changes = {};
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        from: oldData[key],
        to: newData[key],
      };
    }
  }
  return changes;
}

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(id)
      .populate("airline", "name code")
      .populate("departureLocation", "name code")
      .populate("arrivalLocation", "name code")
      .populate("connectingLocation", "name code");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { adminId, ...updateFields } = body;

    if (!id || !adminId) {
      return NextResponse.json(
        { message: "Ticket ID and adminId are required to update a ticket" },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findById(id).lean();
    if (!existingTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const formattedUpdateFields = {
      ...updateFields,
      // Convert ObjectIds if they exist
      airline: updateFields.airline
        ? new mongoose.Types.ObjectId(updateFields.airline)
        : existingTicket.airline,
      journeyType: updateFields.journeyType || existingTicket.journeyType,
      classType: updateFields.classType || existingTicket.classType,
      departureLocation: updateFields.departureLocation
        ? new mongoose.Types.ObjectId(updateFields.departureLocation)
        : existingTicket.departureLocation,
      arrivalLocation: updateFields.arrivalLocation
        ? new mongoose.Types.ObjectId(updateFields.arrivalLocation)
        : existingTicket.arrivalLocation,
      // Convert dates if they exist
      dateOfJourney: updateFields.dateOfJourney
        ? new Date(updateFields.dateOfJourney)
        : existingTicket.dateOfJourney,
      purchaseDate: updateFields.purchaseDate
        ? new Date(updateFields.purchaseDate)
        : existingTicket.purchaseDate,
      dateOfNameSubmission: updateFields.dateOfNameSubmission
        ? new Date(updateFields.dateOfNameSubmission)
        : existingTicket.dateOfNameSubmission,
      outstandingDate: updateFields.outstandingDate
        ? new Date(updateFields.outstandingDate)
        : existingTicket.outstandingDate,
      advPaymentDate: updateFields.advPaymentDate
        ? new Date(updateFields.advPaymentDate)
        : existingTicket.advPaymentDate,
      // Ensure numeric fields are numbers
      totalSeats: Number(updateFields.totalSeats) || existingTicket.totalSeats,
      availableSeats:
        Number(updateFields.availableSeats),
      purchasePrice:
        Number(updateFields.purchasePrice) || existingTicket.purchasePrice,
      advPaidAmount:
        Number(updateFields.advPaidAmount) || existingTicket.advPaidAmount,
      outstanding:
        Number(updateFields.outstanding) || existingTicket.outstanding,
      totalPrice: Number(updateFields.totalPrice) || existingTicket.totalPrice,
      salePrice: Number(updateFields.salePrice) || existingTicket.salePrice,
      release: Number(updateFields.release) || existingTicket.release,
      handBaggage:
        updateFields.handBaggage !== undefined
          ? updateFields.handBaggage
          : existingTicket.handBaggage,
      checkedBaggage:
        updateFields.checkedBaggage !== undefined
          ? updateFields.checkedBaggage
          : existingTicket.checkedBaggage,
      // Add Discount field handling
      Discount:
        updateFields.Discount !== undefined
          ? Number(updateFields.Discount)
          : existingTicket.Discount,
      advPaymentTxnId:
        updateFields.advPaymentTxnId !== undefined
          ? updateFields.advPaymentTxnId
          : existingTicket.advPaymentTxnId,
      connectingLocation:
        updateFields.connectingLocation &&
        mongoose.Types.ObjectId.isValid(updateFields.connectingLocation)
          ? new mongoose.Types.ObjectId(updateFields.connectingLocation)
          : existingTicket.connectingLocation,
    };
    if (updateFields.advPaymentTxnId || updateFields.advPaymentDate) {
      if (
        formattedUpdateFields.outstandingPayments &&
        formattedUpdateFields.outstandingPayments.length > 0
      ) {
        // Update the first payment entry if it exists
        const firstPayment = formattedUpdateFields.outstandingPayments[0];
        firstPayment.transactionId =
          updateFields.advPaymentTxnId || firstPayment.transactionId;
        firstPayment.date = updateFields.advPaymentDate
          ? new Date(updateFields.advPaymentDate)
          : firstPayment.date;
      } else {
        // Create a new payment entry if none exists
        formattedUpdateFields.outstandingPayments = [
          {
            amountPaid: formattedUpdateFields.advPaidAmount || 0,
            transactionId: updateFields.advPaymentTxnId,
            date: new Date(updateFields.advPaymentDate),
          },
        ];
      }
    }

    // Validate journeyType and classType
    if (
      updateFields.journeyType &&
      !["Domestic", "International"].includes(updateFields.journeyType)
    ) {
      return NextResponse.json(
        { message: "Invalid journey type." },
        { status: 400 }
      );
    }
    if (
      updateFields.classType &&
      !["Economy", "Premium Economy", "Business Class", "First Class"].includes(
        updateFields.classType
      )
    ) {
      return NextResponse.json(
        { message: "Invalid class type." },
        { status: 400 }
      );
    }

    // Validate ObjectIds if they are provided
    try {
      if (updateFields.airline)
        new mongoose.Types.ObjectId(updateFields.airline);
      if (updateFields.departureLocation)
        new mongoose.Types.ObjectId(updateFields.departureLocation);
      if (updateFields.arrivalLocation)
        new mongoose.Types.ObjectId(updateFields.arrivalLocation);
    } catch (error) {
      return NextResponse.json(
        {
          message:
            "Invalid airline, departure location, or arrival location ID",
        },
        { status: 400 }
      );
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      formattedUpdateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create audit log for the update
    const changes = getChanges(existingTicket, updatedTicket.toObject());
    if (Object.keys(changes).length > 0) {
      try {
        await createTicketAuditLog({
          adminId: adminId,
          action: "UPDATE",
          changes,
          ticket: updatedTicket.toObject(),
        });
      } catch (logErr) {
        console.error("Ticket audit log creation failed:", logErr);
      }
    }

    // Only populate airline name and code if needed for UI
    // await updatedTicket.populate("airline", "name code");
    // await updatedTicket.populate("departureLocation", "name code");
    // await updatedTicket.populate("arrivalLocation", "name code");

    // Return the full updated ticket object for frontend consistency
    return NextResponse.json(
      { message: "Ticket updated successfully", data: updatedTicket },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /tickets/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { adminId } = await request.json();

    if (!id || !adminId) {
      return NextResponse.json(
        { message: "Ticket ID and adminId are required to delete a ticket" },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findById(id).lean();
    if (!existingTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Prepare changes object (all fields from existing value to null)
    const changes = {};
    for (const key in existingTicket) {
      if (
        key !== "_id" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "__v"
      ) {
        changes[key] = { from: existingTicket[key], to: null };
      }
    }

    try {
      await createTicketAuditLog({
        adminId: adminId,
        action: "DELETE",
        changes,
        ticket: existingTicket,
      });
    } catch (logErr) {
      console.error("Ticket audit log creation failed:", logErr);
    }

    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /tickets/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

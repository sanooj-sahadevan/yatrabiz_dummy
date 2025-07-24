import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import Airline from "@/models/Airline";
import Ticket from "@/models/Ticket";
import TicketAuditLog from "@/models/TicketAuditLog";
import AirlineLedger from "@/models/AirlineLedger";
import { createTicketAuditLog } from "@/utils/auditLogger";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";
import { revalidateTag,revalidatePath } from "next/cache";



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



export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const { adminId, ...updateFields } = body;

    if (!id || !adminId) {
      return NextResponse.json({ message: "Missing ticket ID or adminId" }, { status: 400 });
    }

    const existingTicket = await Ticket.findById(id).lean();
    if (!existingTicket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    const update = {
      ...updateFields,
      airline: updateFields.airline ? new mongoose.Types.ObjectId(updateFields.airline) : existingTicket.airline,
      departureLocation: updateFields.departureLocation ? new mongoose.Types.ObjectId(updateFields.departureLocation) : existingTicket.departureLocation,
      arrivalLocation: updateFields.arrivalLocation ? new mongoose.Types.ObjectId(updateFields.arrivalLocation) : existingTicket.arrivalLocation,
      connectingLocation: updateFields.connectingLocation ? new mongoose.Types.ObjectId(updateFields.connectingLocation) : existingTicket.connectingLocation,
      dateOfJourney: updateFields.dateOfJourney ? new Date(updateFields.dateOfJourney) : existingTicket.dateOfJourney,
      purchaseDate: updateFields.purchaseDate ? new Date(updateFields.purchaseDate) : existingTicket.purchaseDate,
      outstandingDate: updateFields.outstandingDate ? new Date(updateFields.outstandingDate) : existingTicket.outstandingDate,
    };

    const updatedTicket = await Ticket.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedTicket) {
      return NextResponse.json({ message: "Ticket not updated" }, { status: 404 });
    }

    const changes = getChanges(existingTicket, updatedTicket.toObject());
    if (Object.keys(changes).length > 0) {
      createTicketAuditLog({
        adminId,
        action: "UPDATE",
        changes,
        ticket: updatedTicket.toObject(),
      }).catch(console.error);
    }

    await revalidatePath("/admin/tickets");

    return NextResponse.json(
      { message: "Ticket updated successfully", data: updatedTicket },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { adminId } = await request.json();

    if (!id || !adminId) {
      return NextResponse.json({ message: "Missing ticket ID or adminId" }, { status: 400 });
    }

    const existingTicket = await Ticket.findById(id).lean();
    if (!existingTicket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
      return NextResponse.json({ message: "Delete failed" }, { status: 404 });
    }

    const changes = Object.fromEntries(
      Object.entries(existingTicket).filter(([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)).map(
        ([key, value]) => [key, { from: value, to: null }]
      )
    );

    createTicketAuditLog({
      adminId,
      action: "DELETE",
      changes,
      ticket: existingTicket,
    }).catch(console.error);

    await revalidatePath("/admin/tickets");

    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

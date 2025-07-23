import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/utils/auditLogger";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const admin = await getAdminSessionSSR();
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const oldBookableStatus = ticket.nonBookable;
    ticket.nonBookable = !ticket.nonBookable;
    await ticket.save();
    
    // Create audit log for the bookable status change
    try {
      await createAuditLog({
        entity: "Ticket",
        entityId: ticket._id.toString(),
        changedBy: admin.id,
        action: "UPDATE",
        changes: {
          nonBookable: {
            from: oldBookableStatus,
            to: ticket.nonBookable,
          },
        },
        person: {
          adminId: admin.id,
          ticketPNR: ticket.PNR,
          airline: ticket.airline?.name || "Unknown",
        },
      });
    } catch (logErr) {
      console.error("Audit log creation failed:", logErr);
    }
    
    revalidatePath("/admin/tickets", "page");

    return NextResponse.json(
      {
        message: `Ticket has been ${
          ticket.nonBookable ? "marked as non-bookable" : "marked as bookable"
        }.`,
        ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ticket bookable status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
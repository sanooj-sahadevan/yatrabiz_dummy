import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";
import { revalidateTag } from "next/cache";
import { createAuditLog } from "@/utils/auditLogger";
import { headers } from "next/headers";

export async function PUT(request, context) {
  try {
    await connectToDatabase();

    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";
    const { admin } = await getAdminSessionSSR(cookie);

    if (!admin || !admin.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

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

    const oldStatus = ticket.nonBookable;
    ticket.nonBookable = !oldStatus;

    await Promise.all([
      ticket.save(),
      createAuditLog({
        entity: "Ticket",
        entityId: ticket._id.toString(),
        changedBy: admin.id,
        action: "UPDATE",
        changes: {
          nonBookable: {
            from: oldStatus,
            to: ticket.nonBookable,
          },
        },
        person: {
          adminId: admin.id,
          ticketPNR: ticket.PNR,
          airline: ticket.airline?.name || "Unknown",
        },
      }).catch((logErr) => {
        console.error("Audit log creation failed:", logErr);
      }),
    ]);

    await revalidateTag("tickets"); // ✅ FIXED: Now it works!

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
    console.error("Error toggling ticket status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

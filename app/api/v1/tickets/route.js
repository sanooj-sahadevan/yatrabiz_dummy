import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Location from "@/models/Location";
import Airline from "@/models/Airline";
import Ticket from "@/models/Ticket";
import TicketAuditLog from "@/models/TicketAuditLog";
import AirlineLedger from "@/models/AirlineLedger";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";
import { headers } from "next/headers";
import { createTicketAuditLog } from "@/utils/auditLogger";

// Remove in-memory cache (Map) and related logic

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

export async function GET(request) {
  try {
    await connectToDatabase();
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const { admin } = await getAdminSessionSSR(cookieHeader);

    let query = {};

    if (admin && admin.type === "admin") {
      query = {};
    } else {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      );
      query = {
        nonBookable: false,
        availableSeats: { $gt: 0 },
        dateOfJourney: { $gt: twentyFourHoursFromNow },
      };
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 500;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort({ dateOfJourney: 1 })
        .skip(skip)
        .limit(limit)
        .populate("airline", "name code")
        .populate("departureLocation", "name code")
        .populate("arrivalLocation", "name code")
        .populate("connectingLocation", "name code"),
      Ticket.countDocuments(query),
    ]);

    const response = {
      message: "Tickets fetched successfully",
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=2",
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const { admin } = await getAdminSessionSSR(cookieHeader);

    if (!admin || admin.type !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    let {
      PNR,
      isDummyPNR,
      airline,
      flightNumber,
      journeyType,
      classType,
      departureLocation,
      arrivalLocation,
      dateOfJourney,
      departureTime,
      arrivalTime,
      totalSeats,
      purchasePrice,
      purchaseDate,
      dateOfNameSubmission,
      advPaidAmount,
      outstanding,
      outstandingDate,
      totalPrice,
      salePrice,
      release,
      handBaggage,
      checkedBaggage,
      infantFees,
      Discount,
      connectingLocation,
    } = body;

    if (
      !PNR ||
      !airline ||
      !dateOfJourney ||
      !departureLocation ||
      !arrivalLocation ||
      !journeyType ||
      !classType
    ) {
      return NextResponse.json(
        {
          message:
            "PNR, airline, dateOfJourney, departureLocation, arrivalLocation, journeyType, and classType are required",
        },
        { status: 400 }
      );
    }

    if (!["Domestic", "International"].includes(journeyType)) {
      return NextResponse.json(
        { message: "Invalid journey type." },
        { status: 400 }
      );
    }
    if (
      !["Economy", "Premium Economy", "Business Class", "First Class"].includes(
        classType
      )
    ) {
      return NextResponse.json(
        { message: "Invalid class type." },
        { status: 400 }
      );
    }

    if (!/^[A-Z0-9]{6}$/.test(PNR)) {
      return NextResponse.json(
        { message: "PNR must be 6 alphanumeric characters." },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findOne({ PNR });
    if (existingTicket) {
      return NextResponse.json(
        { message: "Ticket with this PNR already exists" },
        { status: 400 }
      );
    }

    const ticketData = {
      PNR: PNR,
      isDummyPNR: isDummyPNR,
      airline: new mongoose.Types.ObjectId(airline),
      flightNumber: flightNumber,
      journeyType: journeyType || "",
      classType: classType || "",
      departureLocation: new mongoose.Types.ObjectId(departureLocation),
      arrivalLocation: new mongoose.Types.ObjectId(arrivalLocation),
      dateOfJourney: new Date(dateOfJourney),
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      totalSeats: totalSeats,
      availableSeats:
        body.availableSeats !== undefined ? body.availableSeats : totalSeats,
      purchasePrice: purchasePrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      dateOfNameSubmission: dateOfNameSubmission
        ? new Date(dateOfNameSubmission)
        : new Date(),
      advPaidAmount: advPaidAmount,
      outstanding: outstanding,
      outstandingDate: outstandingDate ? new Date(outstandingDate) : new Date(),
      totalPrice: totalPrice,
      salePrice: salePrice,
      release: release,
      handBaggage: handBaggage || "",
      checkedBaggage: checkedBaggage || "",
      infantFees: infantFees !== undefined ? infantFees : 0,
      Discount: Discount !== undefined ? Discount : 0,
      connectingLocation: connectingLocation
        ? new mongoose.Types.ObjectId(connectingLocation)
        : undefined,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      outstandingPayments: [],
    };
    if (advPaidAmount && body.advPaymentTxnId && body.advPaymentDate) {
      ticketData.outstandingPayments.push({
        amountPaid: advPaidAmount,
        transactionId: body.advPaymentTxnId,
        date: body.advPaymentDate,
      });
    }

    try {
      new mongoose.Types.ObjectId(airline);
      new mongoose.Types.ObjectId(departureLocation);
      new mongoose.Types.ObjectId(arrivalLocation);
    } catch (error) {
      return NextResponse.json(
        {
          message:
            "Invalid airline, departure location, or arrival location ID",
        },
        { status: 400 }
      );
    }

    const ticket = new Ticket(ticketData);

    await ticket.save();

    await ticket.populate("airline", "name code");
    await ticket.populate("departureLocation", "name code");
    await ticket.populate("arrivalLocation", "name code");

    // Create AirlineLedger entry
    try {
      const airlineLedgerEntry = await AirlineLedger.create({
        airline: ticket.airline._id || ticket.airline,
        PNR: ticket.PNR,
        totalPayment: ticket.totalPrice || 0,
        advance: ticket.advPaidAmount || 0,
        outstanding: ticket.outstanding || 0,
        outstandingDate: ticket.outstandingDate || new Date(),
      });
    } catch (ledgerErr) {
      console.error("AirlineLedger creation failed:", ledgerErr);
    }

    const savedTicketData = ticket.toObject();
    delete savedTicketData.__v;

    const changes = {};
    for (const key in savedTicketData) {
      if (key !== "_id" && key !== "createdAt" && key !== "updatedAt") {
        changes[key] = { from: null, to: savedTicketData[key] };
      }
    }

    try {
      await createTicketAuditLog({
        adminId: admin.id,
        action: "CREATE",
        changes,
        ticket: savedTicketData,
      });
    } catch (logErr) {
      console.error("Ticket audit log creation failed:", logErr);
      console.error("Admin data:", {
        id: admin.id,
        email: admin.email,
        type: admin.type,
      });
    }

    return NextResponse.json(
      { message: "Ticket created", data: savedTicketData },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /tickets error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { _id, adminId, ...updateFields } = body;

    if (!_id || !adminId) {
      return NextResponse.json(
        { message: "_id and adminId are required to update a ticket" },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findById(_id).lean();
    if (!existingTicket && adminId) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const formattedUpdateFields = {
      ...updateFields,
      airline: updateFields.airline
        ? new mongoose.Types.ObjectId(updateFields.airline)
        : undefined,
      departureLocation: updateFields.departureLocation
        ? new mongoose.Types.ObjectId(updateFields.departureLocation)
        : undefined,
      arrivalLocation: updateFields.arrivalLocation
        ? new mongoose.Types.ObjectId(updateFields.arrivalLocation)
        : undefined,
      dateOfJourney: updateFields.dateOfJourney
        ? new Date(updateFields.dateOfJourney)
        : undefined,
      purchaseDate: updateFields.purchaseDate
        ? new Date(updateFields.purchaseDate)
        : undefined,
      dateOfNameSubmission: updateFields.dateOfNameSubmission
        ? new Date(updateFields.dateOfNameSubmission)
        : undefined,
      outstandingDate: updateFields.outstandingDate
        ? new Date(updateFields.outstandingDate)
        : undefined,
      totalSeats: updateFields.totalSeats
        ? Number(updateFields.totalSeats)
        : undefined,
      availableSeats: updateFields.availableSeats
        ? Number(updateFields.availableSeats)
        : undefined,
      purchasePrice: updateFields.purchasePrice
        ? Number(updateFields.purchasePrice)
        : undefined,
      advPaidAmount: updateFields.advPaidAmount
        ? Number(updateFields.advPaidAmount)
        : undefined,
      outstanding: updateFields.outstanding
        ? Number(updateFields.outstanding)
        : undefined,
      totalPrice: updateFields.totalPrice
        ? Number(updateFields.totalPrice)
        : undefined,
      salePrice: updateFields.salePrice
        ? Number(updateFields.salePrice)
        : undefined,
      release: updateFields.release ? Number(updateFields.release) : undefined,
      handBaggage:
        updateFields.handBaggage !== undefined
          ? updateFields.handBaggage
          : undefined,
      checkedBaggage:
        updateFields.checkedBaggage !== undefined
          ? updateFields.checkedBaggage
          : undefined,
      infantFees:
        updateFields.infantFees !== undefined
          ? Number(updateFields.infantFees)
          : undefined,
      Discount:
        updateFields.Discount !== undefined
          ? Number(updateFields.Discount)
          : undefined,
      connectingLocation: updateFields.connectingLocation
        ? new mongoose.Types.ObjectId(updateFields.connectingLocation)
        : undefined,
    };

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

    Object.keys(formattedUpdateFields).forEach((key) => {
      if (formattedUpdateFields[key] === undefined) {
        delete formattedUpdateFields[key];
      }
    });

    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id },
      formattedUpdateFields,
      {
        new: true,
      }
    );

    if (!updatedTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    await updatedTicket.populate("airline", "name code");
    await updatedTicket.populate("departureLocation", "name code");
    await updatedTicket.populate("arrivalLocation", "name code");

    const ticketData = updatedTicket.toObject();
    delete ticketData.__v;

    const changes = getChanges(existingTicket, ticketData);

    if (Object.keys(changes).length > 0) {
      try {
        await createTicketAuditLog({
          adminId: adminId,
          action: "UPDATE",
          changes,
          ticket: ticketData,
        });
      } catch (logErr) {
        console.error("Ticket audit log creation failed:", logErr);
        console.error("Update data:", { adminId, ticketPNR: ticketData.PNR });
      }
    }

    // Invalidate all cache after mutation
    // ticketsCache.clear(); // Removed in-memory cache
    return NextResponse.json(
      { message: "Ticket updated successfully", data: ticketData },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /tickets error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();

    const { _id, adminId } = await request.json();

    if (!_id || !adminId) {
      return NextResponse.json(
        { message: "_id and adminId are required to delete a ticket" },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findById(_id).lean();
    if (!existingTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const deletedTicket = await Ticket.findOneAndDelete({ _id });

    if (!deletedTicket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

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

    // Invalidate all cache after mutation
    // ticketsCache.clear(); // Removed in-memory cache
    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /tickets error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

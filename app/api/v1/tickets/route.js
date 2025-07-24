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
import { revalidatePath } from "next/cache";

// function getChanges(oldData, newData) {
//   const changes = {};
//   for (const key in newData) {
//     if (oldData[key] !== newData[key]) {
//       changes[key] = {
//         from: oldData[key],
//         to: newData[key],
//       };
//     }
//   }
//   return changes;
// }

const CACHE_SECONDS = 30;
const STALE_SECONDS = 5;

export async function GET(request) {
  try {
    await connectToDatabase();
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    const { admin } = await getAdminSessionSSR(cookie);
    const query =
      admin?.type === "admin"
        ? {}
        : {
            nonBookable: false,
            availableSeats: { $gt: 0 },
            dateOfJourney: { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          };

    const tickets = await Ticket.find(query)
      .sort({ dateOfJourney: 1 })
      .populate([
        { path: "airline", select: "name code" },
        { path: "departureLocation", select: "name code" },
        { path: "arrivalLocation", select: "name code" },
        { path: "connectingLocation", select: "name code" },
      ])
      .lean();

    return new NextResponse(
      JSON.stringify({
        message: "Tickets fetched successfully",
        data: tickets,
        total: tickets.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        },
      }
    );
  } catch (error) {
    console.error("GET /tickets error:", error);
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
    const {
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
      advPaymentTxnId,
      advPaymentDate,
      availableSeats,
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
        { message: "Missing required fields." },
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
    if (await Ticket.findOne({ PNR })) {
      return NextResponse.json(
        { message: "Ticket with this PNR already exists" },
        { status: 400 }
      );
    }

    const ticketData = {
      PNR,
      isDummyPNR,
      airline: new mongoose.Types.ObjectId(airline),
      flightNumber,
      journeyType,
      classType,
      departureLocation: new mongoose.Types.ObjectId(departureLocation),
      arrivalLocation: new mongoose.Types.ObjectId(arrivalLocation),
      dateOfJourney: new Date(dateOfJourney),
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: availableSeats ?? totalSeats,
      purchasePrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      dateOfNameSubmission: dateOfNameSubmission
        ? new Date(dateOfNameSubmission)
        : new Date(),
      advPaidAmount,
      outstanding,
      outstandingDate: outstandingDate ? new Date(outstandingDate) : new Date(),
      totalPrice,
      salePrice,
      release,
      handBaggage: handBaggage || "",
      checkedBaggage: checkedBaggage || "",
      infantFees: infantFees || 0,
      Discount: Discount || 0,
      connectingLocation: connectingLocation
        ? new mongoose.Types.ObjectId(connectingLocation)
        : undefined,
      createdBy: new mongoose.Types.ObjectId(admin.id),
      outstandingPayments: [],
    };

    if (advPaidAmount && advPaymentTxnId && advPaymentDate) {
      ticketData.outstandingPayments.push({
        amountPaid: advPaidAmount,
        transactionId: advPaymentTxnId,
        date: advPaymentDate,
      });
    }

    const ticket = await new Ticket(ticketData).save();

    Promise.all([
      AirlineLedger.create({
        airline: ticket.airline,
        PNR: ticket.PNR,
        totalPayment: ticket.totalPrice || 0,
        advance: ticket.advPaidAmount || 0,
        outstanding: ticket.outstanding || 0,
        outstandingDate: ticket.outstandingDate || new Date(),
      }).catch(console.error),

      createTicketAuditLog({
        adminId: admin.id,
        action: "CREATE",
        changes: Object.fromEntries(
          Object.entries(ticket.toObject())
            .filter(
              ([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
            )
            .map(([key, value]) => [key, { from: null, to: value }])
        ),
        ticket: ticket.toObject(),
      }).catch(console.error),
    ]);

    revalidatePath("/admin/tickets");

    return NextResponse.json(
      { message: "Ticket created", data: ticket.toObject() },
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

//   export async function PUT(request) {
//     try {
//       await connectToDatabase();
// console.log('purath ulla put');

//       const body = await request.json();
//       const { _id, adminId, ...updateFields } = body;

//       if (!_id || !adminId) {
//         return NextResponse.json(
//           { message: "_id and adminId are required to update a ticket" },
//           { status: 400 }
//         );
//       }

//       const existingTicket = await Ticket.findById(_id).lean();
//       if (!existingTicket && adminId) {
//         return NextResponse.json(
//           { message: "Ticket not found" },
//           { status: 404 }
//         );
//       }

//       const formattedUpdateFields = {
//         ...updateFields,
//         airline: updateFields.airline
//           ? new mongoose.Types.ObjectId(updateFields.airline)
//           : undefined,
//         departureLocation: updateFields.departureLocation
//           ? new mongoose.Types.ObjectId(updateFields.departureLocation)
//           : undefined,
//         arrivalLocation: updateFields.arrivalLocation
//           ? new mongoose.Types.ObjectId(updateFields.arrivalLocation)
//           : undefined,
//         dateOfJourney: updateFields.dateOfJourney
//           ? new Date(updateFields.dateOfJourney)
//           : undefined,
//         purchaseDate: updateFields.purchaseDate
//           ? new Date(updateFields.purchaseDate)
//           : undefined,
//         dateOfNameSubmission: updateFields.dateOfNameSubmission
//           ? new Date(updateFields.dateOfNameSubmission)
//           : undefined,
//         outstandingDate: updateFields.outstandingDate
//           ? new Date(updateFields.outstandingDate)
//           : undefined,
//         totalSeats: updateFields.totalSeats
//           ? Number(updateFields.totalSeats)
//           : undefined,
//         availableSeats: updateFields.availableSeats
//           ? Number(updateFields.availableSeats)
//           : undefined,
//         purchasePrice: updateFields.purchasePrice
//           ? Number(updateFields.purchasePrice)
//           : undefined,
//         advPaidAmount: updateFields.advPaidAmount
//           ? Number(updateFields.advPaidAmount)
//           : undefined,
//         outstanding: updateFields.outstanding
//           ? Number(updateFields.outstanding)
//           : undefined,
//         totalPrice: updateFields.totalPrice
//           ? Number(updateFields.totalPrice)
//           : undefined,
//         salePrice: updateFields.salePrice
//           ? Number(updateFields.salePrice)
//           : undefined,
//         release: updateFields.release ? Number(updateFields.release) : undefined,
//         handBaggage:
//           updateFields.handBaggage !== undefined
//             ? updateFields.handBaggage
//             : undefined,
//         checkedBaggage:
//           updateFields.checkedBaggage !== undefined
//             ? updateFields.checkedBaggage
//             : undefined,
//         infantFees:
//           updateFields.infantFees !== undefined
//             ? Number(updateFields.infantFees)
//             : undefined,
//         Discount:
//           updateFields.Discount !== undefined
//             ? Number(updateFields.Discount)
//             : undefined,
//         connectingLocation: updateFields.connectingLocation
//           ? new mongoose.Types.ObjectId(updateFields.connectingLocation)
//           : undefined,
//       };

//       try {
//         if (updateFields.airline)
//           new mongoose.Types.ObjectId(updateFields.airline);
//         if (updateFields.departureLocation)
//           new mongoose.Types.ObjectId(updateFields.departureLocation);
//         if (updateFields.arrivalLocation)
//           new mongoose.Types.ObjectId(updateFields.arrivalLocation);
//       } catch (error) {
//         return NextResponse.json(
//           {
//             message:
//               "Invalid airline, departure location, or arrival location ID",
//           },
//           { status: 400 }
//         );
//       }

//       Object.keys(formattedUpdateFields).forEach((key) => {
//         if (formattedUpdateFields[key] === undefined) {
//           delete formattedUpdateFields[key];
//         }
//       });

//       const updatedTicket = await Ticket.findOneAndUpdate(
//         { _id },
//         formattedUpdateFields,
//         {
//           new: true,
//         }
//       );

//       if (!updatedTicket) {
//         return NextResponse.json(
//           { message: "Ticket not found" },
//           { status: 404 }
//         );
//       }

//       await updatedTicket.populate("airline", "name code");
//       await updatedTicket.populate("departureLocation", "name code");
//       await updatedTicket.populate("arrivalLocation", "name code");

//       const ticketData = updatedTicket.toObject();
//       delete ticketData.__v;

//       const changes = getChanges(existingTicket, ticketData);

//       if (Object.keys(changes).length > 0) {
//         try {
//           await createTicketAuditLog({
//             adminId: adminId,
//             action: "UPDATE",
//             changes,
//             ticket: ticketData,
//           });
//         } catch (logErr) {
//           console.error("Ticket audit log creation failed:", logErr);
//           console.error("Update data:", { adminId, ticketPNR: ticketData.PNR });
//         }
//       }

//       // Invalidate all cache after mutation
//       // ticketsCache.clear(); // Removed in-memory cache
//       return NextResponse.json(
//         { message: "Ticket updated successfully", data: ticketData },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("PUT /tickets error:", error);
//       return NextResponse.json(
//         { message: "Internal server error" },
//         { status: 500 }
//       );
//     }
//   }

//   export async function DELETE(request) {
//     try {
//       await connectToDatabase();
// console.log('purath ulla delete');

//       const { _id, adminId } = await request.json();

//       if (!_id || !adminId) {
//         return NextResponse.json(
//           { message: "_id and adminId are required to delete a ticket" },
//           { status: 400 }
//         );
//       }

//       const existingTicket = await Ticket.findById(_id).lean();
//       if (!existingTicket) {
//         return NextResponse.json(
//           { message: "Ticket not found" },
//           { status: 404 }
//         );
//       }

//       const deletedTicket = await Ticket.findOneAndDelete({ _id });

//       if (!deletedTicket) {
//         return NextResponse.json(
//           { message: "Ticket not found" },
//           { status: 404 }
//         );
//       }

//       const changes = {};
//       for (const key in existingTicket) {
//         if (
//           key !== "_id" &&
//           key !== "createdAt" &&
//           key !== "updatedAt" &&
//           key !== "__v"
//         ) {
//           changes[key] = { from: existingTicket[key], to: null };
//         }
//       }

//       try {
//         await createTicketAuditLog({
//           adminId: adminId,
//           action: "DELETE",
//           changes,
//           ticket: existingTicket,
//         });
//       } catch (logErr) {
//         console.error("Ticket audit log creation failed:", logErr);
//       }

//       // Invalidate all cache after mutation
//       // ticketsCache.clear(); // Removed in-memory cache
//       return NextResponse.json(
//         { message: "Ticket deleted successfully" },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("DELETE /tickets error:", error);
//       return NextResponse.json(
//         { message: "Internal server error" },
//         { status: 500 }
//       );
//     }
//   }

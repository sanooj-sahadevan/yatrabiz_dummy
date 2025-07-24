import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { jwtVerify } from "jose";
import "@/models/Airline";
import twilio from "twilio";
import PassengerNameEditAuditLog from "@/models/PassengerNameEditAuditLog";

const generateBookingReference = async () => {
  const count = await Booking.countDocuments();
  return `BK${Date.now().toString().slice(-6)}${(count + 1)
    .toString()
    .padStart(4, "0")}`;
};

const getUserFromToken = async (request) => {
  try {
    const userToken = request.cookies.get("userToken")?.value;
    const adminToken = request.cookies.get("adminToken")?.value;
    let payload = null;
    let isAdmin = false;
    let id = null;
    if (userToken) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      ({ payload } = await jwtVerify(userToken, secret));
      id = payload.id;
    } else if (adminToken) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      ({ payload } = await jwtVerify(adminToken, secret));
      id = payload.id;
      isAdmin = true;
    } else {
      return null;
    }
    return {
      id,
      email: payload.email,
      name: payload.name,
      isAdmin,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export async function POST(request) {
  try {
    await connectToDatabase();
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { ticketId, numberOfSeats, passengers, totalAmount, infants } = body;
    if (!ticketId || !numberOfSeats || !passengers || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!Array.isArray(passengers) || passengers.length < numberOfSeats) {
      return NextResponse.json(
        { error: "Invalid passengers data" },
        { status: 400 }
      );
    }
    if (infants && Array.isArray(infants)) {
      for (const infant of infants) {
        if (
          !infant.firstName ||
          !infant.lastName ||
          !infant.dob ||
          !infant.associatedPassenger
        ) {
          return NextResponse.json(
            {
              error:
                "All infant details are required (first name, last name, DOB, associated passenger).",
            },
            { status: 400 }
          );
        }
      }
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    const isInternational = ticket.journeyType === "International";
    for (const passenger of passengers) {
      if (!passenger.honorific || !passenger.firstName || !passenger.lastName) {
        return NextResponse.json(
          {
            error:
              "All passenger details are required (honorific, first name, last name).",
          },
          { status: 400 }
        );
      }
      if (["Miss", "Master"].includes(passenger.honorific) && !passenger.dob) {
        return NextResponse.json(
          { error: "DOB is required for Miss or Master honorific." },
          { status: 400 }
        );
      }
      if (isInternational) {
        if (
          ["Miss", "Master"].includes(passenger.honorific) &&
          (!passenger.passportNumber ||
            !passenger.passportExpiry ||
            !passenger.nationality)
        ) {
          return NextResponse.json(
            {
              error:
                "For international Miss/Master, passport number, expiry, and nationality are required.",
            },
            { status: 400 }
          );
        }
        if (
          ["Mr.", "Mrs.", "Ms."].includes(passenger.honorific) &&
          (!passenger.passportNumber ||
            !passenger.passportExpiry ||
            !passenger.nationality)
        ) {
          return NextResponse.json(
            {
              error:
                "For international passengers, passport number, expiry, and nationality are required.",
            },
            { status: 400 }
          );
        }
      }
    }
    if (ticket.availableSeats < numberOfSeats) {
      return NextResponse.json(
        { error: "Not enough seats available" },
        { status: 400 }
      );
    }
    const bookingReference = await generateBookingReference();
    let passengersToSave = passengers.map((p) => {
      let type = "Adult";
      if (["Master", "Miss"].includes(p.honorific)) {
        type = "Kid";
      }
      return {
        honorific: p.honorific,
        firstName: p.firstName,
        lastName: p.lastName,
        dob: p.dob ? new Date(p.dob) : null,
        bookingStatus: "Pending",
        paymentStatus: "Pending",
        paymentMethod: "N/A",
        passportNumber: isInternational ? p.passportNumber : undefined,
        passportExpiry: isInternational ? p.passportExpiry : undefined,
        nationality: isInternational ? p.nationality : undefined,
        type: type,
      };
    });
    if (infants && Array.isArray(infants)) {
      const infantsToAdd = infants.map((i) => ({
        firstName: i.firstName,
        lastName: i.lastName,
        dob: i.dob ? new Date(i.dob) : null,
        associatedPassenger: i.associatedPassenger,
        associatedPassengerName: i.associatedPassengerName,
        type: "Infant",
        bookingStatus: "Pending",
        paymentStatus: "Pending",
        paymentMethod: "N/A",
      }));
      passengersToSave = [...passengersToSave, ...infantsToAdd];
    }
    const pricePerSeat =
      Number(ticket.Discount) > 0
        ? Number(ticket.Discount)
        : Number(ticket.salePrice) || 0;
    const infantFee = Number(ticket.infantFees) || 0;
    const calculatedTotalAmount =
      pricePerSeat * numberOfSeats + infantFee * (infants ? infants.length : 0);
    if (Number(totalAmount) !== calculatedTotalAmount) {
      return NextResponse.json(
        {
          error:
            "Total amount mismatch. Please refresh and try again. (Possible tampering detected)",
        },
        { status: 400 }
      );
    }
    const booking = new Booking({
      user: currentUser.id,
      ticket: ticketId,
      numberOfSeats,
      passengers: passengersToSave,
      totalAmount: Number(totalAmount),
      bookingReference,
      // infants: infantsToSave,
    });
    await booking.save();
    ticket.availableSeats -= numberOfSeats;
    await ticket.save();
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      const messageBody = `🛫 *New Booking Alert!*\n\n*Agent:* ${currentUser.name}\n*Email:* ${currentUser.email}\n*Booking Ref:* ${booking.bookingReference}\n*Total Price:* ₹${booking.totalAmount}\n*Passenger Count:* ${booking.numberOfSeats}\n\nView details: `;

      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: process.env.TWILIO_WHATSAPP_ADMIN,
        body: messageBody,
      });
    } catch (err) {
      console.error("Failed to send WhatsApp message:", err.message);
    }

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        totalAmount: booking.totalAmount,
        numberOfSeats: booking.numberOfSeats,
        passengers: booking.passengers.map((p) => ({
          honorific: p.honorific,
          firstName: p.firstName,
          lastName: p.lastName,
          dob: p.dob,
          bookingStatus: p.bookingStatus,
          paymentStatus: p.paymentStatus,
          paymentMethod: p.paymentMethod,
          remarks: p.remarks,
          nameEditRemarks: p.nameEditRemarks,
          passportNumber: p.passportNumber,
          passportExpiry: p.passportExpiry,
          nationality: p.nationality,
        })),
        infants: booking.infants || [],
        user: currentUser,
        Discount: ticket.Discount,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");
    if (bookingId) {
      const booking = await Booking.findById(bookingId)
        .populate({
          path: "ticket",
          select:
            "airline PNR dateOfJourney departureTime arrivalTime flightNumber isDummyPNR salePrice classType journeyType infantFees",
          populate: [
            { path: "airline", select: "name code headerImageBase64" },
            { path: "departureLocation", select: "name code" },
            { path: "arrivalLocation", select: "name code" },
          ],
        })
        .populate("user", "name email");
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
      return new NextResponse(JSON.stringify(booking), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      });
    }

    let query = {};
    let isUser = !currentUser.isAdmin;
    let userId = null;
    if (isUser) {
      userId = searchParams.get("user");
      if (!userId || currentUser.id !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      query.user = userId;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "ticket",
        select:
          "airline PNR dateOfJourney departureTime arrivalTime flightNumber isDummyPNR salePrice classType journeyType infantFees",
        populate: [
          { path: "airline", select: "name code headerImageBase64" },
          { path: "departureLocation", select: "name code" },
          { path: "arrivalLocation", select: "name code" },
        ],
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    if (isUser) {
      const customerBookings = bookings.map((booking) => {
        return {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          user: booking.user,
          ticket: booking.ticket,
          passengers: booking.passengers,
          numberOfSeats: booking.numberOfSeats,
          totalAmount: booking.totalAmount,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod || "N/A",
          adminId: booking.adminId,
          transactionId: booking.transactionId,
          remarks: booking.remarks,
          bookingDate: booking.bookingDate,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      });
      return new NextResponse(JSON.stringify(customerBookings), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      });
    }
    return new NextResponse(JSON.stringify(bookings), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3",
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectToDatabase();
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const {
      bookingId,
      passengerIndex,
      honorific,
      firstName,
      lastName,
      remarks,
      nameEditRemarks,
    } = body;
    if (!bookingId || passengerIndex === undefined) {
      return NextResponse.json(
        { error: "Missing bookingId or passengerIndex" },
        { status: 400 }
      );
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.user.toString() !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to edit this booking" },
        { status: 403 }
      );
    }
    if (!booking.passengers[passengerIndex]) {
      return NextResponse.json(
        { error: "Passenger not found" },
        { status: 404 }
      );
    }
    // Store old name for audit log
    const oldPassenger = { ...booking.passengers[passengerIndex]._doc };
    const oldName = [
      oldPassenger.honorific,
      oldPassenger.firstName,
      oldPassenger.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    if (honorific !== undefined)
      booking.passengers[passengerIndex].honorific = honorific;
    if (firstName !== undefined)
      booking.passengers[passengerIndex].firstName = firstName;
    if (lastName !== undefined)
      booking.passengers[passengerIndex].lastName = lastName;
    if (remarks !== undefined)
      booking.passengers[passengerIndex].remarks = remarks;
    if (nameEditRemarks !== undefined)
      booking.passengers[passengerIndex].nameEditRemarks = nameEditRemarks;
    const newPassenger = booking.passengers[passengerIndex];
    const newName = [
      newPassenger.honorific,
      newPassenger.firstName,
      newPassenger.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    await booking.save();

    if (oldName !== newName) {
      const ticket = await Ticket.findById(booking.ticket);
      await PassengerNameEditAuditLog.create({
        adminName: currentUser.name,
        bookingReference: booking.bookingReference,
        PNR: ticket ? ticket.PNR : "",
        passengerNameOld: oldName,
        passengerNameNew: newName,
        remarks: nameEditRemarks || "",
      });
    }
    return NextResponse.json({
      success: true,
      passenger: booking.passengers[passengerIndex],
    });
  } catch (error) {
    console.error("Error editing passenger:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

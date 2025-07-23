import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  // New: Passenger type (Adult, Child, Infant)
  type: {
    type: String,
    required: [true, "Passenger type is required"],
    enum: ["Adult", "Kid", "Infant"],
    default: "Adult",
  },
  associatedPassenger: {
    type: String,
    required: false,
  },
  honorific: {
    type: String,
    required: [false, "Passenger honorific is required"],
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, "Passenger first name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Passenger last name is required"],
    trim: true,
  },
  // Deprecated: use 'type' instead
  isKid: {
    type: Boolean,
    default: false,
  },
  // Deprecated: use 'type' instead
  isInfant: {
    type: Boolean,
    default: false,
  },

  dob: {
    type: Date,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+$/, "Please provide a valid email address."],
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  remarks: {
    type: String,
    required: false,
    trim: true,
  },
  nameEditRemarks: {
    type: String,
    required: false,
    trim: true,
  },
  passportNumber: {
    type: String,
    required: false,
    trim: true,
  },
  passportExpiry: {
    type: Date,
    required: false,
    trim: true,
  },
  nationality: {
    type: String,
    required: false,
    trim: true,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket is required"],
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },
    passengers: [passengerSchema],
    numberOfSeats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [1, "At least one seat must be booked"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be non-negative"],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    bookingStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Online", "Offline", "N/A"],
      default: "N/A",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    transactionId: {
      type: String,
      required: false,
      trim: true,
    },
    remarks: {
      type: String,
      required: false,
      trim: true,
    },
    agentOutstanding: {
      type: Number,
      default: 0,
      required: true,
    },
    agentCredit: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes to speed up queries
bookingSchema.index({ createdAt: -1 }); // For sorting by newest
bookingSchema.index({ user: 1, createdAt: -1 }); // For user booking history
bookingSchema.index({ bookingStatus: 1 }); // For status filtering
bookingSchema.index({ paymentStatus: 1 }); // For payment status filtering
bookingSchema.index({ ticket: 1 }); // For ticket-based lookups

if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

// API route: /api/bookings/[id]/edit-passenger
// This is a Next.js API route handler for updating a passenger's info
export async function POST(req, { params }) {
  const { id } = params;
  const { passengerIndex, honorific, firstName, lastName, remarks } =
    await req.json();
  if (!id || passengerIndex === undefined) {
    return new Response(
      JSON.stringify({ error: "Missing booking id or passenger index" }),
      { status: 400 }
    );
  }
  const mongoose = require("mongoose");
  await mongoose.connect(process.env.MONGODB_URI);
  const Booking = mongoose.models.Booking;
  const booking = await Booking.findById(id);
  if (!booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
    });
  }
  if (!booking.passengers[passengerIndex]) {
    return new Response(JSON.stringify({ error: "Passenger not found" }), {
      status: 404,
    });
  }
  booking.passengers[passengerIndex].honorific = honorific;
  booking.passengers[passengerIndex].firstName = firstName;
  booking.passengers[passengerIndex].lastName = lastName;
  booking.passengers[passengerIndex].remarks = remarks;
  await booking.save();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

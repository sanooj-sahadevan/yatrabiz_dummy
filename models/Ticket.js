import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    PNR: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    isDummyPNR: { type: Boolean, default: false },

    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: [true, "Airline is required"],
      index: true,
    },
    flightNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    journeyType: {
      type: String,
      enum: ["Domestic", "International"],
      required: true,
    },
    classType: {
      type: String,
      enum: ["Economy", "Premium Economy", "Business Class", "First Class"],
      required: true,
    },

    departureLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    arrivalLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    connectingLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      index: true,
    },

    dateOfJourney: {
      type: Date,
      required: true,
      index: true,
    },
    departureTime: {
      type: String,
      required: true,
      trim: true,
    },
    arrivalTime: {
      type: String,
      required: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    dateOfNameSubmission: {
      type: Date,
      required: true,
    },

    advPaidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    outstanding: {
      type: Number,
      required: true,
      min: 0,
    },
    outstandingDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    release: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    nonBookable: {
      type: Boolean,
      default: false,
      index: true,
    },

    handBaggage: { type: String, default: "", trim: true },
    checkedBaggage: { type: String, default: "", trim: true },
    infantFees: {
      type: Number,
      min: 0,
      default: 0,
    },
    Discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    outstandingPayments: [
      {
        date: { type: Date, required: true },
        amountPaid: { type: Number, required: true, min: 0 },
        transactionId: { type: String, required: true, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ✅ Compound & single-field indexes for query optimization
ticketSchema.index({ airline: 1, dateOfJourney: 1 });
ticketSchema.index({ departureLocation: 1, arrivalLocation: 1 });
ticketSchema.index({ nonBookable: 1, availableSeats: 1, dateOfJourney: 1 });
ticketSchema.index({ airline: 1, departureLocation: 1, arrivalLocation: 1, dateOfJourney: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;

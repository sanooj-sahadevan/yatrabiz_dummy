import mongoose from "mongoose";

const airlineLedgerSchema = new mongoose.Schema(
  {
    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: [true, "Airline reference is required"],
    },
    PNR: {
      type: String,
      required: [true, "PNR is required"],
      trim: true,
    },
    totalPayment: {
      type: Number,
      required: [true, "Total payment amount is required"],
      min: [0, "Total payment must be non-negative"],
    },
    advance: {
      type: Number,
      required: [true, "Advance amount is required"],
      min: [0, "Advance must be non-negative"],
      default: 0,
    },
    outstanding: {
      type: Number,
      required: [true, "Outstanding amount is required"],
      min: [0, "Outstanding must be non-negative"],
      default: 0,
    },
    outstandingDate: {
      type: Date,
      required: [true, "Outstanding date is required"],
    },
    customerPaidAmount: {
      type: Number,
      default: 0,
      min: [0, "Customer paid amount must be non-negative"],
    },
    customerOutstanding: {
      type: Number,
      default: 0,
      min: [0, "Customer outstanding must be non-negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by airline and PNR
airlineLedgerSchema.index({ airline: 1, PNR: 1 });
// Index for fast outstanding lookups by date
airlineLedgerSchema.index({ outstandingDate: -1 });
// Compound index for airline and outstandingDate
airlineLedgerSchema.index({ airline: 1, outstandingDate: -1 });

const AirlineLedger =
  mongoose.models.AirlineLedger ||
  mongoose.model("AirlineLedger", airlineLedgerSchema);
export default AirlineLedger;

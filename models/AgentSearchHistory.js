import mongoose from "mongoose";

const agentSearchHistorySchema = new mongoose.Schema(
  {
    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
    },
    departureLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    arrivalLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    journeyDate: {
      type: Date,
    },
    searchTime: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
agentSearchHistorySchema.index({ searchTime: -1 });

const AgentSearchHistory =
  mongoose.models.AgentSearchHistory ||
  mongoose.model("AgentSearchHistory", agentSearchHistorySchema);

export default AgentSearchHistory;

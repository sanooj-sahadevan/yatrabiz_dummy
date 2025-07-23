import mongoose from "mongoose";

const airlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Airline code is required"],
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: [3, "Airline code must be 3 characters or less"],
    },
    headerImageBase64: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure code is uppercase
airlineSchema.pre("save", function (next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Static method to get active airlines
airlineSchema.statics.getActiveAirlines = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to get airline by code
airlineSchema.statics.getByCode = function (code) {
  return this.findOne({ code: code.toUpperCase() });
};

export default mongoose.models.Airline ||
  mongoose.model("Airline", airlineSchema);

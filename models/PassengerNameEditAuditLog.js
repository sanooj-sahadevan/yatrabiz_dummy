import mongoose from 'mongoose';

const passengerNameEditAuditLogSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    bookingReference: {
      type: String,
      required: true,
    },
    PNR: {
      type: String,
      required: true,
    },
    passengerNameOld: {
      type: String,
      required: true,
    },
    passengerNameNew: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PassengerNameEditAuditLog = mongoose.models.PassengerNameEditAuditLog || mongoose.model('PassengerNameEditAuditLog', passengerNameEditAuditLogSchema);

export default PassengerNameEditAuditLog; 
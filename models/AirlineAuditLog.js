import mongoose from 'mongoose';

const airlineAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    airline: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
  },
  { timestamps: true }
);

const AirlineAuditLog = mongoose.models.AirlineAuditLog || mongoose.model('AirlineAuditLog', airlineAuditLogSchema);

export default AirlineAuditLog; 


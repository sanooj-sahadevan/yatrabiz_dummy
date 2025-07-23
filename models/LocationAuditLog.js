import mongoose from 'mongoose';

const locationAuditLogSchema = new mongoose.Schema(
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
    location: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
  },
  { timestamps: true }
);

const LocationAuditLog = mongoose.models.LocationAuditLog || mongoose.model('LocationAuditLog', locationAuditLogSchema);

export default LocationAuditLog; 
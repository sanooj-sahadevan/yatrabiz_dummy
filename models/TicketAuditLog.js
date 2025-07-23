import mongoose from 'mongoose';

const ticketAuditLogSchema = new mongoose.Schema(
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
    ticket: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
  },
  { timestamps: true }
);

const TicketAuditLog = mongoose.models.TicketAuditLog || mongoose.model('TicketAuditLog', ticketAuditLogSchema);

export default TicketAuditLog; 
import mongoose from 'mongoose';

const bookingRequestAuditLogSchema = new mongoose.Schema(
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
      enum: ['APPROVE', 'REJECT', 'PAYMENT_STATUS_CHANGE'],
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    passenger: {
      type: mongoose.Schema.Types.Mixed, 
      required: false,
    },
  },
  { timestamps: true }
);

const BookingRequestAuditLog = mongoose.models.BookingRequestAuditLog || mongoose.model('BookingRequestAuditLog', bookingRequestAuditLogSchema);

export default BookingRequestAuditLog; 
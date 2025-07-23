import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entity: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Ticket", "Booking"],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    changedBy: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    person: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const AdminAuditLog =
  mongoose.models.AdminAuditLog ||
  mongoose.model("AdminAuditLog", auditLogSchema);
export default AdminAuditLog;

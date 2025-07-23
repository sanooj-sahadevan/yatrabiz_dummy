import mongoose from "mongoose";
import AuditLog from "@/models/AdminAuditLog";
import TicketAuditLog from "@/models/TicketAuditLog";

/**
 * Creates an audit log entry
 * @param {Object} params
 * @param {string} params.entity - The entity type (Admin, User, Ticket, Booking)
 * @param {string} params.entityId - The ID of the entity being modified
 * @param {string} params.changedBy - The ID of the admin making the change
 * @param {string} params.action - The action type (CREATE, UPDATE, DELETE)
 * @param {Object} params.changes - The changes made to the entity
 * @param {Object} [params.person] - Additional person data about the change
 * @returns {Promise<Object>} The created audit log entry
 */
export async function createAuditLog({
  entity,
  entityId,
  changedBy,
  action,
  changes,
  person = {},
}) {
  try {
    const auditLog = new AuditLog({
      entity,
      entityId,
      changedBy,
      action,
      changes,
      person,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw error;
  }
}

/**
 * Creates a ticket-specific audit log entry
 * @param {Object} params
 * @param {string} params.adminId - The ID of the admin making the change
 * @param {string} params.action - The action type (CREATE, UPDATE, DELETE)
 * @param {Object} params.changes - The changes made to the ticket
 * @param {Object} params.ticket - The ticket data
 * @returns {Promise<Object>} The created ticket audit log entry
 */
export async function createTicketAuditLog({
  adminId,
  action,
  changes,
  ticket,
}) {
  try {
    // Ensure adminId is a valid ObjectId
    let validAdminId = adminId;
    if (typeof adminId === "string") {
      try {
        validAdminId = new mongoose.Types.ObjectId(adminId);
      } catch (error) {
        console.error("Invalid adminId format:", adminId);
        throw new Error("Invalid admin ID format");
      }
    }

    const ticketAuditLog = new TicketAuditLog({
      adminId: validAdminId,
      action,
      changes,
      ticket,
    });

    await ticketAuditLog.save();

    return ticketAuditLog;
  } catch (error) {
    console.error("Error creating ticket audit log:", error);
    console.error("Input data:", {
      adminId,
      action,
      changes: Object.keys(changes || {}),
      ticketPNR: ticket?.PNR,
    });
    throw error;
  }
}

/**
 * Gets audit logs with filtering and pagination
 * @param {Object} params
 * @param {string} [params.entity] - Filter by entity type
 * @param {string} [params.entityId] - Filter by entity ID
 * @param {string} [params.changedBy] - Filter by admin who made the change
 * @param {string} [params.action] - Filter by action type
 * @param {Date} [params.startDate] - Filter by start date
 * @param {Date} [params.endDate] - Filter by end date
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<Object>} The paginated audit logs
 */
export async function getAuditLogs({
  entity,
  entityId,
  changedBy,
  action,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) {
  try {
    const query = {};

    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (changedBy) query.changedBy = changedBy;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("changedBy", "name email"),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
}

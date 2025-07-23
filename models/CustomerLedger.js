import mongoose from 'mongoose';

const customerLedgerSchema = new mongoose.Schema({
  PNR: {
    type: String,
    required: [true, 'PNR is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  airline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airline',
    required: [true, 'Airline reference is required']
  },
  bookedDate: {
    type: Date,
    required: [true, 'Booked date is required'],
    default: Date.now
  },
  dateOfJourney: {
    type: Date,
    required: [true, 'Date of journey is required']
  },
  totalPayment: {
    type: Number,
    required: [true, 'Total payment amount is required'],
    min: [0, 'Total payment must be non-negative']
  },
  credit: {
    type: Number,
    required: [true, 'Credit amount is required'],
    min: [0, 'Credit must be non-negative'],
    default: 0
  },
  due: {
    type: Number,
    required: [true, 'Due amount is required'],
    min: [0, 'Due must be non-negative'],
    default: 0
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket reference is required']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Online', 'Offline', 'Other', 'N/A'],
    default: 'Cash'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
customerLedgerSchema.index({ user: 1 });
customerLedgerSchema.index({ airline: 1 });
customerLedgerSchema.index({ dateOfJourney: 1 });
customerLedgerSchema.index({ booking: 1 }); // For finding existing entries by booking
customerLedgerSchema.index({ user: 1, booking: 1 }); // For finding customer's booking entries
customerLedgerSchema.index({ PNR: 1 }); // For PNR-based queries
// Compound index for user, airline, and dateOfJourney
customerLedgerSchema.index({ user: 1, airline: 1, dateOfJourney: 1 });
// Compound index for airline and dateOfJourney
customerLedgerSchema.index({ airline: 1, dateOfJourney: 1 });

// Pre-save middleware to ensure due amount is calculated correctly
customerLedgerSchema.pre('save', function(next) {
  // Calculate due amount as totalPayment - credit
  this.due = Math.max(0, (this.totalPayment || 0) - (this.credit || 0));
  next();
});

// Virtual for calculating remaining balance
customerLedgerSchema.virtual('remainingBalance').get(function() {
  return this.totalPayment - this.credit;
});

// Method to update due amount
customerLedgerSchema.methods.updateDue = function() {
  this.due = this.totalPayment - this.credit;
  return this.save();
};

// Method to add payment
customerLedgerSchema.methods.addPayment = function(amount, method = 'Cash') {
  this.credit += amount;
  this.due = this.totalPayment - this.credit;
  this.paymentMethod = method;
  return this.save();
};

// Method to add new booking to existing ledger
customerLedgerSchema.methods.addBooking = function(amount, isPaid = false, bookingRef = '', method = 'Cash') {
  this.totalPayment += amount;
  if (isPaid) {
    this.credit += amount;
  }
  this.due = this.totalPayment - this.credit;
  this.paymentMethod = method;
  
  if (bookingRef) {
    this.notes = `${this.notes || ''}\nBooking ${bookingRef} - ${isPaid ? 'Paid' : 'Pending'} - ₹${amount}`;
  }
  
  return this.save();
};

// Static method to get customer summary
customerLedgerSchema.statics.getCustomerSummary = async function(userId = null) {
  const matchStage = userId ? { user: userId } : {};
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'airlines',
        localField: 'airline',
        foreignField: '_id',
        as: 'airlineInfo'
      }
    },
    {
      $unwind: '$airlineInfo'
    },
    {
      $group: {
        _id: userId ? '$airlineInfo.name' : '$user',
        airlineCode: { $first: '$airlineInfo.code' },
        totalEntries: { $sum: 1 },
        totalPayment: { $sum: '$totalPayment' },
        totalCredit: { $sum: '$credit' },
        totalDue: { $sum: '$due' },
        activeEntries: {
          $sum: { $cond: [{ $gt: ['$due', 0] }, 1, 0] }
        },
        paidEntries: {
          $sum: { $cond: [{ $eq: ['$due', 0] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return summary;
};

// Static method to find or create ledger for customer and booking
customerLedgerSchema.statics.findOrCreateForCustomer = async function(userId, airlineId, bookingId, pnr, dateOfJourney, adminId) {
  let ledger = await this.findOne({ 
    user: userId, 
    booking: bookingId,
    PNR: pnr
  });
  
  if (!ledger) {
    ledger = new this({
      PNR: pnr,
      user: userId,
      airline: airlineId,
      bookedDate: new Date(),
      dateOfJourney: new Date(dateOfJourney),
      totalPayment: 0,
      credit: 0,
      due: 0,
      booking: bookingId,
      createdBy: adminId
    });
  }
  
  return ledger;
};

const CustomerLedger = mongoose.models.CustomerLedger || mongoose.model('CustomerLedger', customerLedgerSchema);
export default CustomerLedger; 
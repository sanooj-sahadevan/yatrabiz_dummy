// Utility functions for ticket calculations

/**
 * Calculate total price based on purchase price and total seats
 * @param {number} purchasePrice - The purchase price per ticket
 * @param {number} totalSeats - The total number of seats
 * @returns {number} The calculated total price
 */
export const calculateTotalPrice = (purchasePrice, totalSeats) => {
  const price = parseFloat(purchasePrice) || 0;
  const seats = parseInt(totalSeats) || 0;
  
  if (price < 0 || seats < 0) {
    return 0;
  }
  
  return price * seats;
};

/**
 * Calculate outstanding amount based on total price and advance paid
 * @param {number} totalPrice - The total price
 * @param {number} advPaidAmount - The advance paid amount
 * @returns {number} The calculated outstanding amount
 */
export const calculateOutstandingAmount = (totalPrice, advPaidAmount) => {
  const total = parseFloat(totalPrice) || 0;
  const advance = parseFloat(advPaidAmount) || 0;
  
  if (total < 0 || advance < 0) {
    return 0;
  }
  
  const outstanding = total - advance;
  return Math.max(0, outstanding); // Ensure outstanding is not negative
};

/**
 * Validate ticket calculations
 * @param {Object} ticketData - The ticket data object
 * @returns {Object} Validation result with isValid and errors
 */
export const validateTicketCalculations = (ticketData) => {
  const errors = [];
  
  const {
    purchasePrice,
    totalSeats,
    totalPrice,
    advPaidAmount,
    outstanding
  } = ticketData;
  
  // Validate purchase price
  if (purchasePrice < 0) {
    errors.push("Purchase price cannot be negative");
  }
  
  // Validate total seats
  if (totalSeats < 1) {
    errors.push("Total seats must be at least 1");
  }
  
  // Validate advance paid amount
  if (advPaidAmount < 0) {
    errors.push("Advance paid amount cannot be negative");
  }
  
  // Validate total price calculation
  const calculatedTotal = calculateTotalPrice(purchasePrice, totalSeats);
  if (totalPrice && Math.abs(calculatedTotal - totalPrice) > 0.01) {
    errors.push("Total price calculation mismatch");
  }
  
  // Validate outstanding amount calculation
  const calculatedOutstanding = calculateOutstandingAmount(totalPrice, advPaidAmount);
  if (outstanding && Math.abs(calculatedOutstanding - outstanding) > 0.01) {
    errors.push("Outstanding amount calculation mismatch");
  }
  
  // Validate advance doesn't exceed total
  if (advPaidAmount > totalPrice) {
    errors.push("Advance paid amount cannot exceed total price");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Auto-calculate all ticket amounts based on input values
 * @param {Object} formData - Current form data
 * @param {string} changedField - Name of the field that changed
 * @returns {Object} Updated form data with calculated values
 */
export const autoCalculateTicketAmounts = (formData, changedField) => {
  const updatedData = { ...formData };
  
  // Calculate total price when purchase price or total seats change
  if (changedField === 'purchasePrice' || changedField === 'totalSeats' || changedField === 'Discount') {
    let totalPrice = calculateTotalPrice(
      updatedData.purchasePrice,
      updatedData.totalSeats
    );
    if (updatedData.Discount && updatedData.totalSeats) {
      totalPrice = totalPrice - (Number(updatedData.Discount) * Number(updatedData.totalSeats));
      if (totalPrice < 0) totalPrice = 0;
    }
    updatedData.totalPrice = totalPrice;
    
    // Recalculate outstanding amount
    updatedData.outstanding = calculateOutstandingAmount(
      totalPrice,
      updatedData.advPaidAmount
    );
  }
  
  // Calculate outstanding amount when total price or advance paid changes
  if (changedField === 'totalPrice' || changedField === 'advPaidAmount') {
    updatedData.outstanding = calculateOutstandingAmount(
      updatedData.totalPrice,
      updatedData.advPaidAmount
    );
  }
  
  return updatedData;
}; 
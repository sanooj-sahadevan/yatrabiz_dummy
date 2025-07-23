// Payment details constants for PaymentDetailsPage

export const PAYMENT_ACCOUNT_DETAILS = [
  {
    label: "Account Holder Name",
    value: "Yatrabiz",
    key: "accountHolderName",
  },
  { label: "Account Number", value: "1234567890", key: "accountNo" },
  { label: "IFSC Code", value: "XXX01", key: "ifsc" },
  { label: "Branch Name", value: "Surat", key: "branchName" },
  { label: "Account Type", value: "Savings", key: "accountType" },
  { label: "Bank", value: "SBI", key: "bank" },
  { label: "UPI ID", value:  process.env.NEXT_PUBLIC_UPI_ID, key: "upiId" },
];

export const PAYMENT_QR = {
  upiString: process.env.NEXT_PUBLIC_UPI_STRING,
  upiId: process.env.NEXT_PUBLIC_UPI_ID,
  contactWhatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP,
  contactNumber: "+91 9898033224",
  contactEmail: "support@yatrabiz.in",
};

export const PAYMENT_TERMS_AND_CONDITIONS = [
  "Full payment is required before ticket confirmation.",
  "Confirmation will be sent after verification.",
  "Airline charges apply. Fees are non-refundable.",
  "Refunds are processed in 7-15 business days after approval.",
  "Valid travel documents are mandatory for boarding.",
  "Schedule changes may occur; support provided.",
  "We’re an intermediary and not liable for airline delays.",
  "Support: WhatsApp us at +91 9898033224 or email support@yatrabiz.in",
];

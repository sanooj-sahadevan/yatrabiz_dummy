import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/common/Modal";
import { formatPrice } from "@/utils/formatters";

const PaymentSelectionModal = ({
  isOpen,
  onClose,
  totalAmount,
  onPayNow,
  onPayLater,
  onPayNowSubmit,
  isSubmitting,
  paymentChoice,
  setPaymentChoice,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Options">
      <div
        className="w-full max-w-md mx-auto px-4 py-2"
        style={{ backgroundColor: "#0A2239", color: "white" }}
      >
        {paymentChoice === "now" ? (
          <>
            {/* Back Button */}
            <button
              className="flex items-center text-blue-400 hover:text-blue-300 hover:underline text-sm mb-2"
              onClick={() => setPaymentChoice(null)}
            >
              <span className="mr-1">&#8592;</span>
              Back
            </button>

            {/* Header */}
            <h2 className="text-2xl font-semibold text-center mb-2 text-white">
              Pay Online
            </h2>
            <hr className="border-gray-400 mb-2" />

            {/* Total Amount */}
            <div className="text-center mb-2">
              <p className="text-sm text-gray-300">Total Amount</p>
              <p className="text-3xl font-bold text-green-400">
                {formatPrice(totalAmount)}
              </p>
            </div>

            {/* QR Code */}
            <p className="text-center text-sm font-medium text-gray-200 mb-1">
              Scan the QR code to pay
            </p>
            <div className="flex justify-center mb-2">
              <div className="border border-gray-300 rounded-lg p-1 bg-gray-50 shadow-sm">
                <QRCodeSVG
                  value="upi://pay?pa=6355309528@pz&pn=sanooj"
                  size={100}
                />
              </div>
            </div>
            <p className="text-xs text-gray-300 text-center mb-2">
              Works with UPI apps like Google Pay, PhonePe, Paytm, etc.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3 mb-2">
              <a
                href="https://wa.me/919898033224?text=Hi%2C%20I%20have%20a%20question%20about%20my%20booking."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow"
              >
                WhatsApp
              </a>
              <div className="flex gap-2">
                <button
                  className="bg-gray-100 text-gray-700 px-4 py-1 rounded font-semibold border border-gray-300 hover:bg-gray-200 text-sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 shadow text-sm"
                  onClick={onPayNowSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Payment Done"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-gray-300 border-t border-gray-600 pt-2">
              By proceeding, you agree to our{" "}
              <a href="#" className="underline hover:text-blue-400">
                Terms & Conditions
              </a>{" "}
              and acknowledge that payment will be verified before ticket
              confirmation.
            </p>
          </>
        ) : (
          <>
            {/* Header */}
            <h2 className="text-2xl font-semibold text-center mb-3 text-white">
              Choose Payment Option
            </h2>
            <hr className="border-gray-400 mb-4" />

            {/* Total Amount */}
            <div className="text-center mb-3">
              <p className="text-sm text-gray-300">Total Amount</p>
              <p className="text-3xl font-bold text-green-400">
                {formatPrice(totalAmount)}
              </p>
            </div>

            {/* Choice Buttons */}
            <p className="text-center text-sm font-medium text-gray-200 mb-3">
              How would you like to pay?
            </p>
            <div className="flex justify-center gap-3 mb-5">
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 text-sm shadow"
                onClick={onPayNow}
                disabled={isSubmitting}
              >
                Pay Now
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded font-semibold border border-gray-300 hover:bg-gray-200 text-sm"
                onClick={onPayLater}
                disabled={isSubmitting}
              >
                Pay Later
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-gray-300 border-t border-gray-600 pt-3">
              By proceeding, you agree to our{" "}
              <a href="#" className="underline hover:text-blue-400">
                Terms & Conditions
              </a>{" "}
              and acknowledge that payment will be verified before ticket
              confirmation.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentSelectionModal;

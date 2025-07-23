"use client";
import { useState, useEffect } from "react";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { PaidIcon, UnpaidIcon, OnlineIcon, CashIcon } from "@/constants/icons";

export default function PaymentSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  initialStep = 1,
}) {
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(initialStep);
  // Ensure step is reset to initialStep whenever modal is opened or initialStep changes
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);
  const [transactionId, setTransactionId] = useState("");

  const handlePaymentStatusSelect = (status) => {
    setPaymentStatus(status);
    if (status === "Unpaid") {
      handleConfirm(status, "N/A");
    } else {
      setStep(2);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === "Online") return; // Wait for transactionId input
    const status = initialStep === 2 ? "Paid" : paymentStatus;
    handleConfirm(status, method, "");
  };

  const handleConfirm = (status, method, txnId = "") => {
    let finalPaymentStatus = status === "Unpaid" ? "Pending" : "Paid";
    onConfirm(bookingId, finalPaymentStatus, method, txnId);
    handleClose();
  };

  const handleOnlineConfirm = () => {
    if (!transactionId.trim()) return; // Optionally show error
    const status = initialStep === 2 ? "Paid" : paymentStatus;
    handleConfirm(status, "Online", transactionId);
  };

  const handleClose = () => {
    setPaymentStatus("");
    setPaymentMethod("");
    setTransactionId("");
    setStep(initialStep);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 1
          ? "Payment Status"
          : initialStep === 2
          ? "Complete Payment"
          : "Payment Method"
      }
      showCloseButton={true}
      closeOnOutsideClick={true}
      maxWidth="max-w-md"
    >
      <div className="px-4 py-4">
        {step === 1 && (
          <>
            <p className="text-center text-black mb-6 font-medium">
              Is the payment for this booking completed?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                tabIndex={2}
                onClick={() => handlePaymentStatusSelect("Paid")}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-green-400 rounded-xl shadow-md bg-green-50 hover:bg-green-100 transition focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <PaidIcon />
                <span className="font-semibold text-black text-lg">Paid</span>
                <span className="text-sm text-black text-center">
                  Payment has been received
                </span>
              </button>
              <button
                tabIndex={3}
                onClick={() => handlePaymentStatusSelect("Unpaid")}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-red-400 rounded-xl shadow-md bg-red-50 hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <UnpaidIcon />
                <span className="font-semibold text-black text-lg">Unpaid</span>
                <span className="text-sm text-black text-center">
                  Payment is pending
                </span>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-center text-black mb-6 font-medium">
              {initialStep === 2
                ? "How was the payment completed?"
                : "How was the payment made?"}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                tabIndex={2}
                onClick={() => handlePaymentMethodSelect("Online")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 border-indigo-400 rounded-xl shadow-md bg-indigo-50 hover:bg-indigo-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${paymentMethod === "Online" ? "ring-2 ring-indigo-500" : ""}`}
              >
                <OnlineIcon />
                <span className="font-semibold text-black text-lg">Online</span>
                <span className="text-sm text-black text-center">
                  Digital payment (card, UPI, etc.)
                </span>
              </button>
              <button
                tabIndex={3}
                onClick={() => handlePaymentMethodSelect("Cash")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 border-amber-400 rounded-xl shadow-md bg-amber-50 hover:bg-amber-100 transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${paymentMethod === "Cash" ? "ring-2 ring-amber-500" : ""}`}
              >
                <CashIcon />
                <span className="font-semibold text-black text-lg">
                  Cash / Manual
                </span>
                <span className="text-sm text-black text-center">
                  Cash, bank transfer, or other manual payment
                </span>
              </button>
            </div>
            {paymentMethod === "Online" && (
              <div className="mt-4 flex flex-col items-center">
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 text-gray-700 py-2 w-full mb-2"
                  placeholder="Enter Transaction ID"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                />
                <button
                  tabIndex={6}
                  onClick={handleOnlineConfirm}
                  disabled={!transactionId.trim()}
                  className="px-5 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Confirm Payment
                </button>
              </div>
            )}
            <div className="mt-4 text-center">
              <button
                tabIndex={4}
                onClick={() => setStep(1)}
                className="text-black hover:text-black text-sm underline"
              >
                ← Back to payment status
              </button>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            tabIndex={5}
            onClick={handleClose}
            className="px-5 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

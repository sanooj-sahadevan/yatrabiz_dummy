"use client";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { useState, useEffect } from "react";

export default function OutstandingPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  payAmount,
  setPayAmount,
  payDate,
  setPayDate,
  payTxnId,
  setPayTxnId,
}) {
  const [canSubmit, setCanSubmit] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPayAmount("");
      setPayDate("");
      setPayTxnId("");
    }
    // eslint-disable-next-line
  }, [isOpen]);

  useEffect(() => {
    setCanSubmit(
      payAmount > 0 &&
        payDate.trim() !== "" &&
        payTxnId.trim() !== ""
    );
  }, [payAmount, payDate, payTxnId]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add Outstanding Payment"
      showCloseButton={true}
      closeOnOutsideClick={true}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Amount (₹)
          </label>
          <input
            type="number"
            className="w-full border border-black rounded px-3 py-2 text-black placeholder:text-gray-400"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            min={0}
            tabIndex={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full border border-black rounded px-3 py-2 text-black placeholder:text-gray-400"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            tabIndex={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Transaction ID
          </label>
          <input
            type="text"
            className="w-full border border-black rounded px-3 py-2 text-black placeholder:text-gray-400"
            value={payTxnId}
            onChange={(e) => setPayTxnId(e.target.value)}
            tabIndex={3}
          />
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded transition-colors duration-200 hover:bg-gray-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            disabled={loading}
            tabIndex={5}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded transition-colors duration-200 hover:bg-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !canSubmit}
            tabIndex={4}
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

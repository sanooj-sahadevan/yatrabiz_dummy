"use client";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { PAYMENT_ACCOUNT_DETAILS, PAYMENT_QR, PAYMENT_TERMS_AND_CONDITIONS } from "@/constants/paymentDetailsConstants";

export default function PaymentDetailsPage() {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen py-6 bg-background">
      <div className="w-full max-w-7xl mx-auto rounded-3xl bg-background-alt shadow-xl px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <nav
            className="text-sm text-gray-500 mb-2 md:mb-0 md:min-w-[180px]"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-2">
              <li className="flex items-center">
                <Link href="/" className="hover:underline text-blue-600">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-1">&rarr;</span>
                <span className="font-semibold text-gray-700">
                  Payment Details
                </span>
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 flex-1">
            Payment Details
          </h1>
          <div className="md:min-w-[180px]"></div>
        </div>
        <div className="w-full max-w-3xl mx-auto mt-10 px-2 space-y-6">
          <div className="flex flex-col md:flex-row bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200 min-w-[180px]">
              <h2 className="text-base font-semibold text-gray-800 mb-2 text-center">
                Scan to Pay
              </h2>
              <div className="p-2 border border-gray-300 rounded-xl shadow bg-white mb-2">
                <QRCodeSVG
                  value={PAYMENT_QR.upiString}
                  size={110}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="text-xs text-gray-600 text-center mb-1">
                Works with Google Pay, PhonePe, Paytm and more.
              </p>
              <p className="text-[10px] text-gray-500 text-center mb-2">
                UPI ID: <span className="font-medium text-gray-700">{PAYMENT_QR.upiId}</span>
              </p>
              <a
                href={PAYMENT_QR.contactWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg text-xs font-medium transition shadow"
              >
                Contact via WhatsApp
              </a>
            </div>
            {/* Account Details Right */}
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h2 className="text-base font-semibold text-gray-800 mb-2">
                Account Details
              </h2>
              <ul className="space-y-2 text-xs text-gray-700">
                {PAYMENT_ACCOUNT_DETAILS.map(({ label, value, key }) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-medium text-gray-800">{label}:</span>{" "}
                      <span className="text-gray-600">{value}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value, key)}
                      title={`Copy ${label}`}
                      className="p-1 rounded hover:text-blue-600 transition-colors"
                    >
                      {copiedField === key ? (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Terms & Conditions Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-xs">
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              Terms & Conditions
            </h3>
            <div className="text-xs text-gray-600 space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
              {PAYMENT_TERMS_AND_CONDITIONS.map((term, idx) => (
                <p key={idx}>
                  <strong>{idx + 1}. </strong>{term}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

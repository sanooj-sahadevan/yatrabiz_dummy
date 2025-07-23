"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import AGTable from "@/components/admin/table/AGGrid";
import { FiTrendingUp, FiNavigation } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LEDGER_TYPES,
  AIRLINE_LEDGER_COLUMNS,
  CUSTOMER_LEDGER_COLUMNS,
  SUMMARY_CARD_LABELS,
  TAB_LABELS,
  TABLE_TITLES,
} from "@/constants/ledgerConstants";
import { getLedgerEndpoint, getSummaryEndpoint } from "@/utils/ledgerUtils";
import { fetchLedgerById, fetchLedgerSummary } from "@/lib/apiClient";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import OutstandingPaymentModal from "@/components/admin/modals/OutstandingPaymentModal";

const SummaryCard = ({ label, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const LedgerDashboard = () => {
  const [activeTab, setActiveTab] = useState(LEDGER_TYPES.AIRLINE);
  const [customerLedgers, setCustomerLedgers] = useState([]);
  const [airlineLedgers, setAirlineLedgers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    airline: "",
    customer: "",
    pnr: "",
    startDate: "",
    endDate: "",
  });
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payModalPNR, setPayModalPNR] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payTxnId, setPayTxnId] = useState("");
  const [pendingPay, setPendingPay] = useState(false);

  const router = useRouter();

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const endpoint = getLedgerEndpoint(activeTab, filters);
      const data = await fetchLedgerById(endpoint);
      if (data.success) {
        if (activeTab === LEDGER_TYPES.CUSTOMER) {
          setCustomerLedgers(
            Array.isArray(data.data) ? data.data : data.data ? [data.data] : []
          );
        } else if (activeTab === LEDGER_TYPES.AIRLINE) {
          setAirlineLedgers(
            Array.isArray(data.data) ? data.data : data.data ? [data.data] : []
          );
        }
      }
    } catch (error) {
      console.error("Error fetching ledgers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const endpoint = getSummaryEndpoint(activeTab, filters);
      const data = await fetchLedgerSummary(endpoint);
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchLedgers();
    fetchSummary();
  }, [activeTab, filters]);

  const getSummaryValue = (key) => {
    return summary.overallSummary?.[key] || 0;
  };

  const getSummaryLabel = (key) => {
    if (activeTab === LEDGER_TYPES.CUSTOMER) {
      return key === "totalPayment"
        ? SUMMARY_CARD_LABELS.TOTAL_REVENUE
        : SUMMARY_CARD_LABELS.DUE_AMOUNT;
    }
  };

  const getCustomerSummary = () => {
    if (!customerLedgers || customerLedgers.length === 0) {
      return {
        totalEntries: 0,
        totalPayment: 0,
        totalDue: 0,
        credited: 0,
      };
    }
    return customerLedgers.reduce(
      (acc, ledger) => {
        acc.totalEntries += 1;
        acc.totalPayment += ledger.totalPayment || 0;
        acc.totalDue += ledger.due || 0;
        acc.credited += ledger.credit || 0;
        return acc;
      },
      {
        totalEntries: 0,
        totalPayment: 0,
        totalDue: 0,
        credited: 0,
      }
    );
  };

  const getAirlineSummary = () => {
    if (!airlineLedgers || airlineLedgers.length === 0) {
      return {
        totalEntries: 0,
        totalPayment: 0,
        advance: 0,
        outstanding: 0,
        outstandingDate: "",
        activeEntries: 0,
        customerPaidAmount: 0,
        customerOutstanding: 0,
      };
    }
    return airlineLedgers.reduce(
      (acc, ledger) => {
        acc.totalEntries += 1;
        acc.totalPayment += ledger.totalPayment || 0;
        acc.advance += ledger.advance || 0;
        acc.outstanding += ledger.outstanding || 0;
        acc.customerPaidAmount += ledger.customerPaidAmount || 0;
        acc.customerOutstanding += ledger.customerOutstanding || 0;
        if ((ledger.outstanding || 0) > 0) acc.activeEntries += 1;
        if (
          ledger.outstandingDate &&
          (!acc.outstandingDate ||
            new Date(ledger.outstandingDate) > new Date(acc.outstandingDate))
        ) {
          acc.outstandingDate = ledger.outstandingDate;
        }
        return acc;
      },
      {
        totalEntries: 0,
        totalPayment: 0,
        advance: 0,
        outstanding: 0,
        outstandingDate: "",
        activeEntries: 0,
        customerPaidAmount: 0,
        customerOutstanding: 0,
      }
    );
  };

  const handlePnrClick = (bookingId) => {
    router.push(`/admin/ledger/${bookingId}`);
  };

  // Add this function for Outstanding click
  const handleOutstandingClick = (airlineId) => {
    router.push(`/admin/ledger/outstanding/${airlineId}`);
  };

  // Pay modal submit handler
  const handlePaySubmit = async () => {
    if (!payModalPNR) return;
    setPendingPay(true);
    try {
      const res = await fetch(
        `/api/v1/tickets/${payModalPNR}/pay-outstanding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountPaid: Number(payAmount),
            date: payDate,
            transactionId: payTxnId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Update the UI value in place
        setAirlineLedgers((prev) =>
          prev.map((row) =>
            row.PNR === payModalPNR
              ? {
                  ...row,
                  outstanding: (row.outstanding || 0) - Number(payAmount),
                }
              : row
          )
        );
        setPayModalOpen(false);
        setPayAmount("");
        setPayDate("");
        setPayTxnId("");
        setPayModalPNR(null);
      }
    } finally {
      setPendingPay(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === LEDGER_TYPES.AIRLINE ? (
          <>
            {/* <SummaryCard
              label={SUMMARY_CARD_LABELS.TOTAL_ENTRIES}
              value={getAirlineSummary().totalEntries}
              icon={<FiNavigation className="h-5 w-5" />}
            />
            <SummaryCard
              label={SUMMARY_CARD_LABELS.TOTAL_PAYMENT}
              value={formatLedgerCurrency(getAirlineSummary().totalPayment)}
              icon={<FaRupeeSign className="h-5 w-5" />}
            />
            <SummaryCard
              label={SUMMARY_CARD_LABELS.OUTSTANDING}
              value={formatLedgerCurrency(getAirlineSummary().outstanding)}
              icon={<FiTrendingUp className="h-5 w-5" />}
            />
            <SummaryCard
              label={SUMMARY_CARD_LABELS.PROFIT}
              value={formatLedgerCurrency(
                getAirlineSummary().customerPaidAmount -
                  getAirlineSummary().totalPayment
              )}
              icon={<FaRupeeSign className="h-5 w-5" />}
            /> */}
          </>
        ) : (
          <>
            {/* <SummaryCard
              label={SUMMARY_CARD_LABELS.TOTAL_ENTRIES}
              value={getCustomerSummary().totalEntries}
              icon={<FiNavigation className="h-5 w-5" />}
            />
            <SummaryCard
              label={SUMMARY_CARD_LABELS.TOTAL_REVENUE}
              value={formatLedgerCurrency(getCustomerSummary().totalPayment)}
              icon={<FaRupeeSign className="h-5 w-5" />}
            />
            <SummaryCard
              label={SUMMARY_CARD_LABELS.DUE_AMOUNT}
              value={formatLedgerCurrency(getCustomerSummary().totalDue)}
              icon={<FiTrendingUp className="h-5 w-5" />}
            />
            <SummaryCard
              label="Credited"
              value={formatLedgerCurrency(getCustomerSummary().credited)}
              icon={<FaRupeeSign className="h-5 w-5" />}
            /> */}
          </>
        )}
      </div>

      {/* Ledger Table with Improved Tabs */}
      <div className="mt-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-4">
            <TabsTrigger value={LEDGER_TYPES.AIRLINE}>
              {TAB_LABELS.AIRLINE}
            </TabsTrigger>
            <TabsTrigger value={LEDGER_TYPES.CUSTOMER}>
              {TAB_LABELS.CUSTOMER}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value={LEDGER_TYPES.AIRLINE}>
              <Card className="border rounded-lg shadow-sm">
                <CardContent className="p-0">
                  <AGTable
                    data={airlineLedgers}
                    columns={AIRLINE_LEDGER_COLUMNS.map((col) =>
                      col.label === "PNR"
                        ? {
                            ...col,
                            cellRenderer: ({ value, data }) => (
                              <span
                                className="text-gray-900 underline cursor-pointer"
                                onClick={() => handlePnrClick(data.ticketId)}
                              >
                                {value}
                              </span>
                            ),
                          }
                        : col.label === "Outstanding"
                        ? {
                            ...col,
                            cellRenderer: ({ value, data }) => (
                              <span className="flex items-center gap-2">
                                <span
                                  className=" underline cursor-pointer"
                                  onClick={() =>
                                    handleOutstandingClick(data.PNR)
                                  }
                                >
                                  {value}
                                </span>
                                <button
                                  className="ml-1 text-black hover:text-gray-800"
                                  title="Pay"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayModalPNR(data.PNR);
                                    setPayModalOpen(true);
                                  }}
                                >
                                  {/* Payment icon: credit card */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                  >
                                    <rect
                                      x="2"
                                      y="6"
                                      width="20"
                                      height="12"
                                      rx="2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    />
                                    <path
                                      d="M2 10h20"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    />
                                    <circle
                                      cx="7"
                                      cy="16"
                                      r="1"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="9"
                                      y="15"
                                      width="6"
                                      height="2"
                                      rx="1"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ),
                          }
                        : col
                    )}
                    title={TABLE_TITLES.AIRLINE_LEDGER}
                    loading={loading}
                    tableContext="ledger"
                    adminRole={{ role: "admin" }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={LEDGER_TYPES.CUSTOMER}>
              <Card className="border rounded-lg shadow-sm">
                <CardContent className="p-0">
                  <AGTable
                    data={customerLedgers}
                    columns={CUSTOMER_LEDGER_COLUMNS}
                    title={TABLE_TITLES.CUSTOMER_LEDGER}
                    loading={loading}
                    tableContext="ledger"
                    adminRole={{ role: "admin" }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <OutstandingPaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSubmit={handlePaySubmit}
        loading={pendingPay}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payDate={payDate}
        setPayDate={setPayDate}
        payTxnId={payTxnId}
        setPayTxnId={setPayTxnId}
      />
    </div>
  );
};

export default LedgerDashboard;

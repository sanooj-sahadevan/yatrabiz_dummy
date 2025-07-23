"use client";
import React, { useEffect, useState, useMemo } from "react";
import AGTable from "@/components/admin/table/AGGrid";
import Link from "next/link";
import { OUTSTANDING_PAYMENTS_COLUMNS } from "@/constants/ledgerConstants";

async function getOutstandingDetails(id) {
  const res = await fetch(`/api/ledger/outstanding/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default function OutstandingDetailsPage({ params }) {
  const actualParams = React.use(params);
  const id = actualParams.id;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOutstandingDetails(id).then((data) => {
      setTicket(data);
      setLoading(false);
    });
  }, [id]);

  const outstandingPaymentsWithBalance = useMemo(() => {
    if (!ticket?.outstandingPayments) return [];
    const payments = ticket.outstandingPayments;
    const originalOutstanding =
      ticket.originalOutstanding !== undefined
        ? ticket.originalOutstanding
        : (ticket.outstanding || 0) +
          payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    let runningOutstanding = originalOutstanding;
    let runningTotalPaid = 0;
    return payments.map((p) => {
      runningOutstanding -= p.amountPaid || 0;
      runningTotalPaid += p.amountPaid || 0;
      return {
        ...p,
        balanceAmount: runningOutstanding,
        totalPaidSoFar: runningTotalPaid,
      };
    });
  }, [ticket]);

  return (
    <div className="p-6 min-h-screen">
      <Link href="/admin/ledger" className="inline-block mb-4">
        <span className="mr-2" style={{ fontSize: "1.2em", lineHeight: 1 }}>
          &larr;
        </span>
        Back
      </Link>
      {loading ? (
        <div>Loading...</div>
      ) : ticket ? (
        <>
          <AGTable
            data={outstandingPaymentsWithBalance}
            columns={OUTSTANDING_PAYMENTS_COLUMNS}
            title="Outstanding Payments"
            tableContext="outstanding-payments"
            adminRole={{ role: "admin" }}
            loading={loading}
          />
        </>
      ) : (
        <div>Ticket not found.</div>
      )}
    </div>
  );
}

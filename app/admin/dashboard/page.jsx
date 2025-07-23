"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchMonthlyBookings,
  fetchTopDestinations,
  fetchTopSources,
  fetchTopCustomers,
  fetchLedgerSummary,
  fetchAirlineMarketShare
} from "@/lib/apiClient";
const TopSourcesChart = dynamic(
  () => import("@/components/charts/TopSourcesChart"),
  { ssr: false }
);
const TopCustomersChart = dynamic(
  () => import("@/components/charts/TopCustomersChart"),
  { ssr: false }
);
const MonthlyBookingsChart = dynamic(
  () => import("@/components/charts/MonthlyBookingsChart"),
  { ssr: false }
);
const TopDestinationsChart = dynamic(
  () => import("@/components/charts/TopDestinationsChart"),
  { ssr: false }
);
const AirlineMarketShareChart = dynamic(
  () => import("@/components/charts/AirlineMarketShareChart"),
  { ssr: false }
);
const CompoundBarChart = dynamic(
  () => import("@/components/charts/CompoundBarChart"),
  { ssr: false }
);

export default function Dashboard() {
  const [monthlyBookingsData, setMonthlyBookingsData] = useState([]);
  const [airlineMarketShare, setAirlineMarketShare] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [topSources, setTopSources] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMonthlyBookings();
        setMonthlyBookingsData(data.data || data);
      } catch (error) {
        console.error("Error fetching monthly bookings data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTopData = async () => {
      try {
        const destinations = await fetchTopDestinations();
        setTopDestinations(destinations.data || destinations);
        const sources = await fetchTopSources();
        setTopSources(sources.data || sources);
        const customers = await fetchTopCustomers();
        setTopCustomers(customers.data || customers);
        const ledger = await fetchLedgerSummary();
        if (Array.isArray(ledger)) {
          setLedgerSummary(ledger);
        } else if (ledger && ledger.success && Array.isArray(ledger.data)) {
          setLedgerSummary(ledger.data);
        } else {
          setLedgerSummary([]);
        }
      } catch (error) {
        setLedgerSummary([]);
        console.error("Error fetching dashboard analytics:", error);
      }
    };
    fetchTopData();
  }, []);

  useEffect(() => {
    const fetchMarketShare = async () => {
      try {
        const data = await fetchAirlineMarketShare();
        setAirlineMarketShare(data);
      } catch (error) {
        setAirlineMarketShare([]);
        console.error("Error fetching airline market share:", error);
      }
    };
    fetchMarketShare();
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col space-y-4 p-2">
      <div className="flex-1 grid grid-rows-2 gap-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Monthly Confirmed Bookings (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <MonthlyBookingsChart data={monthlyBookingsData} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Airline Market Share (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <AirlineMarketShareChart data={airlineMarketShare} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Top Flight Destinations (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <TopDestinationsChart data={topDestinations} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Agets Credit vs Due (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <CompoundBarChart data={ledgerSummary} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Top Agents (2025)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <TopCustomersChart data={topCustomers} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">
              Top Flight Sources (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <TopSourcesChart data={topSources} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

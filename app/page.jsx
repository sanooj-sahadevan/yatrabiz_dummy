"use client";
import React, { Suspense, useState, useEffect } from "react";
import HeroSection from "@/components/heroSection/herosection";
import Header from "@/components/user/header";
import Footer from "@/components/user/footer";
import RedirectNotifier from "@/components/common/RedirectNotifier";
import Carousel from "@/components/common/Carousel";
import InfoColumns from "@/components/common/InfoColumns";
import OtherOfferingsCard from "@/components/common/OtherOfferingsCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SpecialOffers from "@/components/common/SpecialOffers";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isInitializing } = useAuth();

  return (
    <main className="w-full min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner message="Loading homepage..." />}>
        <RedirectNotifier />
      </Suspense>

      <Header />

      <section className="bg-background px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <HeroSection />
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto bg-background-alt shadow-lg px-4 md:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-background mb-4">
            Discover, Sell, and Manage Airline Tickets Effortlessly.
          </h1>
        </div>

        <div className="mb-12">
          <Carousel />
        </div>

        {!isInitializing && user && (
          <div className="mb-12">
            <SpecialOffers hideIfNoOffers={true} />
          </div>
        )}

        <div className="mb-12">
          <OtherOfferingsCard />
        </div>

        <div className="mb-0">
          <InfoColumns />
        </div>
      </div>

      <div className="">
        <Footer />
      </div>
    </main>
  );
}

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import PropTypes from "prop-types";
import {
  SWIPER_IMAGES,
  SPECIAL_OFFERS_TEXT,
} from "@/constants/specialOffersConstants";

export default function SpecialOffers({ hideIfNoOffers = false }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDiscountTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/tickets");
        const result = await res.json();
        if (!res.ok)
          throw new Error(result.message || "Failed to fetch tickets");

        const discountTickets = (result.data || []).filter(
          (t) => Number(t.Discount) > 0
        );
        setOffers(discountTickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountTickets();
  }, []);

  if (!loading && !error && offers.length === 0 && hideIfNoOffers) {
    return null;
  }

  return (
    <section className="bg-white shadow-xl py-8 px-4 w-full max-w-screen-xl  rounded-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-deep-blue -mt-4 mb-4">
          {SPECIAL_OFFERS_TEXT.heading}
        </h2>
        <p className="text-base -mt-2 text-gray-600">
          {SPECIAL_OFFERS_TEXT.subheading}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">{SPECIAL_OFFERS_TEXT.loading}</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-red-600 text-lg mb-2">
            {SPECIAL_OFFERS_TEXT.errorIcon}
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-4xl mb-4">
            {SPECIAL_OFFERS_TEXT.noOffersIcon}
          </div>
          <p className="text-gray-500 text-lg">
            {SPECIAL_OFFERS_TEXT.noOffers}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {SPECIAL_OFFERS_TEXT.noOffersSub}
          </p>
        </div>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={8}
            slidesPerView={1}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
              bulletClass: "swiper-pagination-bullet",
              bulletActiveClass: "swiper-pagination-bullet-active",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 8,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 12,
              },
            }}
            className="special-offers-swiper"
          >
            {offers.map((offer, index) => {
              const original = Number(offer.salePrice);
              const discounted = Number(offer.Discount);
              const discountAmount = original - discounted;
              const discountPercent = original
                ? Math.round((discountAmount / original) * 100)
                : 0;

              const imageIndex = index % SWIPER_IMAGES.length;
              const offerImage = SWIPER_IMAGES[imageIndex];

              return (
                <SwiperSlide key={offer._id}>
                  <div
                    className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 h-[240px] flex flex-col md:flex-row overflow-hidden group rounded-xl cursor-pointer"
                    onClick={() => router.push(`/tickets/${offer._id}`)}
                  >
                    {/* Left Side - Image */}
                    <div className="relative w-full md:w-2/5 flex items-center justify-center bg-blue-100 overflow-hidden">
                      <Image
                        src={offerImage}
                        alt="Flight ticket"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                      <div className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 shadow-lg z-20 bg-red-500 rounded">
                        Save {discountPercent}%
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full md:w-3/5 p-4 flex flex-col justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-1 truncate">
                          {offer.airline?.name ||
                            SPECIAL_OFFERS_TEXT.defaultAirline}
                        </h3>
                        <div className="flex items-center text-gray-700 text-sm mb-2">
                          <span className="font-medium">
                            {offer.departureLocation?.code}
                          </span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-medium">
                            {offer.arrivalLocation?.code}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            Flight: {offer.flightNumber} | {offer.classType}
                          </p>
                          <p>Journey: {offer.journeyType}</p>
                          <p>Date: {offer.dateOfJourney?.slice(0, 10)}</p>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
                            {SPECIAL_OFFERS_TEXT.limitedTime}
                          </span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className=" border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-gray-400 line-through text-sm">
                                ₹{original}
                              </span>
                              <span className="text-green-700 font-bold text-lg">
                                ₹{discounted}
                                <span className="text-gray-500 text-xs font-normal ml-1">
                                  {SPECIAL_OFFERS_TEXT.perTicket}
                                </span>
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {SPECIAL_OFFERS_TEXT.youSave} ₹{discountAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Pagination */}
          <div className="swiper-pagination -mb-4 !bottom-4 !left-1/2 !-translate-x-1/2"></div>
        </div>
      )}

      <style jsx global>{`
        .special-offers-swiper {
          padding-bottom: 40px;
        }

        .swiper-pagination-bullet {
          width: 8px !important;
          height: 8px !important;
          background: #d1d5db !important;
          opacity: 1 !important;
          margin: 0 4px !important;
        }

        .swiper-pagination-bullet-active {
          background: #1e3a8a !important;
          transform: scale(1.2) !important;
        }

        .swiper-button-prev::after,
        .swiper-button-next::after {
          display: none !important;
        }

        .swiper-slide {
          height: auto !important;
        }
      `}</style>
    </section>
  );
}

SpecialOffers.propTypes = {
  hideIfNoOffers: PropTypes.bool,
};

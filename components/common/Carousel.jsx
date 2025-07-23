import React, { useState, useEffect, useRef } from "react";
import { CAROUSEL } from "@/constants/homePageContent";
import Image from "next/image";

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const total = CAROUSEL.slides.length;
  const intervalRef = useRef();

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [total]);

  // Dot click handler
  const goToSlide = (idx) => setCurrent(idx);

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex w-full h-48 md:h-64 bg-white rounded-lg overflow-hidden shadow relative">
        {/* Left: Image with custom right curve */}
        <div className="w-2/5 h-full flex-shrink-0 overflow-hidden rounded-tr-[110px] rounded-br-[110px]">
          <div className="relative w-full h-full">
            <Image
              src={CAROUSEL.slides[current].image}
              alt="carousel slide"
              fill
              className="object-cover w-full h-full"
              priority
              unoptimized={CAROUSEL.slides[current].image.startsWith("http")}
            />
          </div>
        </div>
        {/* Right: Phrase with background color */}
        <div
          className="w-3/5 flex items-center justify-center px-6 text-lg md:text-2xl font-semibold"
          style={{ color: "#0A2239" }}
        >
          {CAROUSEL.slides[current].phrase}
        </div>
      </div>
      {/* Pills below carousel */}
      <div className="flex justify-center gap-2">
        {CAROUSEL.slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1 w-4 md:w-6 rounded-full transition-colors duration-200 border outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-[0_2px_8px_rgba(10,34,57,0.08)] ${
              idx === current
                ? "border-2 border-background"
                : "border border-background"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

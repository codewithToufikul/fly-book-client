import React from "react";

const MarketLoader = ({ label = "FlyMarket loading..." }) => {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Logo-style wing loader */}
      <div className="relative">
        <svg
          className="w-12 h-12 text-teal-700 animate-fly"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* left wing/book page */}
          <path
            d="M8 26c8-8 20-8 28 0v22c-8-8-20-8-28 0V26z"
            className="fill-teal-700/90"
          />
          {/* right wing/book page */}
          <path
            d="M56 26c-8-8-20-8-28 0v22c8-8 20-8 28 0V26z"
            className="fill-teal-600"
          />
          {/* center notch */}
          <path d="M32 30l2 4-2 4-2-4 2-4z" className="fill-teal-800" />
        </svg>
        {/* blur shadow flap effect */}
        <div className="absolute inset-0 -z-10 blur-sm bg-teal-500/0 animate-flap" />
      </div>

      {/* shimmer text */}
      <div className="min-w-[160px] text-sm font-medium text-gray-700 dark:text-gray-200">
        <div className="relative overflow-hidden rounded-full bg-teal-50 dark:bg-teal-900/20">
          <div className="px-4 py-1.5">{label}</div>
          <span className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
        </div>
      </div>
    </div>
  );
};

export default MarketLoader;

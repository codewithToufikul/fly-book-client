import React, { useState, useEffect } from "react";
import { Coins, Info } from "lucide-react";

const COIN_TO_TAKA_RATE = 100; // 100 coins = 1 Taka

const CoinPayment = ({ userCoins = 0, orderTotal = 0, maxCoinsAllowed, onCoinsChange }) => {
    const [coinsUsed, setCoinsUsed] = useState(0);

    // Calculate values
    // If maxCoinsAllowed is provided, use it. Otherwise, fallback to full order total.
    const effectiveLimit = maxCoinsAllowed !== undefined ? maxCoinsAllowed : (orderTotal * COIN_TO_TAKA_RATE);
    const maxCoinsUsable = Math.min(userCoins, effectiveLimit);
    const coinsInTaka = coinsUsed / COIN_TO_TAKA_RATE;
    const remainingAmount = orderTotal - coinsInTaka;
    const isFullyCoinPaid = remainingAmount === 0;

    // Notify parent component of coin changes
    useEffect(() => {
        if (onCoinsChange) {
            onCoinsChange(coinsUsed);
        }
    }, [coinsUsed, onCoinsChange]);

    // Handle slider change
    const handleSliderChange = (e) => {
        const value = Number(e.target.value);
        // Round to nearest 100
        const rounded = Math.round(value / 100) * 100;
        setCoinsUsed(rounded);
    };

    // Handle manual input
    const handleInputChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= maxCoinsUsable) {
            const rounded = Math.round(value / 100) * 100;
            setCoinsUsed(rounded);
        }
    };


    return (
        <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.535 5.01c.227.596.816 1.006 1.535 1.006.719 0 1.308-.41 1.535-1.006.009-.024.03-.046.06-.046.063 0 .1.047.1.1 0 .016-.002.031-.005.047-.32 1.258-1.558 2.103-2.903 2.103-1.345 0-2.583-.845-2.903-2.103-.003-.016-.005-.031-.005-.047 0-.053.037-.1.1-.1.03 0 .05.022.06.046z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Use FlyWallet Coins</h3>
                    <p className="text-sm text-gray-500 italic">Pay part of your order with coins</p>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Balance</span>
                    <span className="text-lg font-black text-teal-700">🪙 {userCoins?.toLocaleString()}</span>
                </div>
                <div className="bg-teal-50 rounded-xl p-3 border border-teal-100 relative group">
                    <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">Usage Limit</span>
                    <span className="text-lg font-black text-teal-900">🪙 {effectiveLimit?.toLocaleString()}</span>

                    {/* Tooltip Info */}
                    <div className="absolute top-1 right-1 cursor-help">
                        <svg className="w-3 h-3 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            The limit is calculated based on each product's individual coin percentage set by the seller.
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Section */}
            <div className="space-y-6">
                <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">Adjust Amount</span>
                        <span className="text-sm font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            Save ৳{coinsInTaka?.toLocaleString()}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={maxCoinsUsable}
                        step="100"
                        value={coinsUsed}
                        onChange={(e) => handleSliderChange(e)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                        <span>0</span>
                        <span>{maxCoinsUsable?.toLocaleString()} (Max)</span>
                    </div>
                </div>

                {/* Direct Input */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="number"
                            min="0"
                            max={maxCoinsUsable}
                            step="100"
                            value={coinsUsed}
                            onChange={(e) => handleInputChange(e)}
                            placeholder="Enter coins"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all font-bold text-gray-800"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🪙</span>
                    </div>
                    <button
                        onClick={() => setCoinsUsed(maxCoinsUsable)}
                        className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-600/20 active:scale-95 text-sm whitespace-nowrap"
                    >
                        Use Max
                    </button>
                </div>
            </div>

            {/* Small Helper Text */}
            <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
                * Coins are used in multiples of 100. <br />
                (100 Coins = ৳1.00)
            </p>
        </div>
    );
};

export default CoinPayment;

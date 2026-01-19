import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useCart from "../Hooks/useCart";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import useUser from "../../../Hooks/useUser";
import CoinPayment from "../../../Components/CoinPayment/CoinPayment";

const COIN_TO_TAKA_RATE = 100;

const BuyNowPage = () => {
  const { cartItems, getTotal } = useCart();
  const axiosPublic = usePublicAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, refetch } = useUser();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [orderSource, setOrderSource] = useState("cart");

  // Coin payment states
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Delivery charge per product (not per vendor)
  const DELIVERY_CHARGE_PER_PRODUCT = 50;

  // Initialize order items based on navigation state or cart
  useEffect(() => {
    const { buyNowItem, source } = location.state || {};

    if (buyNowItem && source === "product-details") {
      setOrderItems([buyNowItem]);
      setOrderSource("buy-now");
    } else {
      setOrderItems(cartItems);
      setOrderSource("cart");
    }
  }, [location.state, cartItems]);

  useEffect(() => {
    if (user?.id) {
      axiosPublic
        .get(`/addresses/${user.id}`)
        .then((res) => {
          if (res.data.success) {
            setAddresses(res.data.addresses);
            if (res.data.addresses.length > 0) {
              const defaultAddr =
                res.data.addresses.find((a) => a.isDefault) ||
                res.data.addresses[0];
              setSelectedAddressId(defaultAddr._id);
              setShippingInfo({
                fullName: user.name,
                email: user.email,
                phone: defaultAddr.phone,
                street: defaultAddr.fullAddress,
                city: "",
                postalCode: "",
                country: "Bangladesh",
              });
            }
          }
        })
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [user]);

  // Calculate order totals - per product delivery charge
  const getOrderCalculations = () => {
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const totalProducts = orderItems.length; // Count unique products, not quantity
    const deliveryCharges = totalProducts * DELIVERY_CHARGE_PER_PRODUCT;
    const total = subtotal + deliveryCharges;

    // Calculate max coins allowed based on each product's percentage
    const maxCoinsAllowed = orderItems.reduce((acc, item) => {
      const percentage = item.coinUsagePercentage || 30; // default 30%
      const itemMaxTaka = (item.price * item.quantity) * (percentage / 100);
      return acc + (itemMaxTaka * COIN_TO_TAKA_RATE);
    }, 0);

    return {
      subtotal,
      deliveryCharges,
      total,
      totalProducts,
      maxCoinsAllowed: Math.floor(maxCoinsAllowed)
    };
  };

  const { subtotal, deliveryCharges, total, totalProducts, maxCoinsAllowed } =
    getOrderCalculations();

  if (loading || isLoadingAddresses) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MNavbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading...
            </h2>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MNavbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Items to Purchase
            </h2>
            <p className="text-gray-600 mb-4">
              Your{" "}
              {orderSource === "cart" ? "cart is empty" : "selection is empty"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    try {
      if (orderItems.length === 0) {
        toast.error("No items to purchase!");
        return;
      }

      if (!selectedAddressId) {
        const requiredFields = ["fullName", "email", "phone", "street"];
        for (let field of requiredFields) {
          if (!shippingInfo[field].trim()) {
            toast.error(
              `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
            );
            return;
          }
        }
      }

      // Calculate remaining amount after coins
      const coinsInTaka = coinsUsed / 100;
      const remainingAmount = total - coinsInTaka;

      // Validate payment method selection if there's remaining amount
      if (remainingAmount > 0 && !paymentMethod) {
        toast.error("Please select a payment method for the remaining amount!");
        return;
      }

      const orderData = {
        items: orderItems.map((item) => ({
          ...item,
          itemOrderStatus: "pending",
        })),
        shippingInfo,
        subtotal,
        deliveryCharges,
        totalAmount: total,
        totalProducts,
        deliveryChargePerProduct: DELIVERY_CHARGE_PER_PRODUCT,
        orderSource: orderSource,
        coinsUsed: coinsUsed,  // NEW: Coins to use
        paymentMethod: remainingAmount > 0 ? paymentMethod : "FlyWallet",  // NEW: Payment method
      };

      const token = localStorage.getItem("token");
      const res = await axiosPublic.post("/orders/create", orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        const { paymentBreakdown, coinsDeducted } = res.data;

        if (coinsDeducted > 0) {
          toast.success(
            `Order placed! ${coinsDeducted} coins used (৳${(coinsDeducted / 100).toFixed(2)})`,
            { duration: 4000 }
          );
        } else {
          toast.success("Order placed successfully!");
        }

        if (orderSource === "cart") {
          // clearCart(); // Uncomment if you have this function
        }

        // If fully paid with coins, go to orders page
        // Otherwise go to payment page
        if (paymentBreakdown?.paymentMethod === "FullCoins") {
          setTimeout(() => {
            navigate("/market-user");
          }, 2000);
        } else {
          navigate(`/payment/${res.data.orderId}`);
        }
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MNavbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-teal-700">Checkout</h1>
          <div className="text-sm text-gray-600">
            {orderSource === "buy-now"
              ? "Buy Now"
              : `Cart (${orderItems.length} items)`}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            {/* Items List - No vendor grouping */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orderItems.map((item, index) => (
                <div
                  key={`${item._id}-${index}`}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <img
                    src={item.images?.[0] || "/placeholder-image.jpg"}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">
                      Qty: {item.quantity} × ৳{item.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100 font-medium">
                        Coin Limit: {item.coinUsagePercentage || 30}%
                      </span>
                      <p className="text-xs text-gray-400">
                        Delivery: ৳{DELIVERY_CHARGE_PER_PRODUCT}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ৳{(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <hr className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  Delivery ({totalProducts} product
                  {totalProducts > 1 ? "s" : ""}):
                </span>
                <span className="text-orange-600">
                  ৳{deliveryCharges.toLocaleString()}
                </span>
              </div>
              {totalProducts > 1 && (
                <div className="text-xs text-gray-500 pl-4">
                  ৳{DELIVERY_CHARGE_PER_PRODUCT} × {totalProducts} products
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span className="text-teal-700">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Final Payment Breakdown Card */}
            <div className="mt-8 bg-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl"></div>

              <h3 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Payment Summary
              </h3>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center opacity-80">
                  <span>Order Grand Total:</span>
                  <span className="font-semibold">৳{total.toLocaleString()}</span>
                </div>

                {coinsUsed > 0 && (
                  <div className="flex justify-between items-center text-teal-300">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.535 5.01c.227.596.816 1.006 1.535 1.006.719 0 1.308-.41 1.535-1.006.009-.024.03-.046.06-.046.063 0 .1.047.1.1 0 .016-.002.031-.005.047-.32 1.258-1.558 2.103-2.903 2.103-1.345 0-2.583-.845-2.903-2.103-.003-.016-.005-.031-.005-.047 0-.053.037-.1.1-.1.03 0 .05.022.06.046z" />
                      </svg>
                      FlyWallet Coins Use:
                    </span>
                    <span className="font-bold">- ৳{(coinsUsed / 100).toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm opacity-80">Total Pay via {coinsUsed > 0 && (total - coinsUsed / 100) > 0 ? (paymentMethod === "COD" ? "Cash" : "Online") : (coinsUsed > 0 && (total - coinsUsed / 100) === 0 ? "FlyWallet" : "Cash")}:</span>
                      <span className="text-2xl font-black tracking-tighter">AMOUT TO PAY</span>
                    </div>
                    <span className="text-4xl font-black bg-white text-teal-900 px-4 py-2 rounded-xl shadow-lg ring-4 ring-teal-400/30">
                      ৳{(total - (coinsUsed / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Source Info */}
            {orderSource === "buy-now" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Quick Purchase:</span> This
                  order is for immediate checkout.
                </p>
              </div>
            )}

            {/* Delivery Info */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">📦 Delivery Info:</span> Each
                product has a ৳{DELIVERY_CHARGE_PER_PRODUCT} delivery charge.
              </p>
            </div>
          </div>

          {/* Coin Payment Section */}
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <CoinPayment
              userCoins={user?.flyWallet || 0}
              orderTotal={total}
              maxCoinsAllowed={maxCoinsAllowed}
              onCoinsChange={setCoinsUsed}
            />
          </div>

          {/* Payment Method Selection (if remaining amount > 0) */}
          {coinsUsed > 0 && (total - coinsUsed / 100) > 0 && (
            <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Method for Remaining ৳{(total - coinsUsed / 100).toFixed(2)}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{ borderColor: paymentMethod === "COD" ? "#14b8a6" : "#e5e7eb" }}>
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-teal-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{ borderColor: paymentMethod === "Online" ? "#14b8a6" : "#e5e7eb" }}>
                  <input
                    type="radio"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-teal-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Online Payment</p>
                    <p className="text-sm text-gray-600">bKash, Nagad, Rocket</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Shipping Info / Address Selection */}
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              Shipping Information
            </h2>

            {addresses.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-3">
                  Select a saved address or enter new details below:
                </p>

                {/* Saved Addresses */}
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id
                      ? "border-teal-700 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => {
                      setSelectedAddressId(addr._id);
                      setShippingInfo({
                        fullName: user.name,
                        email: user.email,
                        phone: addr.phone,
                        street: addr.fullAddress,
                        city: "",
                        postalCode: "",
                        country: "Bangladesh",
                      });
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {addr.type}
                        </p>
                        <p className="text-gray-600 mt-1">{addr.fullAddress}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-xs text-teal-700 font-medium bg-teal-100 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Option to use new address */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setSelectedAddressId(null)}
                    className={`w-full p-3 border rounded-lg text-left transition-colors ${!selectedAddressId
                      ? "border-teal-700 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span className="font-medium text-gray-900">
                      Use different address
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter new shipping details
                    </p>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Manual Address Input */}
            {(addresses.length === 0 || !selectedAddressId) && (
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <textarea
                  name="street"
                  placeholder="Full Address (House/Flat, Road, Area)"
                  value={shippingInfo.street}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={shippingInfo.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition-colors font-semibold"
              >
                Confirm & Proceed to Payment (৳{total.toLocaleString()})
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back to {orderSource === "buy-now" ? "Product" : "Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <MFooter />
    </div >
  );
};

export default BuyNowPage;

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useCart from "../Hooks/useCart";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import useUser from "../../../Hooks/useUser";

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

    return {
      subtotal,
      deliveryCharges,
      total,
      totalProducts,
    };
  };

  const { subtotal, deliveryCharges, total, totalProducts } =
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

      const orderData = {
        userId: user.id,
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
        paymentStatus: "pending",
        orderSource: orderSource,
      };

      const res = await axiosPublic.post("/orders/create", orderData);

      if (res.data.success) {
        toast.success("Order placed successfully! Redirecting to payment...");

        if (orderSource === "cart") {
          // clearCart(); // Uncomment if you have this function
        }

        navigate(`/payment/${res.data.orderId}`);
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
                    <p className="text-xs text-gray-400 mt-1">
                      Delivery: ৳{DELIVERY_CHARGE_PER_PRODUCT}
                    </p>
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
                <span>Total:</span>
                <span className="text-teal-700">৳{total.toLocaleString()}</span>
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

          {/* Shipping Info / Address Selection */}
          <div className="bg-white rounded-2xl shadow p-6">
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
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === addr._id
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
                    className={`w-full p-3 border rounded-lg text-left transition-colors ${
                      !selectedAddressId
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
    </div>
  );
};

export default BuyNowPage;

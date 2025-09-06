
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import { CheckCircle, CreditCard, Smartphone, Truck, Loader } from "lucide-react";

const PaymentPage = () => {
  const { orderId } = useParams();
  const axiosPublic = usePublicAxios();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods = [
    {
      id: "Bkash",
      name: "bKash",
      icon: "📱",
      color: "from-pink-500 to-red-500",
      description: "Mobile Financial Service"
    },
    {
      id: "Rocket",
      name: "Rocket",
      icon: "🚀",
      color: "from-purple-500 to-indigo-500",
      description: "Dutch-Bangla Mobile Banking"
    },
    {
      id: "Nagad",
      name: "Nagad",
      icon: "💳",
      color: "from-orange-500 to-red-500",
      description: "Digital Financial Service"
    },
    {
      id: "COD",
      name: "Cash on Delivery",
      icon: "🚚",
      color: "from-green-500 to-teal-500",
      description: "Pay when you receive your order"
    }
  ];

  const SuccessAnimation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center transform animate-pulse">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-green-400 opacity-30 animate-ping"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h3>
        <p className="text-gray-600 mb-4">Your order has been placed successfully</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      </div>
    </div>
  );

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method!", {
        style: {
          borderRadius: '12px',
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
      return;
    }

    setIsLoading(true);

    if (selectedMethod === "COD") {
      try {
        const res = await axiosPublic.patch(`/payments/${orderId}/confirm`);
        if (res.data.success) {
          setShowSuccess(true);
          
          // Hide success animation and navigate after 3 seconds
          setTimeout(() => {
            setShowSuccess(false);
            toast.success("Order confirmed successfully!", {
              style: {
                borderRadius: '12px',
                background: '#d1fae5',
                color: '#059669',
                border: '1px solid #a7f3d0',
              },
            });
            navigate("/market-user");
          }, 3000);
        } else {
          toast.error("Failed to confirm order");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    } else {
      // Simulate loading for other payment methods
      setTimeout(() => {
        toast(`"${selectedMethod}" integration coming soon!`, { 
          icon: "🚧",
          style: {
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fed7aa',
          },
        });
        setIsLoading(false);
      }, 2000);
    }

    if (selectedMethod === "COD") {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <MNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Choose Payment Method
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select your preferred payment option to complete your order securely
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`
                relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-105
                ${selectedMethod === method.id
                  ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg shadow-teal-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {selectedMethod === method.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-teal-500" />
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`
                  w-14 h-14 rounded-xl bg-gradient-to-r ${method.color} 
                  flex items-center justify-center text-2xl shadow-lg
                `}>
                  {method.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {method.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {method.description}
                  </p>
                </div>
              </div>
              
              {/* Selection indicator */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-300
                ${selectedMethod === method.id
                  ? 'ring-2 ring-teal-500 ring-opacity-50'
                  : ''
                }
              `} />
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-teal-500" />
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                #{orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className={`font-semibold ${selectedMethod ? 'text-teal-600' : 'text-gray-400'}`}>
                {selectedMethod || 'Not selected'}
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={!selectedMethod || isLoading}
          className={`
            w-full py-4 px-8 rounded-2xl text-white font-semibold text-lg
            transition-all duration-300 transform
            ${!selectedMethod || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Confirm & Place Order</span>
            </div>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccess && <SuccessAnimation />}
      
      <MFooter />
    </div>
  );
};

export default PaymentPage;
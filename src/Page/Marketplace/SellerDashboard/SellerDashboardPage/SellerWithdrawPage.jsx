import React, { useEffect, useState } from "react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const SellerWithdrawPage = () => {
  const { user } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash");
  const [loading, setLoading] = useState(false);
  
  // Method-specific details
  const [methodDetails, setMethodDetails] = useState({
    bKash: { phoneNumber: "" },
    Nagad: { phoneNumber: "" },
    Bank: { 
      accountName: "", 
      accountNumber: "", 
      bankName: "", 
      branchName: "", 
      routingNumber: "" 
    }
  });

  useEffect(() => {
    fetchSellerData();
    fetchPayments();
    fetchWithdrawHistory();
  }, [user]);

  const fetchSellerData = async () => {
    try {
      const res = await axiosPublic.get(`/sellers/check/${user.id}`);
      if (res.data?.isSeller) setSeller(res.data.seller);
    } catch (error) {
      console.error("Error fetching seller:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axiosPublic.get("/seller-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      const res = await axiosPublic.get("/seller-withdraw-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Earnings calculation
  const totalEarnings = items
    .filter((i) => i.itemOrderStatus === "delivered" && i.paymentStatus === "confirmed")
    .reduce((acc, i) => acc + i.price * i.quantity, 0);

  const totalWithdrawn = withdrawHistory.reduce((a, h) => a + h.amount, 0);
  const withdrawable = totalEarnings - totalWithdrawn;

  // Handle method details change
  const handleMethodDetailsChange = (field, value) => {
    setMethodDetails(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  // Validate method details
  const validateMethodDetails = () => {
    const currentDetails = methodDetails[method];
    
    if (method === "bKash" || method === "Nagad") {
      if (!currentDetails.phoneNumber || currentDetails.phoneNumber.length !== 11) {
        toast.error("Please enter a valid 11-digit phone number");
        return false;
      }
    }
    
    if (method === "Bank") {
      const requiredFields = ["accountName", "accountNumber", "bankName", "branchName"];
      for (let field of requiredFields) {
        if (!currentDetails[field]) {
          toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
    }
    
    return true;
  };

  // Reset method details when method changes
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
  };

  // Withdraw Request
  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (amount <= 0 || amount > withdrawable) {
      toast.error("Invalid withdraw amount");
      return;
    }
    
    if (!validateMethodDetails()) {
      return;
    }
    
    try {
      setLoading(true);
      const withdrawData = {
        amount: Number(amount),
        method,
        methodDetails: methodDetails[method]
      };
      
      await axiosPublic.post(
        "/seller-withdraw",
        withdrawData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Withdraw request submitted!");
      setAmount("");
      // Reset method details for the current method
      setMethodDetails(prev => ({
        ...prev,
        [method]: method === "Bank" 
          ? { accountName: "", accountNumber: "", bankName: "", branchName: "", routingNumber: "" }
          : { phoneNumber: "" }
      }));
      fetchWithdrawHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  // Render method-specific form fields
  const renderMethodFields = () => {
    const currentDetails = methodDetails[method];
    
    if (method === "bKash" || method === "Nagad") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {method} Phone Number
          </label>
          <input
            type="tel"
            value={currentDetails.phoneNumber}
            onChange={(e) => handleMethodDetailsChange("phoneNumber", e.target.value)}
            placeholder="Enter 11-digit phone number"
            maxLength="11"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="text-xs text-gray-500">
            Enter the phone number registered with your {method} account
          </p>
        </div>
      );
    }
    
    if (method === "Bank") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={currentDetails.accountName}
                onChange={(e) => handleMethodDetailsChange("accountName", e.target.value)}
                placeholder="Full name as per bank account"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={currentDetails.accountNumber}
                onChange={(e) => handleMethodDetailsChange("accountNumber", e.target.value)}
                placeholder="Bank account number"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={currentDetails.bankName}
                onChange={(e) => handleMethodDetailsChange("bankName", e.target.value)}
                placeholder="e.g., Dutch Bangla Bank"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={currentDetails.branchName}
                onChange={(e) => handleMethodDetailsChange("branchName", e.target.value)}
                placeholder="Branch name/location"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Routing Number (Optional)
            </label>
            <input
              type="text"
              value={currentDetails.routingNumber}
              onChange={(e) => handleMethodDetailsChange("routingNumber", e.target.value)}
              placeholder="Bank routing number"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      );
    }
  };

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No seller profile found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Overview */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Earnings Overview</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{totalEarnings}৳</p>
            </div>
            <div>
              <p className="text-gray-500">Withdrawn</p>
              <p className="text-2xl font-bold text-red-500">{totalWithdrawn}৳</p>
            </div>
            <div>
              <p className="text-gray-500">Available</p>
              <p className="text-2xl font-bold text-teal-600">{withdrawable}৳</p>
            </div>
          </div>
        </div>

        {/* Withdraw Form */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Request Withdraw</h2>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdraw Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                max={withdrawable}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {withdrawable}৳
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Method
              </label>
              <select
                value={method}
                onChange={(e) => handleMethodChange(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            {/* Method-specific fields */}
            {renderMethodFields()}

            <button
              type="submit"
              disabled={loading || withdrawable <= 0}
              className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit Withdraw Request"}
            </button>
          </form>
        </div>

        {/* Withdraw History */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Withdraw History</h2>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.length > 0 ? (
                  withdrawHistory.map((w, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">{w.amount}৳</td>
                      <td className="p-3">{w.method}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {w.methodDetails && (
                          <div>
                            {w.method === "bKash" || w.method === "Nagad" 
                              ? w.methodDetails.phoneNumber
                              : `${w.methodDetails.bankName} - ${w.methodDetails.accountNumber}`
                            }
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            w.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : w.status === "approved"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan="5">
                      No withdraw history yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerWithdrawPage;
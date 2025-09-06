import React, { useEffect, useState } from "react";
import usePublicAxios from "../../../Hooks/usePublicAxios";

const SellerRequest = () => {
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosPublic.get("/seller-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data?.requests || []);
      } catch (error) {
        console.error("Error fetching seller requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [axiosPublic, token]);

  // handle status update (pending → approved/rejected)
  const handleStatusChange = async (id, status) => {
    try {
      await axiosPublic.patch(
        `/seller-requests/${id}`,
        { status }, // "approved" | "rejected"
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );

      // যদি modal খোলা থাকে এবং আপডেট করা row-টাই হয়, modal এর ভিতরেও status আপডেট করো
      if (selectedReq && selectedReq._id === id) {
        setSelectedReq((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      console.error("Error updating seller request", error);
    }
  };

  // modal helpers
  const openModal = (req) => {
    setSelectedReq(req);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // prevent background scroll
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReq(null);
    document.body.style.overflow = ""; // restore scroll
  };

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && isModalOpen && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  if (loading) return <p className="text-center py-6">Loading requests...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seller Requests</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Business</th>
              <th className="p-3 border">Owner</th>
              <th className="p-3 border">Contact</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-b hover:bg-gray-50">
                {/* Business */}
                <td className="p-3 border align-top">
                  <p className="font-semibold">{req.businessName}</p>
                  <p className="text-sm text-gray-500">{req.businessType}</p>
                  {req.websiteUrl && (
                    <a
                      href={req.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-teal-600 hover:underline"
                    >
                      {req.websiteUrl}
                    </a>
                  )}
                </td>

                {/* Owner */}
                <td className="p-3 border align-top">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.userInfo?.profileImage}
                      alt={req.userInfo?.name || "Profile"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{req.userInfo?.name}</p>
                      <p className="text-sm text-gray-500">
                        {req.userInfo?.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="p-3 border align-top">
                  <p>{req.businessAddress}</p>
                  <p className="text-sm text-gray-600">
                    {req.userInfo?.phone}
                  </p>
                </td>

                {/* Status */}
                <td className="p-3 border align-top">
                  <span
                    className={`px-3 py-1 rounded-full text-sm capitalize ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3 border align-top">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => openModal(req)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      View Details
                    </button>

                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(req._id, "approved")
                          }
                          className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(req._id, "rejected")
                          }
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          handleStatusChange(req._id, "pending")
                        }
                        className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                      >
                        Mark Pending
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  No seller requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedReq && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          onClick={(e) => {
            // click outside content closes
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Backdrop (raw CSS blur) */}
          <div className="absolute inset-0 backdrop-blur-custom"></div>

          {/* Modal content */}
          <div className="relative modal-animate w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedReq.businessName}
                </h3>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="capitalize">
                    {selectedReq.status || "pending"}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Owner block */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedReq.userInfo?.profileImage}
                  alt={selectedReq.userInfo?.name || "Profile"}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-teal-200"
                />
                <div>
                  <p className="font-semibold">{selectedReq.userInfo?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedReq.userInfo?.email} • {selectedReq.userInfo?.phone}
                  </p>
                </div>
              </div>

              {/* 3-col grid sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Business Info */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <h4 className="font-semibold mb-3">Business Info</h4>
                  <InfoRow label="Business Name" value={selectedReq.businessName} />
                  <InfoRow label="Type" value={selectedReq.businessType} />
                  <InfoRow label="Address" value={selectedReq.businessAddress} />
                </div>

                {/* Links */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <h4 className="font-semibold mb-3">Links</h4>
                  <InfoLink label="Website" href={selectedReq.websiteUrl} />
                  <InfoLink label="Facebook" href={selectedReq.facebookUrl} />
                  <InfoLink label="Instagram" href={selectedReq.instagramUrl} />
                </div>

                {/* Compliance & Payment */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <h4 className="font-semibold mb-3">Compliance & Payment</h4>
                  <InfoRow label="Trade License" value={selectedReq.tradeLicense} />
                  <InfoRow label="Bank Account" value={selectedReq.bankAccountNumber} />
                  <InfoRow label="Bank Name" value={selectedReq.bankName} />
                  <InfoRow
                    label="Mobile Payment"
                    value={
                      selectedReq.mobilePaymentNumber
                        ? `${selectedReq.mobilePaymentProvider || ""} ${selectedReq.mobilePaymentNumber}`
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
              {selectedReq.status !== "approved" && (
                <button
                  onClick={() => handleStatusChange(selectedReq._id, "approved")}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Approve
                </button>
              )}
              {selectedReq.status !== "rejected" && (
                <button
                  onClick={() => handleStatusChange(selectedReq._id, "rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              )}
              {selectedReq.status !== "pending" && (
                <button
                  onClick={() => handleStatusChange(selectedReq._id, "pending")}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Mark Pending
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW CSS for blur + animation */}
      <style>{`
        .backdrop-blur-custom {
          background: rgba(17, 24, 39, 0.55);            /* slightly dark */
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .modal-animate {
          animation: modalFadeIn 160ms ease-out both;
          transform-origin: center;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SellerRequest;

/* Small helper components to keep JSX clean */
const InfoRow = ({ label, value }) => (
  <div className="mb-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">
      {value || <span className="text-gray-400 italic">Not provided</span>}
    </p>
  </div>
);

const InfoLink = ({ label, href }) => (
  <div className="mb-2">
    <p className="text-xs text-gray-500">{label}</p>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-teal-700 hover:underline break-all"
      >
        {href}
      </a>
    ) : (
      <p className="text-sm text-gray-400 italic">Not provided</p>
    )}
  </div>
);

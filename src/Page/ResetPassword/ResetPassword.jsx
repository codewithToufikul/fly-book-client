import React, { useState } from "react";
import axios from "axios"; // Make sure axios is imported
import logo from "../../assets/logo.png";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passErr, setPassErr] = useState("");
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Check if the password is valid
    if (!password || password.length < 6) {
      setPassErr("Password must be at least 6 characters long!");
      return;
    }

    try {
      // Send password reset request
      const res = await axios.post(
        `http://localhost:3000/reset-password/${id}/${token}`,
        { password }
      );
      setLoading(false);
      toast.success(res.data.message || "Changed failed!");
      navigate("/login");
    } catch (err) {
      // Log the error
      toast.error("Error during password reset:");
      setLoading(false);
      if (err.response) {
        toast.error(err.response.statusText || "An error occurred");
        setLoading(false);
      } else {
        toast.error("An unexpected error occurred");
        setLoading(false);
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center align-items-center bg-gray-50">
      <div className="my-10">
        <img width={150} src={logo} alt="Logo" />
      </div>
      <div className="p-3 rounded-lg bg-white border-2">
        <h4 className="text-2xl font-medium my-4 text-center">
          Reset Password
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="password">
              <p className="text-base">New Password</p>
            </label>
            <input
              type="text"
              placeholder="Enter New Password"
              autoComplete="off"
              name="password"
              required
              className="form-control rounded-lg border-2 mt-3 py-3 w-[300px] px-3"
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length >= 6) {
                  setPassErr(""); // Clear error if the password is valid
                }
              }}
            />
            {passErr && <p className="text-red-500 text-sm mt-2">{passErr}</p>}
          </div>
          <button
            type="submit"
            className="btn bg-gray-800 text-white w-full rounded-0 mt-4"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

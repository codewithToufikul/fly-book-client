import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

const RecoverPass = () => {
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading state
    try {
      const res = await axios.post("https://api.flybook.com.bd/forgot-password", { email });
      if (res.data.Status === "Success") {
        toast.success("Reset mail sent, please check!");
        navigate("/login");
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err) {
      toast.error(err.response?.statusText || "Something went wrong!");
    } finally {
      setLoading(false); // End loading state
    }
  };


  return (
    <div className=" w-full min-h-screen flex flex-col justify-center items-center align-items-center bg-gray-50">
      <div className=" my-10">
        <img width={150} src={logo} alt="" />
      </div>
      <div className=" p-3 rounded-lg bg-white border-2 ">
        <h4 className=" text-2xl font-medium my-4 text-center">
          Forgot Password
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <p className=" text-lg">Email</p>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              required
              className="form-control rounded-lg border-2 mt-3 py-3 w-[300px] px-3"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn flex justify-center bg-gray-800 text-white w-full rounded-0 mt-4"
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
              "Send"
            )}
          </button>
        </form>
        <div className=" flex justify-end my-3 mt-5">
          <Link to={"/login"} className=" text-sm">
            Go Back <span className=" font-semibold underline">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoverPass;

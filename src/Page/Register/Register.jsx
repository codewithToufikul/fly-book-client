import { Link, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import axios from "axios";


const Register = () => {
  const [passErr, setPassErr] = useState("");
  const [numErr, setNumErr] = useState("");
  const navigete = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setPassErr("");
    setNumErr("");
    setLoading(true);
  
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const number = formData.get("number");
    const password = formData.get("password");
  
    const numberString = number.toString();
  
    // Validate phone number
    if (
      numberString.length !== 11 ||
      !numberString.startsWith("01") ||
      !/^\d+$/.test(numberString)
    ) {
      setLoading(false);
      setNumErr("Invalid Number! Must be 11 digits and start with '01'.");
      return;
    }
  
    // Validate password length
    if (password.length < 6) {
      setLoading(false);
      setPassErr("Password must be at least 6 characters long!");
      return;
    }
  
    const userInfo = {
      name,
      email,
      number,
      password,
    };
  
    try {
      const res = await axios.post("https://fly-book-server.onrender.com/users/register", userInfo);
  
      if (res.data.success) {
        toast.success("Registered successfully!");
        navigete("/login");
      } else {
        toast.error(res.data.message || "Registration failed!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong. Try again!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="font-[sans-serif] bg-white max-w-4xl flex items-center mx-auto md:h-screen p-4 justify-center flex-col">
      <img className="mb-5 w-[120px] lg:w-[230px]" src={logo} alt="Logo" />
      <div className="grid md:grid-cols-3 items-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-xl overflow-hidden">
        {/* Left Section */}
        <div className="max-md:order-1 hidden lg:block flex flex-col justify-center space-y-16 max-md:mt-16 min-h-full bg-gradient-to-r from-gray-900 to-gray-700 lg:px-8 px-4 py-4">
          <div className=" k">
            <h4 className="text-white  text-base lg:text-lg font-semibold">
              Create Your Account
            </h4>
            <p className="text-[13px] text-gray-300 mt-3 leading-relaxed">
              Welcome to our registration page! Get started by creating your
              account.
            </p>
          </div>
          <div>
            <h4 className="text-white text-lg font-semibold">
              Simple & Secure Registration
            </h4>
            <p className="text-[13px] text-gray-300 mt-3 leading-relaxed">
              Our registration process is designed to be straightforward and
              secure. We prioritize your privacy and data security.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleRegister}
          className="md:col-span-2 w-full py-6 px-6 sm:px-16"
        >
          <div className=" mb-3 lg:mb-6">
            <h3 className="text-gray-800 text-2xl font-bold">
              Create an account
            </h3>
          </div>

          <div className=" space-y-3 lg:space-y-6">
            {/* Name Field */}
            <div>
              <label className="text-gray-800 text-sm mb-2 block">
                Full Name
              </label>
              <div className="relative flex items-center">
                <input
                  name="name"
                  type="text"
                  required
                  className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Email</label>
              <div className="relative flex items-center">
                <input
                  name="email"
                  type="email"
                  required
                  className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter email"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="text-gray-800 text-sm mb-2 block">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <input
                  name="number"
                  type="text"
                  required
                  className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter number"
                />
              </div>
              {numErr && <p className="text-sm text-red-500">{numErr}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-gray-800 text-sm mb-2 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type="password"
                  required
                  className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter password"
                />
              </div>
              {passErr && <p className="text-sm text-red-500">{passErr}</p>}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 block text-sm text-gray-800"
              >
                I accept the{" "}
                <a
                  href="#"
                  className="text-primary-600 font-semibold hover:underline ml-1"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className=" mt-5 lg:!mt-12">
            <button
              type="submit"
              className="w-full py-3 px-4 tracking-wider text-sm rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none"
            >
              {loading ? (
                <span className="loading loading-spinner text-white"></span>
              ) : (
                <p className=" text-base lg:text-lg">Sign Up</p>
              )}
            </button>
          </div>

          {/* Login Link */}
          <p className="text-gray-800 text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="font-medium text-primary-600 hover:underline ml-1"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

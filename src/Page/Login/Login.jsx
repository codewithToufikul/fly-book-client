import { Link, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setHidden((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const number = formData.get("number");
    const password = formData.get("password");

    try {
      const { data } = await axios.post("https://api.flybook.com.bd/users/login", {
        number,
        password,
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
        setLoading(false);
        toast.success("Login Success");
        navigate("/");
      } else {
        toast.error(data.message || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center flex-col">
      <img className="mb-5 w-[140px] lg:w-[230px]" src={logo} alt="" />
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
            Sign in to your account
          </h1>
          <form
            onSubmit={handleLogin}
            className="space-y-4 md:space-y-6"
            action="#"
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Your Number
              </label>
              <input
                type="number"
                name="number"
                id="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Enter your number"
                required
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                type={hidden ? "password" : "text"}
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-2/3 right-3 transform -translate-y-1/2 text-2xl text-gray-500 focus:outline-none"
              >
                {hidden ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="w-4 h-4 border rounded focus:ring-3 focus:ring-primary-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500">
                    Remember me
                  </label>
                </div>
              </div>
              <Link
                to={"/recover-password"}
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 tracking-wider text-sm rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none"
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
                "Login"
              )}
            </button>
            <p className="text-sm font-light text-gray-500">
              Don’t have an account yet?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
            <div className="divider">OR</div>
            <p className="text-sm font-light text-gray-500">
              Go Back Home{" "}
              <Link
                to="/"
                className="font-medium text-primary-600 hover:underline"
              >
                Home
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/eztherapy.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "therapist") {
      setError("");
      navigate("/therapist");
    } else if (username === "patient") {
      setError("");
      navigate("/patient");
    } else {
      setError("Wrong username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-400 to-purple-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="w-32 sm:w-40 h-auto mb-6 object-contain"
        />

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h1>

        {/* Error Message with fade animation */}
        <div
          className={`w-full flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 transition-all duration-300 ease-in-out ${
            error ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <span className="text-red-600 text-lg font-bold">✕</span>
          <span className="text-sm">{error}</span>
        </div>

        {/* Form */}
        <form
          className="w-full flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />

          <div className="relative w-full mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            {/* Show/hide password button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <button
          onClick={() => navigate("/register")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 mt-5"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}

export default Login;
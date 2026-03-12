import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/eztherapy.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (response.ok) {
        // Successful registration
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Registration failed. Username may already exist.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
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
          Register
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

        {/* Success Message with fade animation */}
        <div
          className={`w-full flex items-center gap-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-4 transition-all duration-300 ease-in-out ${
            success ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <span className="text-green-600 text-lg font-bold">✓</span>
          <span className="text-sm">{success}</span>
        </div>

        {/* Form */}
        <form
          className="w-full flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
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

          <div className="relative w-full mb-4">
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

          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="w-full mb-6">
            <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="patient">Patient</option>
                <option value="therapist">Therapist</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Register
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 mt-5"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

export default Register;

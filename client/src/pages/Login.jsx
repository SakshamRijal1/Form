import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.user, data.token);

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Login to your account
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={handleLogin}
          className="mt-6 space-y-4"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black p-3 text-white"
          >
            Login
          </button>

        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">
            OR
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google button will go here */}

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
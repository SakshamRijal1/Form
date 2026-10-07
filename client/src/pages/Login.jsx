import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import React from "react";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Login to manage your forms.</p>
        {error && <div className="error">{error}</div>}
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email:e.target.value})} required />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({...form, password:e.target.value})} required />
        <button className="primary">Login</button>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import React from "react";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        {error && <div className="error">{error}</div>}
        <input placeholder="Name" value={form.name}
          onChange={e => setForm({...form, name:e.target.value})} required />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email:e.target.value})} required />
        <input type="password" placeholder="Password (6+ characters)" value={form.password}
          onChange={e => setForm({...form, password:e.target.value})} minLength={6} required />
        <button className="primary">Register</button>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </form>
    </main>
  );
}

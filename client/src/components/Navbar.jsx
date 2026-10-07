import { Link, useNavigate } from "react-router-dom";
import { FileText, LogOut, Plus } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <FileText size={22} /> Formly
      </Link>

      <nav>
        {user && <Link to="/">Dashboard</Link>}
        {user && <Link to="/create" className="primary small"><Plus size={16}/> Create</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register" className="primary small">Register</Link>}
        {user && (
          <button className="ghost" onClick={handleLogout}>
            <LogOut size={16}/> Logout
          </button>
        )}
      </nav>
    </header>
  );
}

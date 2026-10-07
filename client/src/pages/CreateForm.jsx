import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import React from "react";

export default function CreateForm() {
  const [title, setTitle] = useState("Untitled Form");
  const navigate = useNavigate();

  async function create() {
    const { data } = await api.post("/forms", { title });
    navigate(`/forms/${data.form._id}/edit`);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create a form</h1>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <button className="primary" onClick={create}>Start building</button>
      </div>
    </main>
  );
}

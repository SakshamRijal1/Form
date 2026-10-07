import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, Eye, Pencil, Trash2 } from "lucide-react";
import api from "../api";
import React from "react";

export default function Dashboard() {
  const [data, setData] = useState({ owned: [], shared: [] });

  async function load() {
    const { data } = await api.get("/forms/mine");
    setData(data);
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Delete this form and all responses?")) return;
    await api.delete(`/forms/${id}`);
    load();
  }

  return (
    <main className="container">
      <div className="page-title">
        <div>
          <h1>My Forms</h1>
          <p className="muted">Create, share and manage your forms.</p>
        </div>
        <Link className="primary" to="/create">+ New form</Link>
      </div>

      <section>
        <h2>Owned by me</h2>
        <div className="grid">
          {data.owned.map(form => (
            <article className="form-card" key={form._id}>
              <FileText />
              <h3>{form.title}</h3>
              <p className="muted">{form.description || "No description"}</p>
              <div className="badge">{form.published ? "Published" : "Draft"}</div>
              <div className="actions">
                <Link className="ghost" to={`/forms/${form._id}/edit`}><Pencil size={16}/> Edit</Link>
                <Link className="ghost" to={`/forms/${form._id}/responses`}><Eye size={16}/> Responses</Link>
                <button className="icon danger" onClick={() => remove(form._id)}><Trash2 size={17}/></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Shared with me</h2>
        <div className="grid">
          {data.shared.map(form => (
            <article className="form-card" key={form._id}>
              <Users />
              <h3>{form.title}</h3>
              <p className="muted">Permission: {form.accessRole}</p>
              <Link className="primary small" to={`/forms/${form._id}/edit`}>
                {form.accessRole === "editor" ? "Edit form" : "View form"}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

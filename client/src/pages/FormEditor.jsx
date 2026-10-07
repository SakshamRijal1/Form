import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Save, Send, Users, BarChart3, Trash2, Link as LinkIcon } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import QuestionEditor from "../components/QuestionEditor";
import { io } from "socket.io-client";
import React from "react";

const blankQuestion = () => ({
  title: "Untitled question",
  description: "",
  type: "short_answer",
  options: [],
  required: false
});

export default function FormEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [role, setRole] = useState(null);
  const [saved, setSaved] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [permissions, setPermissions] = useState([]);

  const editable = role === "owner" || role === "editor";
  const owner = role === "owner";

  async function load() {
    const { data } = await api.get(`/forms/${id}`);
    setForm(data.form);
    setRole(data.role);
    if (data.role === "owner") loadPermissions();
  }

  async function loadPermissions() {
    const { data } = await api.get(`/forms/${id}/permissions`);
    setPermissions(data.permissions);
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true
    });
    socket.emit("join-form", id);
    socket.on("form-updated", load);
    return () => socket.disconnect();
  }, [id]);

  const shareUrl = useMemo(() =>
    form?.shareId ? `${window.location.origin}/forms/public/${form.shareId}` : "",
  [form?.shareId]);

  function updateSection(index, patch) {
    setForm(prev => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], ...patch };
      return { ...prev, sections };
    });
    setSaved(false);
  }

  function updateQuestion(si, qi, question) {
    setForm(prev => {
      const sections = [...prev.sections];
      const questions = [...sections[si].questions];
      questions[qi] = question;
      sections[si] = { ...sections[si], questions };
      return { ...prev, sections };
    });
    setSaved(false);
  }

  function addSection() {
    setForm(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: `Section ${prev.sections.length + 1}`, description: "", questions: [blankQuestion()] }
      ]
    }));
  }

  function addQuestion(si) {
    setForm(prev => {
      const sections = [...prev.sections];
      sections[si] = {
        ...sections[si],
        questions: [...sections[si].questions, blankQuestion()]
      };
      return { ...prev, sections };
    });
  }

  function deleteQuestion(si, qi) {
    setForm(prev => {
      const sections = [...prev.sections];
      sections[si] = {
        ...sections[si],
        questions: sections[si].questions.filter((_, i) => i !== qi)
      };
      return { ...prev, sections };
    });
  }

  async function save() {
    await api.put(`/forms/${id}`, {
      title: form.title,
      description: form.description,
      sections: form.sections
    });
    setSaved(true);
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socket.emit("form-updated", { formId: id });
    setTimeout(() => socket.disconnect(), 300);
  }

  async function publish() {
    const { data } = await api.post(`/forms/${id}/publish`);
    setForm(data.form);
    alert(`Published!\n${window.location.origin}/forms/public/${data.shareId}`);
  }

  async function unpublish() {
    const { data } = await api.post(`/forms/${id}/unpublish`);
    setForm(data.form);
  }

  async function share() {
    await api.post(`/forms/${id}/permissions`, {
      email: shareEmail,
      role: shareRole
    });
    setShareEmail("");
    loadPermissions();
  }

  async function removePermission(userId) {
    await api.delete(`/forms/${id}/permissions/${userId}`);
    loadPermissions();
  }

  if (!form) return <div className="center">Loading...</div>;

  return (
    <main className="container editor-page">
      <div className="editor-top">
        <div>
          <input
            className="form-title"
            value={form.title}
            disabled={!editable}
            onChange={e => setForm({...form, title:e.target.value})}
          />
          <input
            value={form.description || ""}
            disabled={!editable}
            placeholder="Form description"
            onChange={e => setForm({...form, description:e.target.value})}
          />
        </div>
        <div className="actions">
          <span className="badge">{role}</span>
          {editable && <button className="primary" onClick={save}><Save size={17}/> {saved ? "Saved" : "Save"}</button>}
          {owner && !form.published && <button className="secondary" onClick={publish}><Send size={17}/> Publish</button>}
          {owner && form.published && <button className="secondary" onClick={unpublish}>Unpublish</button>}
          {owner && <Link className="ghost" to={`/forms/${id}/responses`}><BarChart3 size={17}/> Responses</Link>}
        </div>
      </div>

      {form.published && shareUrl && (
        <div className="share-banner">
          <LinkIcon size={17}/>
          <span>{shareUrl}</span>
          <button className="ghost" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy link</button>
        </div>
      )}

      {form.sections.map((section, si) => (
        <section className="section-card" key={section._id || si}>
          <input
            className="section-title"
            value={section.title}
            disabled={!editable}
            onChange={e => updateSection(si, { title:e.target.value })}
          />
          <input
            value={section.description || ""}
            disabled={!editable}
            placeholder="Section description"
            onChange={e => updateSection(si, { description:e.target.value })}
          />

          {section.questions.map((question, qi) => (
            <QuestionEditor
              key={question._id || qi}
              question={question}
              onChange={q => updateQuestion(si, qi, q)}
              onDelete={() => deleteQuestion(si, qi)}
            />
          ))}

          {editable && (
            <button className="ghost add-question" onClick={() => addQuestion(si)}>
              <Plus size={17}/> Add question
            </button>
          )}
        </section>
      ))}

      {editable && (
        <button className="primary add-section" onClick={addSection}>
          <Plus size={18}/> Add section
        </button>
      )}

      {owner && (
        <section className="permission-card">
          <h2><Users size={20}/> Manage access</h2>
          <div className="permission-form">
            <input
              placeholder="Registered user's email"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
            />
            <select value={shareRole} onChange={e => setShareRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button className="primary" onClick={share}>Give access</button>
          </div>

          {permissions.map(p => (
            <div className="permission-row" key={p._id}>
              <div><b>{p.user.name}</b><span className="muted">{p.user.email}</span></div>
              <span className="badge">{p.role}</span>
              <button className="icon danger" onClick={() => removePermission(p.user._id)}><Trash2 size={17}/></button>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

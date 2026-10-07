import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import React from "react";

export default function PublicForm() {
  const { shareId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/forms/public/${shareId}`).then(({data}) => setForm(data.form));
  }, [shareId]);

  function setAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function toggleCheckbox(id, option) {
    const current = Array.isArray(answers[id]) ? answers[id] : [];
    const next = current.includes(option)
      ? current.filter(x => x !== option)
      : [...current, option];
    setAnswer(id, next);
  }

  async function submit(e) {
    e.preventDefault();
    for (const section of form.sections) {
      for (const q of section.questions) {
        if (q.required && (answers[q._id] === undefined || answers[q._id] === "" ||
            (Array.isArray(answers[q._id]) && answers[q._id].length === 0))) {
          setMessage(`Please answer: ${q.title}`);
          return;
        }
      }
    }

    await api.post(`/forms/public/${shareId}/responses`, {
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value }))
    });
    setMessage("Your response has been submitted successfully.");
    setAnswers({});
  }

  if (!form) return <div className="center">Loading form...</div>;

  return (
    <main className="public-form">
      <form onSubmit={submit}>
        <div className="public-header">
          <h1>{form.title}</h1>
          <p>{form.description}</p>
        </div>

        {form.sections.map((section, si) => (
          <section className="section-card" key={section._id || si}>
            <h2>{section.title}</h2>
            <p className="muted">{section.description}</p>

            {section.questions.map((q, qi) => (
              <div className="public-question" key={q._id || qi}>
                <label>
                  <b>{q.title}</b>{q.required && <span className="required">*</span>}
                  {q.description && <small>{q.description}</small>}
                </label>

                {q.type === "long_answer" && (
                  <textarea value={answers[q._id] || ""} onChange={e => setAnswer(q._id, e.target.value)} />
                )}

                {["short_answer","email","number","date"].includes(q.type) && (
                  <input
                    type={q.type === "short_answer" ? "text" : q.type}
                    value={answers[q._id] || ""}
                    onChange={e => setAnswer(q._id, e.target.value)}
                  />
                )}

                {q.type === "rating" && (
                  <div className="rating">
                    {[1,2,3,4,5].map(n => (
                      <label key={n}><input type="radio" name={q._id} checked={answers[q._id] === n}
                        onChange={() => setAnswer(q._id, n)} /> {n}</label>
                    ))}
                  </div>
                )}

                {q.type === "multiple_choice" && (
                  <div className="choice-list">
                    {(q.options || []).map(o => (
                      <label key={o}><input type="radio" name={q._id} checked={answers[q._id] === o}
                        onChange={() => setAnswer(q._id, o)} /> {o}</label>
                    ))}
                  </div>
                )}

                {q.type === "checkboxes" && (
                  <div className="choice-list">
                    {(q.options || []).map(o => (
                      <label key={o}><input type="checkbox" checked={(answers[q._id] || []).includes(o)}
                        onChange={() => toggleCheckbox(q._id, o)} /> {o}</label>
                    ))}
                  </div>
                )}

                {q.type === "dropdown" && (
                  <select value={answers[q._id] || ""} onChange={e => setAnswer(q._id, e.target.value)}>
                    <option value="">Select an option</option>
                    {(q.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
          </section>
        ))}

        {message && <div className={message.includes("successfully") ? "success" : "error"}>{message}</div>}
        <button className="primary submit-button">Submit response</button>
      </form>
    </main>
  );
}

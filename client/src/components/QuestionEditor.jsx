import { Trash2, GripVertical } from "lucide-react";

import React from "react";
const types = [
  ["short_answer", "Short answer"],
  ["long_answer", "Long answer"],
  ["email", "Email"],
  ["number", "Number"],
  ["multiple_choice", "Multiple choice"],
  ["checkboxes", "Checkboxes"],
  ["dropdown", "Dropdown"],
  ["date", "Date"],
  ["rating", "Rating"]
];

export default function QuestionEditor({ question, onChange, onDelete }) {
  function patch(values) {
    onChange({ ...question, ...values });
  }

  function updateOption(index, value) {
    const options = [...(question.options || [])];
    options[index] = value;
    patch({ options });
  }

  const needsOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(question.type);

  return (
    <div className="question-card">
      <div className="question-head">
        <GripVertical size={18} className="muted"/>
        <input
          className="question-title"
          value={question.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Question"
        />
        <select value={question.type} onChange={(e) => patch({ type: e.target.value })}>
          {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="icon danger" onClick={onDelete}><Trash2 size={18}/></button>
      </div>

      <input
        value={question.description || ""}
        onChange={(e) => patch({ description: e.target.value })}
        placeholder="Description (optional)"
      />

      {needsOptions && (
        <div className="options">
          {(question.options || []).map((option, i) => (
            <input
              key={i}
              value={option}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
          ))}
          <button
            className="ghost"
            onClick={() => patch({ options: [...(question.options || []), ""] })}
          >
            + Add option
          </button>
        </div>
      )}

      {question.type === "rating" && (
        <p className="muted">Responders will see a 1–5 rating scale.</p>
      )}

      <label className="switch-row">
        <input
          type="checkbox"
          checked={question.required || false}
          onChange={(e) => patch({ required: e.target.checked })}
        />
        Required
      </label>
    </div>
  );
}

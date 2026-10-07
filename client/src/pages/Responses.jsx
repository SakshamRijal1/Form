import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import React from "react";
export default function Responses() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    api.get(`/forms/${id}/responses`).then(({data}) => setResponses(data.responses));
  }, [id]);

  return (
    <main className="container">
      <div className="page-title">
        <div>
          <h1>Responses</h1>
          <p className="muted">{responses.length} response(s)</p>
        </div>
      </div>

      {responses.map((response, index) => (
        <article className="response-card" key={response._id}>
          <div className="response-head">
            <b>Response #{responses.length - index}</b>
            <span className="muted">{new Date(response.createdAt).toLocaleString()}</span>
          </div>
          {response.respondent && <p>Respondent: {response.respondent.name} ({response.respondent.email})</p>}
          {response.answers.map(answer => (
            <div className="answer" key={answer.questionId}>
              <small>Question ID: {answer.questionId}</small>
              <strong>{Array.isArray(answer.value) ? answer.value.join(", ") : String(answer.value ?? "")}</strong>
            </div>
          ))}
        </article>
      ))}
    </main>
  );
}

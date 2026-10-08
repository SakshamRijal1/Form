import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  FileText,
  User,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api";

export default function Responses() {
  const { id } = useParams();

  const [responses, setResponses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api
      .get(`/forms/${id}/responses`)
      .then(({ data }) =>
        setResponses(data.responses)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [id]);

  function isFile(value) {
    return (
      typeof value === "string" &&
      value.includes("/uploads/")
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        Loading responses...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link
            to={`/forms/${id}/edit`}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Responses
            </h1>

            <p className="text-sm text-slate-500">
              View and manage form responses.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <BarChart3 size={20} />
            </div>

            <p className="text-2xl font-black text-slate-900">
              {responses.length}
            </p>

            <p className="text-sm text-slate-500">
              Total responses
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <User size={20} />
            </div>

            <p className="text-2xl font-black text-slate-900">
              {
                responses.filter(
                  (response) =>
                    response.respondent
                ).length
              }
            </p>

            <p className="text-sm text-slate-500">
              Registered respondents
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileText size={20} />
            </div>

            <p className="text-2xl font-black text-slate-900">
              {responses.length > 0
                ? "Active"
                : "Waiting"}
            </p>

            <p className="text-sm text-slate-500">
              Response status
            </p>
          </div>
        </div>

        {/* RESPONSES */}

        <div className="mt-8 space-y-5">
          {responses.map(
            (response, index) => (
              <article
                key={response._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 border-b bg-slate-50 px-6 py-5 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Response #
                      {responses.length -
                        index}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        response.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  {response.respondent && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                        <User size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {
                            response
                              .respondent
                              .name
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          {
                            response
                              .respondent
                              .email
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="divide-y">
                  {response.answers.map(
                    (answer, answerIndex) => (
                      <div
                        key={
                          answer.questionId ||
                          answerIndex
                        }
                        className="px-6 py-5"
                      >
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Question
                        </p>

                        <p className="break-all font-semibold text-slate-800">
                          {Array.isArray(
                            answer.value
                          )
                            ? answer.value.join(
                                ", "
                              )
                            : isFile(
                                answer.value
                              )
                            ? "Uploaded file"
                            : String(
                                answer.value ??
                                  ""
                              )}
                        </p>

                        {isFile(
                          answer.value
                        ) && (
                          <a
                            href={
                              answer.value
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100"
                          >
                            Open uploaded file
                            <ExternalLink
                              size={15}
                            />
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              </article>
            )
          )}

          {responses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BarChart3 size={24} />
              </div>

              <h2 className="mt-5 font-bold text-slate-800">
                No responses yet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Responses will appear here when
                people submit your form.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
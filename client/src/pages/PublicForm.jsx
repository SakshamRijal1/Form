import {
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export default function PublicForm() {
  const { shareId } = useParams();

  const [form, setForm] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [files, setFiles] =
    useState({});

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    api
      .get(`/forms/public/${shareId}`)
      .then(({ data }) =>
        setForm(data.form)
      )
      .catch(() =>
        setMessage(
          "This form could not be found."
        )
      );
  }, [shareId]);

  function setAnswer(id, value) {
    setAnswers((previous) => ({
      ...previous,
      [id]: value,
    }));
  }

  function toggleCheckbox(
    id,
    option
  ) {
    const current = Array.isArray(
      answers[id]
    )
      ? answers[id]
      : [];

    const next = current.includes(option)
      ? current.filter(
          (item) => item !== option
        )
      : [...current, option];

    setAnswer(id, next);
  }

  function handleFileChange(
    questionId,
    file
  ) {
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage(
        "File must be 5 MB or smaller."
      );

      return;
    }

    setMessage("");

    setFiles((previous) => ({
      ...previous,
      [questionId]: file,
    }));

    setAnswer(
      questionId,
      file.name
    );
  }

  async function uploadFile(
    questionId,
    file
  ) {
    const body = new FormData();

    body.append("file", file);

    body.append(
      "questionId",
      questionId
    );

    const { data } =
      await api.post(
        `/forms/public/${shareId}/upload`,
        body,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return data.file.url;
  }

  async function submit(event) {
    event.preventDefault();

    setMessage("");

    // Required validation
    for (const section of form.sections) {
      for (const question of section.questions) {
        if (!question.required) {
          continue;
        }

        const value =
          answers[question._id];

        const empty =
          value === undefined ||
          value === "" ||
          value === null ||
          (Array.isArray(value) &&
            value.length === 0);

        if (empty) {
          setMessage(
            `Please answer: ${question.title}`
          );

          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const finalAnswers = {
        ...answers,
      };

      // Upload files first
      for (const [
        questionId,
        file,
      ] of Object.entries(files)) {
        const url =
          await uploadFile(
            questionId,
            file
          );

        finalAnswers[questionId] =
          url;
      }

      await api.post(
        `/forms/public/${shareId}/responses`,
        {
          answers: Object.entries(
            finalAnswers
          ).map(
            ([
              questionId,
              value,
            ]) => ({
              questionId,
              value,
            })
          ),
        }
      );

      setAnswers({});
      setFiles({});

      setMessage(
        "success"
      );
    } catch (error) {
      setMessage(
        error.response?.data
          ?.message ||
          "Could not submit your response."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm font-semibold text-slate-600 shadow-sm">
          Loading form...
        </div>
      </div>
    );
  }

  const theme = form.theme || {
    primaryColor: "#673AB7",
    backgroundColor: "#F5F3FF",
    headerImage: "",
  };

  if (message === "success") {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-5 py-10"
        style={{
          backgroundColor:
            theme.backgroundColor,
        }}
      >
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              size={32}
              className="text-emerald-600"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Response submitted
          </h1>

          <p className="mt-2 text-slate-500">
            Thank you! Your response has
            been successfully submitted.
          </p>

          <button
            onClick={() => {
              setMessage("");
            }}
            className="mt-7 rounded-xl px-6 py-3 text-sm font-bold text-white"
            style={{
              backgroundColor:
                theme.primaryColor,
            }}
          >
            Submit another response
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 lg:py-12"
      style={{
        backgroundColor:
          theme.backgroundColor,
      }}
    >
      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl"
      >
        {/* HEADER */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {theme.headerImage && (
            <div
              className="h-48 bg-cover bg-center sm:h-64"
              style={{
                backgroundImage: `url("${theme.headerImage}")`,
              }}
            />
          )}

          <div
            className="border-t-[6px] p-7 sm:p-10"
            style={{
              borderTopColor:
                theme.primaryColor,
            }}
          >
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {form.title}
            </h1>

            {form.description && (
              <p className="mt-3 whitespace-pre-line text-slate-500">
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* SECTIONS */}

        <div className="mt-5 space-y-5">
          {form.sections.map(
            (section, sectionIndex) => (
              <section
                key={
                  section._id ||
                  sectionIndex
                }
                className="rounded-3xl bg-white p-6 shadow-lg sm:p-8"
              >
                <div className="mb-7">
                  <h2 className="text-xl font-bold text-slate-900">
                    {section.title}
                  </h2>

                  {section.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {
                        section.description
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-8">
                  {section.questions.map(
                    (
                      question,
                      questionIndex
                    ) => (
                      <div
                        key={
                          question._id ||
                          questionIndex
                        }
                      >
                        <label className="mb-3 block">
                          <span className="block font-semibold text-slate-900">
                            {
                              question.title
                            }

                            {question.required && (
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            )}
                          </span>

                          {question.description && (
                            <span className="mt-1 block text-sm text-slate-500">
                              {
                                question.description
                              }
                            </span>
                          )}
                        </label>

                        {/* SHORT */}

                        {question.type ===
                          "short_answer" && (
                          <input
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          />
                        )}

                        {/* EMAIL */}

                        {question.type ===
                          "email" && (
                          <input
                            type="email"
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          />
                        )}

                        {/* NUMBER */}

                        {question.type ===
                          "number" && (
                          <input
                            type="number"
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          />
                        )}

                        {/* DATE */}

                        {question.type ===
                          "date" && (
                          <input
                            type="date"
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          />
                        )}

                        {/* LONG */}

                        {question.type ===
                          "long_answer" && (
                          <textarea
                            rows={5}
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          />
                        )}

                        {/* MULTIPLE */}

                        {question.type ===
                          "multiple_choice" && (
                          <div className="space-y-3">
                            {(
                              question.options ||
                              []
                            ).map(
                              (
                                option
                              ) => (
                                <label
                                  key={
                                    option
                                  }
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50"
                                >
                                  <input
                                    type="radio"
                                    name={
                                      question._id
                                    }
                                    checked={
                                      answers[
                                        question
                                          ._id
                                      ] ===
                                      option
                                    }
                                    onChange={() =>
                                      setAnswer(
                                        question._id,
                                        option
                                      )
                                    }
                                    className="h-4 w-4 accent-violet-600"
                                  />

                                  <span className="text-sm font-medium text-slate-700">
                                    {
                                      option
                                    }
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        )}

                        {/* CHECKBOX */}

                        {question.type ===
                          "checkboxes" && (
                          <div className="space-y-3">
                            {(
                              question.options ||
                              []
                            ).map(
                              (
                                option
                              ) => (
                                <label
                                  key={
                                    option
                                  }
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      (
                                        answers[
                                          question
                                            ._id
                                        ] || []
                                      ).includes(
                                        option
                                      )
                                    }
                                    onChange={() =>
                                      toggleCheckbox(
                                        question._id,
                                        option
                                      )
                                    }
                                    className="h-4 w-4 rounded accent-violet-600"
                                  />

                                  <span className="text-sm font-medium text-slate-700">
                                    {
                                      option
                                    }
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        )}

                        {/* DROPDOWN */}

                        {question.type ===
                          "dropdown" && (
                          <select
                            value={
                              answers[
                                question._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setAnswer(
                                question._id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-white"
                          >
                            <option value="">
                              Select an option
                            </option>

                            {(
                              question.options ||
                              []
                            ).map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {
                                    option
                                  }
                                </option>
                              )
                            )}
                          </select>
                        )}

                        {/* RATING */}

                        {question.type ===
                          "rating" && (
                          <div className="flex flex-wrap gap-3">
                            {[
                              1,
                              2,
                              3,
                              4,
                              5,
                            ].map(
                              (number) => (
                                <button
                                  type="button"
                                  key={
                                    number
                                  }
                                  onClick={() =>
                                    setAnswer(
                                      question._id,
                                      number
                                    )
                                  }
                                  className={`flex h-12 w-12 items-center justify-center rounded-xl border font-bold transition ${
                                    answers[
                                      question
                                        ._id
                                    ] ===
                                    number
                                      ? "text-white"
                                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                  style={
                                    answers[
                                      question
                                        ._id
                                    ] ===
                                    number
                                      ? {
                                          backgroundColor:
                                            theme.primaryColor,
                                          borderColor:
                                            theme.primaryColor,
                                        }
                                      : {}
                                  }
                                >
                                  {number}
                                </button>
                              )
                            )}
                          </div>
                        )}

                        {/* FILE */}

                        {question.type ===
                          "file_upload" && (
                          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                              <FileUp
                                size={22}
                              />
                            </div>

                            <p className="mt-3 font-semibold text-slate-800">
                              Upload a file
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Maximum file
                              size: 5 MB
                            </p>

                            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                              style={{
                                backgroundColor:
                                  theme.primaryColor,
                              }}
                            >
                              <Upload
                                size={16}
                              />

                              Choose file

                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                onChange={(
                                  e
                                ) =>
                                  handleFileChange(
                                    question._id,
                                    e
                                      .target
                                      .files?.[0]
                                  )
                                }
                              />
                            </label>

                            {files[
                              question._id
                            ] && (
                              <p className="mt-3 break-all text-sm font-medium text-violet-600">
                                {
                                  files[
                                    question._id
                                  ].name
                                }
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        {message &&
          message !== "success" && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {message}
            </div>
          )}

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg">
          <p className="text-xs text-slate-400">
            Your response is securely submitted.
          </p>

          <button
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor:
                theme.primaryColor,
            }}
          >
            {submitting && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Submitting..."
              : "Submit"}
          </button>
        </div>
      </form>
    </main>
  );
}
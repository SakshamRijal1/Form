import {
  BarChart3,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Eye,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

export default function Dashboard() {
  const [data, setData] =
    useState({
      owned: [],
      shared: [],
    });

  const [search, setSearch] =
    useState("");

  async function load() {
    try {
      const { data } =
        await api.get(
          "/forms/mine"
        );

      setData(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (
      !confirm(
        "Delete this form and all responses?"
      )
    ) {
      return;
    }

    await api.delete(
      `/forms/${id}`
    );

    load();
  }

  const filteredOwned =
    useMemo(
      () =>
        data.owned.filter((form) =>
          form.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        ),
      [data.owned, search]
    );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                className="text-violet-600"
              />

              <span className="font-bold text-violet-600">
                Formify
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-black text-slate-950">
              My Forms
            </h1>
          </div>

          <Link
            to="/create"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <Plus size={18} />
            New form
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* SEARCH */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Create, customize and share
              beautiful forms.
            </p>
          </div>

          <div className="relative sm:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search forms..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* OWNED */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">
              Your forms
            </h2>

            <span className="text-sm text-slate-400">
              {filteredOwned.length} forms
            </span>
          </div>

          {filteredOwned.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredOwned.map(
                (form) => (
                  <article
                    key={form._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className="h-2"
                      style={{
                        backgroundColor:
                          form.theme
                            ?.primaryColor ||
                          "#673AB7",
                      }}
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <FileText
                            size={20}
                          />
                        </div>

                        <button
                          className="rounded-lg p-2 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical
                            size={18}
                          />
                        </button>
                      </div>

                      <h3 className="mt-5 truncate font-bold text-slate-900">
                        {form.title}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-400">
                        {form.description ||
                          "No description"}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            form.published
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {form.published
                            ? "Published"
                            : "Draft"}
                        </span>

                        {form.template && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-500">
                            {
                              form.template
                            }
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                        <Link
                          to={`/forms/${form._id}/edit`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          <Pencil
                            size={14}
                          />
                          Edit
                        </Link>

                        <Link
                          to={`/forms/${form._id}/responses`}
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                        >
                          <BarChart3
                            size={15}
                          />
                        </Link>

                        <button
                          onClick={() =>
                            remove(
                              form._id
                            )
                          }
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <FileText
                size={30}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-700">
                No forms yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create your first form.
              </p>

              <Link
                to="/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white"
              >
                <Plus size={17} />
                Create form
              </Link>
            </div>
          )}
        </section>

        {/* SHARED */}

        {data.shared.length > 0 && (
          <section className="mt-12">
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">
                Shared with you
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.shared.map(
                (form) => (
                  <article
                    key={form._id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Users
                          size={20}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold">
                          {form.title}
                        </h3>

                        <p className="text-xs capitalize text-slate-400">
                          {form.accessRole}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/forms/${form._id}/edit`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                    >
                      {form.accessRole ===
                      "editor" ? (
                        <>
                          <Pencil
                            size={15}
                          />
                          Edit form
                        </>
                      ) : (
                        <>
                          <Eye
                            size={15}
                          />
                          View form
                        </>
                      )}
                    </Link>
                  </article>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Sparkles,
} from "lucide-react";

import api from "../api";
import TemplateCard from "../components/TemplateCard";
import { FORM_TEMPLATES } from "../data/formTemplate";

export default function CreateForm() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredTemplates =
    FORM_TEMPLATES.filter((template) =>
      template.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  async function createForm(template) {
    try {
      setCreating(true);

      const { data } = await api.post(
        "/forms",
        {
          template: template.id,
        }
      );

      navigate(
        `/forms/${data.form._id}/edit`
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not create form"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Create a form
            </h1>

            <p className="text-sm text-slate-500">
              Choose a template and start building.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <Sparkles size={16} />
            Form templates
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Start with a beautiful template
          </h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Choose a template or start with a blank form.
            Everything can be customized later.
          </p>
        </div>

        <div className="relative mb-8 max-w-xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search templates..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {creating && (
          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
            Creating your form...
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() =>
                createForm(template)
              }
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <p className="font-semibold text-slate-700">
              No templates found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try another search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
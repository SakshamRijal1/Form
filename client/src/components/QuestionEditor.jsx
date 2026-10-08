import {
  GripVertical,
  Trash2,
  Plus,
  Paperclip,
} from "lucide-react";

const types = [
  ["short_answer", "Short answer"],
  ["long_answer", "Paragraph"],
  ["email", "Email"],
  ["number", "Number"],
  ["multiple_choice", "Multiple choice"],
  ["checkboxes", "Checkboxes"],
  ["dropdown", "Dropdown"],
  ["date", "Date"],
  ["rating", "Rating"],
  ["file_upload", "File / Image upload"],
];

export default function QuestionEditor({
  question,
  onChange,
  onDelete,
}) {
  function patch(values) {
    onChange({
      ...question,
      ...values,
    });
  }

  function updateOption(index, value) {
    const options = [
      ...(question.options || []),
    ];

    options[index] = value;

    patch({
      options,
    });
  }

  function removeOption(index) {
    patch({
      options: question.options.filter(
        (_, i) => i !== index
      ),
    });
  }

  const needsOptions = [
    "multiple_choice",
    "checkboxes",
    "dropdown",
  ].includes(question.type);

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-3 cursor-grab text-slate-300">
          <GripVertical size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <input
            value={question.title}
            onChange={(e) =>
              patch({
                title: e.target.value,
              })
            }
            placeholder="Question"
            className="w-full border-b-2 border-transparent bg-transparent px-1 py-2 text-lg font-semibold text-slate-900 outline-none transition focus:border-violet-500"
          />
        </div>

        <select
          value={question.type}
          onChange={(e) =>
            patch({
              type: e.target.value,
            })
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-violet-500"
        >
          {types.map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={onDelete}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title="Delete question"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <input
        value={question.description || ""}
        onChange={(e) =>
          patch({
            description: e.target.value,
          })
        }
        placeholder="Add a description (optional)"
        className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white"
      />

      {needsOptions && (
        <div className="space-y-3">
          {(question.options || []).map(
            (option, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div className="h-4 w-4 rounded-full border-2 border-slate-300" />

                <input
                  value={option}
                  onChange={(e) =>
                    updateOption(
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Option ${
                    index + 1
                  }`}
                  className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm outline-none focus:border-violet-500"
                />

                <button
                  onClick={() =>
                    removeOption(index)
                  }
                  className="text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            )
          )}

          <button
            onClick={() =>
              patch({
                options: [
                  ...(question.options || []),
                  "",
                ],
              })
            }
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
          >
            <Plus size={16} />
            Add option
          </button>
        </div>
      )}

      {question.type === "rating" && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Respondents will see a 1–5 rating scale.
        </div>
      )}

      {question.type === "file_upload" && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600">
            <Paperclip size={18} />
          </div>

          <div>
            <p className="font-semibold text-violet-900">
              File or image upload
            </p>

            <p className="text-xs text-violet-600">
              Maximum file size: 5 MB
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={question.required || false}
            onChange={(e) =>
              patch({
                required: e.target.checked,
              })
            }
            className="h-4 w-4 rounded accent-violet-600"
          />

          Required
        </label>
      </div>
    </div>
  );
}
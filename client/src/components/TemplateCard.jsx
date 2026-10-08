import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function TemplateCard({
  template,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={template.image}
          alt={template.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl shadow">
          {template.icon}
        </div>

        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          Template
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">
            {template.title}
          </h3>

          <ArrowRight
            size={18}
            className="text-slate-400 transition group-hover:translate-x-1"
          />
        </div>

        <p className="text-sm text-slate-500">
          {template.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <Sparkles
            size={14}
            style={{
              color: template.color,
            }}
          />

          <span style={{ color: template.color }}>
            Start with this template
          </span>
        </div>
      </div>
    </button>
  );
}
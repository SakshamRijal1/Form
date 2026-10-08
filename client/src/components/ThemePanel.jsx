import {
  Palette,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";

export default function ThemePanel({
  theme,
  onChange,
  onReset,
  onImageUpload,
  uploading,
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Palette
            size={18}
            className="text-violet-600"
          />

          <h3 className="font-bold text-slate-900">
            Appearance
          </h3>
        </div>

        <p className="text-sm text-slate-500">
          Customize how your public form looks.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Primary color
        </label>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={
              theme.primaryColor || "#673AB7"
            }
            onChange={(e) =>
              onChange({
                ...theme,
                primaryColor:
                  e.target.value,
              })
            }
            className="h-12 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
          />

          <input
            value={
              theme.primaryColor || "#673AB7"
            }
            onChange={(e) =>
              onChange({
                ...theme,
                primaryColor:
                  e.target.value,
              })
            }
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Background color
        </label>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={
              theme.backgroundColor ||
              "#F5F3FF"
            }
            onChange={(e) =>
              onChange({
                ...theme,
                backgroundColor:
                  e.target.value,
              })
            }
            className="h-12 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
          />

          <input
            value={
              theme.backgroundColor ||
              "#F5F3FF"
            }
            onChange={(e) =>
              onChange({
                ...theme,
                backgroundColor:
                  e.target.value,
              })
            }
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Header image
        </label>

        {theme.headerImage && (
          <img
            src={theme.headerImage}
            alt="Header"
            className="mb-3 h-32 w-full rounded-xl object-cover"
          />
        )}

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-violet-400 hover:bg-violet-50">
          <ImageIcon size={18} />

          {uploading
            ? "Uploading..."
            : "Upload header image"}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={onImageUpload}
          />
        </label>

        <p className="mt-2 text-xs text-slate-400">
          JPG, PNG, WebP and other images up to
          5 MB.
        </p>
      </div>

      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        <RotateCcw size={16} />
        Reset appearance
      </button>
    </div>
  );
}
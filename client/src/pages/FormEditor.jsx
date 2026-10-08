import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Eye,
  Link as LinkIcon,
  Menu,
  Palette,
  Plus,
  Save,
  Send,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api";
import QuestionEditor from "../components/QuestionEditor";
import ThemePanel from "../components/ThemePanel";

const blankQuestion = () => ({
  title: "Untitled question",
  description: "",
  type: "short_answer",
  options: [],
  required: false,
});

const defaultTheme = {
  primaryColor: "#673AB7",
  backgroundColor: "#F5F3FF",
  headerImage: "",
};

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [role, setRole] = useState(null);

  const [activePanel, setActivePanel] =
    useState("questions");

  const [saved, setSaved] = useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [shareEmail, setShareEmail] =
    useState("");

  const [shareRole, setShareRole] =
    useState("viewer");

  const [permissions, setPermissions] =
    useState([]);

  const [copied, setCopied] = useState(false);

  const editable =
    role === "owner" ||
    role === "editor";

  const owner = role === "owner";

  async function load() {
    try {
      const { data } = await api.get(
        `/forms/${id}`
      );

      setForm(data.form);
      setRole(data.role);

      if (data.role === "owner") {
        loadPermissions();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not load form"
      );
    }
  }

  async function loadPermissions() {
    try {
      const { data } = await api.get(
        `/forms/${id}/permissions`
      );

      setPermissions(data.permissions);
    } catch {}
  }

  useEffect(() => {
    load();
  }, [id]);

  const shareUrl = useMemo(() => {
    if (!form?.shareId) {
      return "";
    }

    return `${window.location.origin}/forms/public/${form.shareId}`;
  }, [form?.shareId]);

  function updateSection(index, patch) {
    setForm((previous) => {
      const sections = [
        ...previous.sections,
      ];

      sections[index] = {
        ...sections[index],
        ...patch,
      };

      return {
        ...previous,
        sections,
      };
    });

    setSaved(false);
  }

  function updateQuestion(
    sectionIndex,
    questionIndex,
    question
  ) {
    setForm((previous) => {
      const sections = [
        ...previous.sections,
      ];

      const questions = [
        ...sections[sectionIndex].questions,
      ];

      questions[questionIndex] =
        question;

      sections[sectionIndex] = {
        ...sections[sectionIndex],
        questions,
      };

      return {
        ...previous,
        sections,
      };
    });

    setSaved(false);
  }

  function addQuestion(sectionIndex) {
    setForm((previous) => {
      const sections = [
        ...previous.sections,
      ];

      sections[sectionIndex] = {
        ...sections[sectionIndex],

        questions: [
          ...sections[sectionIndex].questions,
          blankQuestion(),
        ],
      };

      return {
        ...previous,
        sections,
      };
    });
  }

  function deleteQuestion(
    sectionIndex,
    questionIndex
  ) {
    setForm((previous) => {
      const sections = [
        ...previous.sections,
      ];

      sections[sectionIndex] = {
        ...sections[sectionIndex],

        questions:
          sections[
            sectionIndex
          ].questions.filter(
            (_, index) =>
              index !== questionIndex
          ),
      };

      return {
        ...previous,
        sections,
      };
    });

    setSaved(false);
  }

  function addSection() {
    setForm((previous) => ({
      ...previous,

      sections: [
        ...previous.sections,

        {
          title: `Section ${
            previous.sections.length + 1
          }`,
          description: "",
          questions: [blankQuestion()],
        },
      ],
    }));

    setSaved(false);
  }

  function deleteSection(index) {
    if (form.sections.length === 1) {
      alert(
        "Your form needs at least one section."
      );
      return;
    }

    setForm((previous) => ({
      ...previous,

      sections:
        previous.sections.filter(
          (_, i) => i !== index
        ),
    }));

    setSaved(false);
  }

  async function save() {
    try {
      await api.put(`/forms/${id}`, {
        title: form.title,
        description: form.description,
        sections: form.sections,
        theme:
          form.theme || defaultTheme,
        template: form.template,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not save form"
      );
    }
  }

  async function publish() {
    try {
      await save();

      const { data } = await api.post(
        `/forms/${id}/publish`
      );

      setForm(data.form);

      alert(
        `Your form is live!\n\n${window.location.origin}/forms/public/${data.shareId}`
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not publish form"
      );
    }
  }

  async function unpublish() {
    try {
      const { data } = await api.post(
        `/forms/${id}/unpublish`
      );

      setForm(data.form);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not unpublish form"
      );
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(
      shareUrl
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function share() {
    if (!shareEmail.trim()) {
      return;
    }

    try {
      await api.post(
        `/forms/${id}/permissions`,
        {
          email: shareEmail,
          role: shareRole,
        }
      );

      setShareEmail("");

      await loadPermissions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not share form"
      );
    }
  }

  async function removePermission(userId) {
    try {
      await api.delete(
        `/forms/${id}/permissions/${userId}`
      );

      loadPermissions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not remove permission"
      );
    }
  }

  async function uploadHeaderImage(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Header image must be 5 MB or smaller."
      );

      return;
    }

    try {
      setUploadingImage(true);

      const body = new FormData();

      body.append("image", file);

      const { data } = await api.post(
        `/forms/${id}/theme-image`,
        body,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setForm(data.form);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Could not upload image"
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function resetTheme() {
    setForm((previous) => ({
      ...previous,

      theme: {
        primaryColor:
          "#673AB7",
        backgroundColor:
          "#F5F3FF",
        headerImage: "",
      },
    }));

    setSaved(false);
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm font-medium text-slate-600 shadow-sm">
          Loading form...
        </div>
      </div>
    );
  }

  const theme =
    form.theme || defaultTheme;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =========================================
          TOP BAR
      ========================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() =>
                navigate("/")
              }
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">
              <input
                value={form.title}
                disabled={!editable}
                onChange={(e) => {
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  });

                  setSaved(false);
                }}
                className="w-56 max-w-full truncate border-none bg-transparent px-1 text-sm font-bold text-slate-900 outline-none focus:ring-0 md:w-80"
              />

              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-slate-400">
                  {form.template ||
                    "blank"}{" "}
                  form
                </span>

                {form.published && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <Check size={12} />
                    Published
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="mr-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
              {role}
            </span>

            <button
              onClick={() =>
                window.open(
                  shareUrl ||
                    `/forms/${id}/preview`,
                  "_blank"
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={16} />
              Preview
            </button>

            {editable && (
              <button
                onClick={save}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {saved ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}

                {saved
                  ? "Saved"
                  : "Save"}
              </button>
            )}

            {owner &&
              !form.published && (
                <button
                  onClick={publish}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                  style={{
                    backgroundColor:
                      theme.primaryColor,
                  }}
                >
                  <Send size={16} />
                  Publish
                </button>
              )}

            {owner &&
              form.published && (
                <button
                  onClick={unpublish}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                >
                  Unpublish
                </button>
              )}
          </div>

          <button
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
            className="rounded-xl p-2 text-slate-500 md:hidden"
          >
            {mobileMenu ? (
              <X />
            ) : (
              <Menu />
            )}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t bg-white p-4 md:hidden">
            <div className="grid gap-2">
              <button
                onClick={save}
                className="rounded-xl border px-4 py-3 text-sm font-semibold"
              >
                Save
              </button>

              {owner &&
                !form.published && (
                  <button
                    onClick={publish}
                    className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Publish
                  </button>
                )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================
          MAIN
      ========================================== */}

      <div className="mx-auto flex max-w-[1500px]">
        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 p-4">
            <nav className="space-y-1">
              <button
                onClick={() =>
                  setActivePanel(
                    "questions"
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activePanel ===
                  "questions"
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Menu size={18} />
                Questions
              </button>

              <button
                onClick={() =>
                  setActivePanel(
                    "appearance"
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activePanel ===
                  "appearance"
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Palette size={18} />
                Appearance
              </button>

              {owner && (
                <button
                  onClick={() =>
                    setActivePanel(
                      "sharing"
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activePanel ===
                    "sharing"
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Users size={18} />
                  Sharing
                </button>
              )}

              {owner && (
                <Link
                  to={`/forms/${id}/responses`}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <BarChart3 size={18} />
                  Responses
                </Link>
              )}

              <button
                onClick={() =>
                  setActivePanel(
                    "settings"
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activePanel ===
                  "settings"
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Settings size={18} />
                Settings
              </button>
            </nav>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Form status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    form.published
                      ? "bg-emerald-500"
                      : "bg-amber-400"
                  }`}
                />

                <span className="text-sm font-semibold text-slate-700">
                  {form.published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
          {/* MOBILE NAV */}

          <div className="mb-5 flex gap-2 overflow-x-auto lg:hidden">
            <button
              onClick={() =>
                setActivePanel(
                  "questions"
                )
              }
              className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              Questions
            </button>

            <button
              onClick={() =>
                setActivePanel(
                  "appearance"
                )
              }
              className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              Appearance
            </button>

            {owner && (
              <button
                onClick={() =>
                  setActivePanel(
                    "sharing"
                  )
                }
                className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm"
              >
                Sharing
              </button>
            )}
          </div>

          {/* QUESTIONS */}

          {activePanel ===
            "questions" && (
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <input
                  value={
                    form.description || ""
                  }
                  disabled={!editable}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    });

                    setSaved(false);
                  }}
                  placeholder="Add a description for your form..."
                  className="w-full border-none bg-transparent px-1 py-2 text-slate-500 outline-none"
                />
              </div>

              <div className="space-y-6">
                {form.sections.map(
                  (section, si) => (
                    <section
                      key={
                        section._id ||
                        si
                      }
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                    >
                      <div className="mb-6 flex items-start gap-3">
                        <div className="flex-1">
                          <input
                            value={
                              section.title
                            }
                            disabled={
                              !editable
                            }
                            onChange={(
                              e
                            ) =>
                              updateSection(
                                si,
                                {
                                  title:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                            className="w-full border-b-2 border-transparent bg-transparent py-2 text-xl font-bold text-slate-900 outline-none focus:border-violet-500"
                          />

                          <input
                            value={
                              section.description ||
                              ""
                            }
                            disabled={
                              !editable
                            }
                            onChange={(
                              e
                            ) =>
                              updateSection(
                                si,
                                {
                                  description:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="Section description"
                            className="mt-1 w-full bg-transparent py-1 text-sm text-slate-500 outline-none"
                          />
                        </div>

                        {editable && (
                          <button
                            onClick={() =>
                              deleteSection(
                                si
                              )
                            }
                            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {section.questions.map(
                          (
                            question,
                            qi
                          ) => (
                            <QuestionEditor
                              key={
                                question._id ||
                                qi
                              }
                              question={
                                question
                              }
                              onChange={(
                                updated
                              ) =>
                                updateQuestion(
                                  si,
                                  qi,
                                  updated
                                )
                              }
                              onDelete={() =>
                                deleteQuestion(
                                  si,
                                  qi
                                )
                              }
                            />
                          )
                        )}
                      </div>

                      {editable && (
                        <button
                          onClick={() =>
                            addQuestion(
                              si
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                        >
                          <Plus
                            size={18}
                          />
                          Add question
                        </button>
                      )}
                    </section>
                  )
                )}
              </div>

              {editable && (
                <button
                  onClick={addSection}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white shadow-lg transition hover:bg-slate-800"
                >
                  <Plus size={18} />
                  Add section
                </button>
              )}
            </div>
          )}

          {/* APPEARANCE */}

          {activePanel ===
            "appearance" && (
            <div className="mx-auto max-w-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Appearance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customize the look and feel
                  of your form.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <ThemePanel
                  theme={theme}
                  onChange={(nextTheme) => {
                    setForm({
                      ...form,
                      theme:
                        nextTheme,
                    });

                    setSaved(false);
                  }}
                  onReset={resetTheme}
                  onImageUpload={
                    uploadHeaderImage
                  }
                  uploading={
                    uploadingImage
                  }
                />
              </div>
            </div>
          )}

          {/* SHARING */}

          {activePanel ===
            "sharing" &&
            owner && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Share your form
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Control who can access and
                    edit your form.
                  </p>
                </div>

                {form.published &&
                  shareUrl && (
                    <div className="mb-6 rounded-3xl border border-violet-200 bg-violet-50 p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-800">
                        <LinkIcon
                          size={17}
                        />
                        Public link
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          readOnly
                          value={shareUrl}
                          className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm"
                        />

                        <button
                          onClick={
                            copyLink
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white"
                        >
                          {copied ? (
                            <Check
                              size={16}
                            />
                          ) : (
                            <Copy
                              size={16}
                            />
                          )}

                          {copied
                            ? "Copied"
                            : "Copy link"}
                        </button>
                      </div>
                    </div>
                  )}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900">
                    People with access
                  </h3>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={shareEmail}
                      onChange={(e) =>
                        setShareEmail(
                          e.target.value
                        )
                      }
                      placeholder="Enter registered user's email"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                    />

                    <select
                      value={
                        shareRole
                      }
                      onChange={(e) =>
                        setShareRole(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <option value="viewer">
                        Viewer
                      </option>

                      <option value="editor">
                        Editor
                      </option>
                    </select>

                    <button
                      onClick={
                        share
                      }
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-6 divide-y">
                    {permissions.map(
                      (permission) => (
                        <div
                          key={
                            permission._id
                          }
                          className="flex items-center justify-between py-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {
                                permission
                                  .user
                                  ?.name
                              }
                            </p>

                            <p className="text-sm text-slate-400">
                              {
                                permission
                                  .user
                                  ?.email
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                              {
                                permission.role
                              }
                            </span>

                            <button
                              onClick={() =>
                                removePermission(
                                  permission
                                    .user
                                    ?._id
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {permissions.length ===
                      0 && (
                      <div className="py-10 text-center text-sm text-slate-400">
                        No one else has
                        access yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* SETTINGS */}

          {activePanel ===
            "settings" && (
            <div className="mx-auto max-w-3xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Settings
                    className="text-violet-600"
                  />

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Form settings
                    </h2>

                    <p className="text-sm text-slate-500">
                      More settings can be added
                      here later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
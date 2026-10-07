import crypto from "crypto";
import Form from "../models/Form.js";
import FormPermission from "../models/FormPermission.js";
import Response from "../models/Response.js";
import User from "../models/User.js";
import { getFormAccess, canEdit } from "../utils/access.js";

export async function createForm(req, res) {
  try {
    const form = await Form.create({
      title: req.body.title || "Untitled Form",
      description: req.body.description || "",
      owner: req.user._id,
      sections: [
        {
          title: "Section 1",
          description: "",
          questions: [
            {
              title: "Untitled question",
              type: "short_answer",
              required: false
            }
          ]
        }
      ]
    });

    res.status(201).json({ form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function myForms(req, res) {
  const owned = await Form.find({ owner: req.user._id }).sort({ updatedAt: -1 });

  const permissions = await FormPermission.find({ user: req.user._id }).populate("form");
  const shared = permissions.map((p) => ({
    ...p.form.toObject(),
    accessRole: p.role
  }));

  res.json({ owned, shared });
}

export async function getForm(req, res) {
  try {
    console.log("\n========== GET FORM DEBUG ==========");

    console.log("REQ USER:", req.user?._id?.toString());
    console.log("FORM ID:", req.params.id);

    const form = await Form.findById(req.params.id);

    if (!form) {
      console.log("FORM NOT FOUND");
      return res.status(404).json({ message: "Form not found" });
    }

    console.log("FORM OWNER:", form.owner?.toString());
    console.log("PUBLISHED:", form.published);

    const role = await getFormAccess(form, req.user?._id);

    console.log("ROLE:", role);

    if (!form.published && !role) {
      console.log("❌ ACCESS DENIED");
      return res.status(403).json({
        message: "This form is not public",
        debug: {
          userId: req.user?._id?.toString(),
          ownerId: form.owner?.toString(),
          role
        }
      });
    }

    console.log("✅ ACCESS GRANTED");
    console.log("====================================\n");

    await form.populate("owner", "name email");

    res.json({ form, role });
  } catch (error) {
    console.error("GET FORM ERROR:", error);
    res.status(500).json({ message: error.message });
  }
}
export async function getPublicForm(req, res) {
  const form = await Form.findOne({
    shareId: req.params.shareId,
    published: true
  }).select("-owner");

  if (!form) return res.status(404).json({ message: "Published form not found" });
  res.json({ form });
}

export async function updateForm(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  const role = await getFormAccess(form, req.user._id);
  if (!canEdit(role))
    return res.status(403).json({ message: "You do not have edit permission" });

  const { title, description, sections } = req.body;
  form.title = title ?? form.title;
  form.description = description ?? form.description;
  form.sections = sections ?? form.sections;
  await form.save();

  res.json({ form });
}

export async function publishForm(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only the owner can publish" });

  if (!form.shareId) form.shareId = crypto.randomBytes(8).toString("hex");
  form.published = true;
  await form.save();

  res.json({
    message: "Form published",
    shareId: form.shareId,
    form
  });
}

export async function unpublishForm(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only the owner can unpublish" });

  form.published = false;
  await form.save();
  res.json({ message: "Form unpublished", form });
}

export async function deleteForm(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only the owner can delete" });

  await Promise.all([
    Form.deleteOne({ _id: form._id }),
    FormPermission.deleteMany({ form: form._id }),
    Response.deleteMany({ form: form._id })
  ]);

  res.json({ message: "Form deleted" });
}

export async function shareForm(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only the owner can manage permissions" });

  const { email, role } = req.body;
  if (!["editor", "viewer"].includes(role))
    return res.status(400).json({ message: "Invalid role" });

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return res.status(404).json({ message: "That user is not registered" });
  if (user._id.toString() === req.user._id.toString())
    return res.status(400).json({ message: "Owner already has full access" });

  const permission = await FormPermission.findOneAndUpdate(
    { form: form._id, user: user._id },
    { role },
    { upsert: true, new: true }
  ).populate("user", "name email");

  res.json({ permission });
}

export async function permissions(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only owner can view permissions" });

  const list = await FormPermission.find({ form: form._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({ permissions: list });
}

export async function removePermission(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  if (form.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Only owner can remove access" });

  await FormPermission.deleteOne({
    form: form._id,
    user: req.params.userId
  });

  res.json({ message: "Access removed" });
}

export async function submitResponse(req, res) {
  const form = await Form.findOne({
    shareId: req.params.shareId,
    published: true
  });

  if (!form) return res.status(404).json({ message: "Form not found" });

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const validIds = new Set(
    form.sections.flatMap((s) => s.questions.map((q) => q._id.toString()))
  );

  const cleanAnswers = answers.filter(
    (a) => a && validIds.has(String(a.questionId))
  );

  const response = await Response.create({
    form: form._id,
    respondent: req.user?._id || null,
    answers: cleanAnswers
  });

  res.status(201).json({ message: "Response submitted", responseId: response._id });
}

export async function responses(req, res) {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: "Form not found" });

  const role = await getFormAccess(form, req.user._id);
  if (role !== "owner" && role !== "editor")
    return res.status(403).json({ message: "No permission to view responses" });

  const data = await Response.find({ form: form._id })
    .populate("respondent", "name email")
    .sort({ createdAt: -1 });

  res.json({ responses: data });
}

import crypto from "crypto";
import fs from "fs/promises";

import Form from "../models/Form.js";
import FormPermission from "../models/FormPermission.js";
import Response from "../models/Response.js";

import {
  getFormAccess,
  canEdit,
} from "../utils/access.js";

import { getTemplate } from "../utils/formTemplates.js";
import User from "../models/User.js";

// ==========================================
// CREATE FORM
// ==========================================

export async function createForm(req, res) {
  try {
    const templateName = req.body.template || "blank";

    const template = getTemplate(templateName);

    const form = await Form.create({
      title:
        req.body.title?.trim() ||
        template.title,

      description:
        req.body.description ??
        template.description,

      owner: req.user._id,

      template: templateName,

      theme: template.theme,

      sections: template.sections,
    });

    res.status(201).json({
      form,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// MY FORMS
// ==========================================

export async function myForms(req, res) {
  try {
    const owned = await Form.find({
      owner: req.user._id,
    }).sort({
      updatedAt: -1,
    });

    const permissions = await FormPermission.find({
      user: req.user._id,
    })
      .populate("form")
      .sort({
        createdAt: -1,
      });

    const shared = permissions
      .filter((p) => p.form)
      .map((p) => ({
        ...p.form.toObject(),
        accessRole: p.role,
      }));

    res.json({
      owned,
      shared,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// GET FORM
// ==========================================

export async function getForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    const role = await getFormAccess(
      form,
      req.user?._id
    );

    if (!form.published && !role) {
      return res.status(403).json({
        message: "This form is not public",
      });
    }

    await form.populate("owner", "name email");

    res.json({
      form,
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// PUBLIC FORM
// ==========================================

export async function getPublicForm(req, res) {
  try {
    const form = await Form.findOne({
      shareId: req.params.shareId,
      published: true,
    }).select("-owner");

    if (!form) {
      return res.status(404).json({
        message: "Published form not found",
      });
    }

    res.json({
      form,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// UPDATE FORM
// ==========================================

export async function updateForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    const role = await getFormAccess(
      form,
      req.user._id
    );

    if (!canEdit(role)) {
      return res.status(403).json({
        message: "You do not have edit permission",
      });
    }

    const {
      title,
      description,
      sections,
      theme,
      template,
    } = req.body;

    if (title !== undefined) {
      form.title = title;
    }

    if (description !== undefined) {
      form.description = description;
    }

    if (sections !== undefined) {
      form.sections = sections;
    }

    if (theme !== undefined) {
      form.theme = {
        ...form.theme?.toObject?.(),
        ...theme,
      };
    }

    if (template !== undefined) {
      form.template = template;
    }

    await form.save();

    res.json({
      form,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// PUBLISH
// ==========================================

export async function publishForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the owner can publish",
      });
    }

    if (!form.shareId) {
      form.shareId =
        crypto.randomBytes(8).toString("hex");
    }

    form.published = true;

    await form.save();

    res.json({
      message: "Form published",
      shareId: form.shareId,
      form,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// UNPUBLISH
// ==========================================

export async function unpublishForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the owner can unpublish",
      });
    }

    form.published = false;

    await form.save();

    res.json({
      message: "Form unpublished",
      form,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the owner can delete",
      });
    }

    await Promise.all([
      Form.deleteOne({
        _id: form._id,
      }),

      FormPermission.deleteMany({
        form: form._id,
      }),

      Response.deleteMany({
        form: form._id,
      }),
    ]);

    res.json({
      message: "Form deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// SHARE FORM
// ==========================================

export async function shareForm(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the owner can manage permissions",
      });
    }

    const { email, role } = req.body;

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findOne({
      email: email?.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message:
          "That user is not registered",
      });
    }

    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Owner already has full access",
      });
    }

    const permission =
      await FormPermission.findOneAndUpdate(
        {
          form: form._id,
          user: user._id,
        },
        {
          role,
        },
        {
          upsert: true,
          new: true,
        }
      ).populate("user", "name email");

    res.json({
      permission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// PERMISSIONS
// ==========================================

export async function permissions(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only owner can view permissions",
      });
    }

    const list = await FormPermission.find({
      form: form._id,
    })
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    res.json({
      permissions: list,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// REMOVE PERMISSION
// ==========================================

export async function removePermission(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (
      form.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only owner can remove access",
      });
    }

    await FormPermission.deleteOne({
      form: form._id,
      user: req.params.userId,
    });

    res.json({
      message: "Access removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// UPLOAD RESPONSE FILE
// ==========================================

export async function uploadResponseFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const form = await Form.findOne({
      shareId: req.params.shareId,
      published: true,
    });

    if (!form) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(404).json({
        message: "Form not found",
      });
    }

    const questionId = String(
      req.body.questionId || ""
    );

    const question = form.sections
      .flatMap((section) => section.questions)
      .find(
        (question) =>
          question._id.toString() === questionId
      );

    if (!question) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        message: "Invalid question",
      });
    }

    if (question.type !== "file_upload") {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        message:
          "This question does not accept files",
      });
    }

    const url =
      `${req.protocol}://${req.get("host")}` +
      `/uploads/${req.file.filename}`;

    res.json({
      file: {
        url,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// UPLOAD FORM HEADER IMAGE
// ==========================================

export async function uploadThemeImage(req, res) {
  try {
    const form = await Form.findById(
      req.params.id
    );

    if (!form) {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      return res.status(404).json({
        message: "Form not found",
      });
    }

    const role = await getFormAccess(
      form,
      req.user._id
    );

    if (!canEdit(role)) {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      return res.status(403).json({
        message: "You cannot edit this form",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const url =
      `${req.protocol}://${req.get("host")}` +
      `/uploads/${req.file.filename}`;

    form.theme.headerImage = url;

    await form.save();

    res.json({
      message: "Header image updated",
      form,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// SUBMIT RESPONSE
// ==========================================

export async function submitResponse(req, res) {
  try {
    const form = await Form.findOne({
      shareId: req.params.shareId,
      published: true,
    });

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    const answers = Array.isArray(req.body.answers)
      ? req.body.answers
      : [];

    const validQuestions = form.sections.flatMap(
      (section) => section.questions
    );

    const validIds = new Set(
      validQuestions.map((q) =>
        q._id.toString()
      )
    );

    const cleanAnswers = answers.filter(
      (answer) =>
        answer &&
        validIds.has(String(answer.questionId))
    );

    // Required question validation
    for (const question of validQuestions) {
      if (!question.required) {
        continue;
      }

      const answer = cleanAnswers.find(
        (item) =>
          String(item.questionId) ===
          question._id.toString()
      );

      const value = answer?.value;

      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) &&
          value.length === 0);

      if (empty) {
        return res.status(400).json({
          message:
            `Please answer: ${question.title}`,
        });
      }
    }

    const response = await Response.create({
      form: form._id,
      respondent: req.user?._id || null,
      answers: cleanAnswers,
    });

    res.status(201).json({
      message: "Response submitted",
      responseId: response._id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
}

// ==========================================
// GET RESPONSES
// ==========================================

export async function responses(req, res) {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    const role = await getFormAccess(
      form,
      req.user._id
    );

    if (
      role !== "owner" &&
      role !== "editor"
    ) {
      return res.status(403).json({
        message:
          "No permission to view responses",
      });
    }

    const data = await Response.find({
      form: form._id,
    })
      .populate(
        "respondent",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      responses: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
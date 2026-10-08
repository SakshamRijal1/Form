import express from "express";

import {
  createForm,
  myForms,
  getForm,
  getPublicForm,
  updateForm,
  publishForm,
  unpublishForm,
  deleteForm,
  shareForm,
  permissions,
  removePermission,
  uploadResponseFile,
  uploadThemeImage,
  submitResponse,
  responses,
} from "../controllers/formController.js";

import { requireAuth } from "../middleware/auth.js";

import {
  responseUpload,
  imageUpload,
  singleUpload,
} from "../middleware/upload.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get(
  "/public/:shareId",
  getPublicForm
);

router.post(
  "/public/:shareId/upload",
  singleUpload(responseUpload, "file"),
  uploadResponseFile
);

router.post(
  "/public/:shareId/responses",
  submitResponse
);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

router.use(requireAuth);

router.get(
  "/mine",
  myForms
);

router.post(
  "/",
  createForm
);

router.get(
  "/:id",
  getForm
);

router.put(
  "/:id",
  updateForm
);

router.post(
  "/:id/publish",
  publishForm
);

router.post(
  "/:id/unpublish",
  unpublishForm
);

router.delete(
  "/:id",
  deleteForm
);

router.post(
  "/:id/permissions",
  shareForm
);

router.get(
  "/:id/permissions",
  permissions
);

router.delete(
  "/:id/permissions/:userId",
  removePermission
);

router.post(
  "/:id/theme-image",
  singleUpload(imageUpload, "image"),
  uploadThemeImage
);

router.get(
  "/:id/responses",
  responses
);

export default router;
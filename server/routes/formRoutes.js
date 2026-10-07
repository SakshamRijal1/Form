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
  submitResponse,
  responses
} from "../controllers/formController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/mine", requireAuth, myForms);
router.post("/", requireAuth, createForm);

router.get("/public/:shareId", getPublicForm);
router.post("/public/:shareId/responses", submitResponse);

router.get("/:id", requireAuth, getForm);
router.put("/:id", requireAuth, updateForm);
router.post("/:id/publish", requireAuth, publishForm);
router.post("/:id/unpublish", requireAuth, unpublishForm);
router.delete("/:id", requireAuth, deleteForm);

router.get("/:id/permissions", requireAuth, permissions);
router.post("/:id/permissions", requireAuth, shareForm);
router.delete("/:id/permissions/:userId", requireAuth, removePermission);

router.get("/:id/responses", requireAuth, responses);

export default router;

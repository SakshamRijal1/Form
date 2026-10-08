import FormPermission from "../models/FormPermission.js";

export async function getFormAccess(form, userId) {
  if (!userId) {
    return "public";
  }

  const ownerId = form.owner?._id || form.owner;

  if (
    ownerId &&
    ownerId.toString() === userId.toString()
  ) {
    return "owner";
  }

  const permission = await FormPermission.findOne({
    form: form._id,
    user: userId,
  });

  return permission?.role || null;
}

export function canEdit(role) {
  return role === "owner" || role === "editor";
}
import express from "express";
import passport from "passport";

import {
  register,
  login,
  googleSuccess,
  getMe,
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ===============================
// NORMAL AUTHENTICATION
// ===============================

router.post("/register", register);

router.post("/login", login);


// ===============================
// GOOGLE AUTHENTICATION
// ===============================

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: false,
  }),
  googleSuccess
);

router.get("/google/failure", (req, res) => {
  res.redirect(
    `${process.env.CLIENT_URL}/login?error=google_auth_failed`
  );
});


// ===============================
// CURRENT USER
// ===============================

router.get("/me", requireAuth, getMe);


// ===============================
// EXPORT
// ===============================

export default router;
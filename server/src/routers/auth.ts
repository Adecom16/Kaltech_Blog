import express from "express";
import {
  googleAuth,
  logout,
  tokenRefresh,
  emailLogin,
  emailRegister,
} from "../controllers/auth.controller";
import { validateRegistration } from "../middlewares/validation";
const router = express.Router();

router.route("/google/oauth").get(googleAuth);

router.route("/register").post(validateRegistration, emailRegister);

router.route("/login").post(emailLogin);

router.route("/logout").post(logout);

router.route("/token").post(tokenRefresh);

export default router;

import express, { Express } from "express";

import {
  activateUserAccount,
  createUserAccount,
  forgotPassword,
  GoogleLogin,
  Login,
  resendActivationToken,
  resetPassword,
} from "../controllers/usersController";
import { profile } from "../../utils/profileUpload";
import {
  getProfileByID,
  uploadProfile,
} from "../controllers/profileController";
const router = express.Router();

router.post("/auth/user", createUserAccount);
router.post("/auth/verify/:token", activateUserAccount);
router.post("/auth/resend", resendActivationToken);
router.post("/auth/login", Login);
router.post("/auth/google/:googleIdToken", GoogleLogin);
router.post("/auth/forgot", forgotPassword);
router.put("/auth/resetpassword/:token", resetPassword);
router.post("/profile/:userid", profile.single("image"), uploadProfile);
router.get("/profile/:id", getProfileByID);

export default router;

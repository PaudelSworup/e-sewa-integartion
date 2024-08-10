import express, { Express } from "express";

import {
  activateUserAccount,
  createUserAccount,
  forgotPassword,
  Login,
  resendActivationToken,
  resetPassword,
} from "../controllers/usersController";
const router = express.Router();

router.post("/auth/user", createUserAccount);
router.post("/auth/verify/:token", activateUserAccount);
router.post("/auth/resend", resendActivationToken);
router.post("/auth/login", Login);
router.post("/auth/forgot", forgotPassword);
router.put("/auth/resetpassword/:token", resetPassword);

export default router;

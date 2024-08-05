import express, { Express } from "express";

import {
  activateUserAccount,
  createUserAccount,
  Login,
  resendActivationToken,
} from "../controllers/usersController";
const router = express.Router();

router.post("/auth/user", createUserAccount);
router.post("/auth/verify/:token", activateUserAccount);
router.post("/auth/resend", resendActivationToken);
router.post("/auth/login", Login);

export default router;

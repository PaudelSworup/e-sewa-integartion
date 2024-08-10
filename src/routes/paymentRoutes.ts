import express, { Express } from "express";
import {
  completePayment,
  sendStripeApi,
} from "../controllers/paymentController";

const router = express.Router();

router.get("/complete-payment", completePayment);
router.get("/stripe/api", sendStripeApi);

export default router;

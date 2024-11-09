import express, { Express } from "express";
import {
  completePayment,
  paymentInfo,
  sendStripeApi,
  // stripeMobile,
} from "../controllers/paymentController";

const router = express.Router();

router.get("/complete-payment", completePayment);
router.get("/stripe/api", sendStripeApi);
router.get("/payment/info/:user", paymentInfo);
// router.post("/create-payment-intent", stripeMobile);

export default router;

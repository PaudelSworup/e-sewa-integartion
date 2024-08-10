import express, { Express } from "express";
import { completePayment } from "../controllers/paymentController";


const router = express.Router();

router.get("/complete-payment", completePayment);


export default router;

import express, { Express } from "express";

import { createOrder } from "../controllers/orderController";

const router = express.Router();

router.post("/order/create", createOrder);

export default router;

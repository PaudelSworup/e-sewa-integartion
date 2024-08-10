import express from "express";
import { getProducts, getProductsById } from "../controllers/productController";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductsById);

export default router;

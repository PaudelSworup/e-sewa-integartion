import express from "express";
import {
  getCategories,
  getProducts,
  getProductsById,
} from "../controllers/productController";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductsById);
router.get("/cat", getCategories);

export default router;

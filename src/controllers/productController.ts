import { Request, Response } from "express";
import {
  getAllCategories,
  getAllProucts,
  getProuctById,
} from "../../services/FetchAPI";
import { redisClient } from "../../services/redisClient";

export const getProducts = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  const cacheKey = "allProducts";
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res
        .status(STATUS_CODE)
        .json({ success: true, products: JSON.parse(cachedData) });
    }

    const product = await getAllProucts();
    if (!product) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }

    // stroing the product json in redis for caching
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));

    return res.status(STATUS_CODE).json({ success: true, products: product });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

export const getProductsById = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  const cacheKey = `product:${req.params.id}`;
  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res
        .status(STATUS_CODE)
        .json({ success: true, products: JSON.parse(cachedData) });
    }

    const product = await getProuctById(req.params.id);

    if (!product) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));

    return res.status(STATUS_CODE).json({ success: true, products: product });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  const cacheKey = "categories";
  let STATUS_CODE = 200;
  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res
        .status(STATUS_CODE)
        .json({ success: true, products: JSON.parse(cachedData) });
    }

    const categories = await getAllCategories();
    if (!categories) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));

    return res.status(STATUS_CODE).json({ success: true, categories });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

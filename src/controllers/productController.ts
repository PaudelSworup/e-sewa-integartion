import { Request, Response } from "express";
import { getAllProucts, getProuctById } from "../../services/FetchAPI";

export const getProducts = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  try {
    const product = await getAllProucts();
    if (!product) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }
    return res.status(STATUS_CODE).json({ success: true, products: product });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

export const getProductsById = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  try {
    const product = await getProuctById(req.params.id);
    if (!product) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }
    return res.status(STATUS_CODE).json({ success: true, products: product });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

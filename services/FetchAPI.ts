import axios from "axios";
export const getAllProucts = async () => {
  const products = await axios(`${process.env.BASE_URL}/products`);
  const response = await products.data;
  return response;
};

export const getProuctById = async (id: any) => {
  const products = await axios(`${process.env.BASE_URL}/products/${id}`);
  const response = await products.data;
  return response;
};

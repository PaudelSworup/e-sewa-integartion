export const getAllProucts = async () => {
  const product = await fetch(`${process.env.BASE_URL}/products`);
  const response = await product.json();
  return response;
};

export const getProuctById = async (id: any) => {
  const products = await fetch(`${process.env.BASE_URL}/products/${id}`);
  const response = await products.json();
  return response;
};

export const getAllCategories = async () => {
  const categories = await fetch(
    "https://fakestoreapi.com/products/categories"
  );
  const response = await categories.json();
  return response;
};

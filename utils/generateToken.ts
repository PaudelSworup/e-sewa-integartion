import jwt from "jsonwebtoken";

export const generateToken = (userId: any) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET ?? "");
};

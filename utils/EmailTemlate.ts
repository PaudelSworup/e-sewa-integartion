import path from "path";
import fs from "fs";
import { sendOrdredEmail } from "./SendMail";
export const generateEmailTemplate = (
  userName: string,
  orderId: string,
  totalPrice: string,
  orderItemsHTML: string,
  shippingAddress1: string,
  city: string,
  country: string,
  zip: string,
  phone: string,
  email: string
): any => {
  const emailTemplatePath = path.join(process.cwd(), "public", "email.html");
  let emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

  emailTemplate = emailTemplate
    .replace("[Customer Name]", userName)
    .replace("[Order Number]", orderId)
    .replace("[Total Price]", totalPrice)
    .replace("[Product Name]", orderItemsHTML)
    .replace("[Name]", userName)
    .replace("[Address]", shippingAddress1)
    .replace("[City]", city)
    .replace("[State]", country)
    .replace("[ZIP]", zip)
    .replace("[Phone]", phone);

  sendOrdredEmail({
    from: "e-store <estorenep@gmail.com>",
    to: email,
    subject: "Order Confirmation",
    html: emailTemplate,
  });

  //   return emailTemplate;
};

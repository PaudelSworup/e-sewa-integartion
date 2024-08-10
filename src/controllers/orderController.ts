import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import orderItemSchema from "../models/order-Item";
import { getEsewaPaymentHash } from "../../services/Esewa";
import { stripePaymentGateway } from "../../services/StripePaymentGateway";
import { sendOrdredEmail } from "../../utils/SendMail";
import userSchema from "../models/authModel";
import fs from "fs";
import path from "path";

export const createOrder = async (req: Request, res: Response) => {
  const paymentMethod = req.query.mode as string;

  let STATUS_CODE = 201;
  let paymentInitiate: any = null;

  try {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem: any) => {
        let newOrderItem = new orderItemSchema({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    const orderItemIdResolved = await orderItemsIds;

    const savedOrderItems = await orderItemSchema.find({
      _id: { $in: orderItemIdResolved },
    });

    const totalPrice = savedOrderItems
      .reduce((total, item) => {
        const product = item.product;
        const price = product.price;
        return total + item.quantity * price;
      }, 0)
      .toFixed(2);

    let order = new orderSchema({
      orderItems: orderItemIdResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      totalPrice: parseFloat(totalPrice),
      phone: req.body.phone,
      user: req.body.user,
    });

    order = await order.save();

    if (!order) {
      STATUS_CODE = 400;
      throw new Error("something went wrong");
    }

    if (paymentMethod === "esewa") {
      paymentInitiate = await getEsewaPaymentHash({
        amount: order.totalPrice,
        transaction_uuid: order._id,
      });
    }

    if (paymentMethod === "stripe") {
      const paymentSession = await stripePaymentGateway(order);
      paymentInitiate = paymentSession.id;
    }

    console.log("sending mail....");

    let user = await userSchema.findOne({ _id: req.body.user });

    const emailTemplatePath = path.join(process.cwd(), "public", "email.html");

    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

    // Generate Order Items HTML
    const orderItemsHTML = savedOrderItems
      .map(
        (item) =>
          `
      <tr>
        <td>${item.product.title}</td>
        <td>${item.quantity}</td>
        <td>${item.product.price}</td>
      </tr>
    `
      )
      .join("");

    emailTemplate = emailTemplate
      .replace("[Customer Name]", user?.fullname ?? "")
      .replace("[Order Number]", order._id.toString())
      .replace("[Total Price]", totalPrice)
      .replace("[Product Name]", orderItemsHTML)
      .replace("[Name]", user?.fullname ?? "")
      .replace("[Address]", `${order.shippingAddress1}`)
      .replace("[City]", order.city)
      .replace("[State]", order.country)
      .replace("[ZIP]", String(order.zip))
      .replace("[Phone]", String(order.phone));
    // .replace('[Order Details URL]', orderDetailsURL);

    sendOrdredEmail({
      from: "e-store <estorenep@gmail.com>",
      to: user?.email ?? "",
      subject: "order confirmation",
      html: emailTemplate,
    });

    return res
      .status(STATUS_CODE)
      .json({ success: true, order, payment: paymentInitiate });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

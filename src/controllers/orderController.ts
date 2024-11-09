import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import orderItemSchema from "../models/order-Item";
import { getEsewaPaymentHash } from "../../services/Esewa";
import {
  stripeMobileService,
  stripePaymentGateway,
} from "../../services/StripePaymentGateway";
import { sendOrdredEmail } from "../../utils/SendMail";
import userSchema from "../models/authModel";
import fs from "fs";
import path from "path";
import { generateEmailTemplate } from "../../utils/EmailTemlate";

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

    console.log("...here");

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

    if (paymentMethod === "stripemobile") {
      const mobilePayment = await stripeMobileService(order);
      paymentInitiate = mobilePayment;
    }

    // let user = await userSchema.findOne({ _id: req.body.user });

    // const orderItemsHTML = savedOrderItems
    //   .map(
    //     (item) =>
    //       `
    //   <tr>
    //     <td>${item.product.title}</td>
    //     <td>${item.quantity}</td>
    //     <td>${item.product.price}</td>
    //   </tr>
    // `
    //   )
    //   .join("");

    // generateEmailTemplate(
    //   user?.fullname ?? "",
    //   order._id.toString(),
    //   totalPrice,
    //   orderItemsHTML,
    //   order.shippingAddress1,
    //   order.city,
    //   order.country,
    //   String(order.zip),
    //   String(order.phone),
    //   user?.email ?? ""
    // );

    return res
      .status(STATUS_CODE)
      .json({ success: true, order, payment: paymentInitiate });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

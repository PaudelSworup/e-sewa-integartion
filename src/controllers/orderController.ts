import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import orderItemSchema from "../models/order-Item";
import { getEsewaPaymentHash } from "../../services/Esewa";

export const createOrder = async (req: Request, res: Response) => {
  let STATUS_CODE = 201;
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

    const paymentInitiate = await getEsewaPaymentHash({
      amount: order.totalPrice,
      transaction_uuid: order._id,
    });

    if (!order) {
      STATUS_CODE = 400;
      throw new Error("something went wrong");
    }

    return res
      .status(STATUS_CODE)
      .json({ success: true, order, payment: paymentInitiate, id: order._id });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

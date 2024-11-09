import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import orderItem from "../models/order-Item";
import { verifyEsewaPayment } from "../../services/Esewa";
import Payment from "../models/paymentSchema";
import { convertDate } from "../../utils/NeplaiDateFormatter";
import orderItemModel from "../models/order-Item";
import Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(KEY);

export const completePayment = async (req: Request, res: Response) => {
  const { data } = req.query;
  console.log(data);
  let STATUS_CODE = 201;
  try {
    const paymentInfo = await verifyEsewaPayment(data);
    console.log(paymentInfo);

    if (!paymentInfo || paymentInfo.decodedData.status !== "COMPLETE") {
      STATUS_CODE = 400;
      throw new Error("Payment verification failed");
    }

    const orderedItem = await orderSchema.findById(
      paymentInfo.decodedData.transaction_uuid
    );

    if (!orderedItem) {
      STATUS_CODE = 404;
      throw new Error("Order not found");
    }

    const paymentData = await Payment.create({
      pidx: paymentInfo.decodedData.transaction_code,
      transactionId: paymentInfo.decodedData.transaction_code,
      productId: paymentInfo.decodedData.transaction_uuid,
      amount: orderedItem.totalPrice,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "esewa",
      status: paymentInfo.decodedData.status,
      user: orderedItem.user,
    });

    if (paymentData) {
      return res.status(STATUS_CODE).json({
        success: true,
        message: "Payment successful",
        paymentInfo,
      });
    }

    // return res.redirect(`${process.env.FRONT_URL}/success`);
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ status: false, error: err });
  }
};

export const sendStripeApi = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      stripeApiKey: process.env.STRIPE_API_KEY,
    });
  } catch (err: any) {}
};

export const paymentInfo = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  try {
    const paymentInfo = await Payment.find({ user: req.params.user }).populate(
      "productId"
    );

    if (!paymentInfo) {
      STATUS_CODE = 400;
      throw new Error("something went wrong");
    }

    const paymentDetails = await Promise.all(
      paymentInfo.map(async (payment) => {
        // Fetch order items data concurrently
        const orderItems = await Promise.all(
          payment.productId.orderItems.map(async (item: any) => {
            const orderData = await orderItem
              .findById(item)
              .select("-createdAt -updatedAt"); // Ensure you use the correct model name here
            return orderData;
          })
        );

        return {
          _id: payment._id,
          transactionId: payment.transactionId,
          productId: payment.productId._id,
          orderItems,
          transactionDate: convertDate(payment.paymentDate.toString()),
        };
      })
    );

    return res.status(STATUS_CODE).json({ success: true, paymentDetails });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ status: false, error: err.message });
  }
};

// export const stripeMobile = async (req: Request, res: Response) => {
//   let STATUS_CODE = 201;
//   const { orderItems, totalPrice } = req.body;
//   console.log(orderItems, totalPrice);
//   try {
//     const customer = await stripe.customers.create({
//       email: "abc@gmail.com",
//       name: "Rajji_Shyamaji_stores",
//       description: `details of your order:`,
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalPrice * 100,
//       currency: "npr",
//       customer: customer.id,
//       receipt_email: "Rajjishyamaji@gmail.com",
//       // description: `product is ${lineItems}`,
//     });
//     const clientSecret = paymentIntent.client_secret;

//     // const payment = await

//     return res.status(STATUS_CODE).json({
//       success: true,
//       clientSecret: clientSecret,
//       customer: customer.id,
//     });
//   } catch (err: any) {
//     return res.status(STATUS_CODE).json({ status: false, error: err });
//   }
// };

// export const stripeMobile = async (req: Request, res: Response) => {
//   let STATUS_CODE = 201;
//   const { orderItems, totalPrice, email, customerName } = req.body; // Assume these are sent from the mobile app
//   console.log(orderItems, totalPrice);

//   try {
//     // Create a customer with Stripe
//     const customer = await stripe.customers.create({
//       email,
//       name: customerName || "Rajji_Shyamaji_stores",
//       description: "payment of items",
//     });

//     // Serialize order items to be included in metadata
//     const metadata = orderItems.reduce((acc: any, item: any, index: number) => {
//       console.log(item);
//       acc[`item_${index}_name`] = item.title;
//       acc[`item_${index}_quantity`] = item.quantity.toString();
//       acc[`item_${index}_price`] = item.price.toString();
//       return acc;
//     }, {});

//     // Create a payment intent with product info in metadata
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalPrice * 100, // Stripe expects the amount in the smallest currency unit
//       currency: "npr",
//       customer: customer.id,
//       receipt_email: email,
//       metadata: {
//         ...metadata,
//         order_total: totalPrice.toString(),
//       },
//     });

//     console.log(paymentIntent);

//     // Return client secret for confirming payment on the mobile app
//     return res.status(STATUS_CODE).json({
//       success: true,
//       clientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ status: false, error: err.message });
//   }
// };

import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import { verifyEsewaPayment } from "../../services/Esewa";
import Payment from "../models/paymentSchema";

export const completePayment = async (req: Request, res: Response) => {
  const { data } = req.query;
  let STATUS_CODE = 201;
  try {
    const paymentInfo = await verifyEsewaPayment(data);
    // console.log(paymentInfo);

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

    // if(paymentData){

    // }

    return res.redirect(`${process.env.FRONT_URL}/success`);

    // return res.status(STATUS_CODE).json({
    //   success: true,
    //   message: "Payment successful",
    //   paymentData,
    // });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ status: false, error: err });
  }
};

export const sendStripeApi = async (req: Request, res: Response) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
};

import { Request, Response } from "express";
import orderSchema from "../models/orderModel";
import { verifyEsewaPayment } from "../../services/Esewa";
import Payment from "../models/paymentSchema";
export const completePayment = async (req: Request, res: Response) => {
  const { data } = req.query;

  console.log(data);
  let STATUS_CODE = 201;
  //   console.log(req.body.userId);

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

    return res.status(STATUS_CODE).json({
      success: true,
      message: "Payment successful",
      paymentData,
    });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ status: false, error: err });
  }
  //   const orderedItem = await orderSchema.find({user:user});
  //   console.log(orderedItem);
};

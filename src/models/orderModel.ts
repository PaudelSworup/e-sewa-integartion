import mongoose, { Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

interface IOrder {
  orderItems: any;
  shippingAddress1: string;
  shippingAddress2?: string;
  city: string;
  zip: number;
  country: string;
  phone: number;
  status: string;
  totalPrice: number;
  user: any;
  dateOrdered: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
  orderItems: [
    {
      type: ObjectId,
      required: true,
      ref: "OrderItem",
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    default: "Nepal",
  },
  phone: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now(),
  },
});

const orderModel: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default orderModel;

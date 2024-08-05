import mongoose, { Model } from "mongoose";
export interface IOrderItem {
  quantity: number;
  product: any;
}

const orderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    quantity: {
      type: Number,
      required: true,
    },

    product: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const orderItemModel: Model<IOrderItem> = mongoose.model<IOrderItem>(
  "OrderItem",
  orderItemSchema
);

export default orderItemModel;

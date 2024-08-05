import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

interface IPayment extends Document {
  transactionId: string;
  pidx: string;
  productId: any;
  amount: number;
  dataFromVerificationReq: Record<string, any>;
  apiQueryFromUser: Record<string, any>;
  paymentGateway: "khalti" | "esewa" | "connectIps";
  status: "success" | "pending" | "failed";
  paymentDate: Date;
  user: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    transactionId: { type: String, unique: true },
    pidx: { type: String, unique: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchasedItem",
      required: true,
    },
    amount: { type: Number, required: true },
    dataFromVerificationReq: { type: Object },
    apiQueryFromUser: { type: Object },
    paymentGateway: {
      type: String,
      enum: ["khalti", "esewa", "connectIps"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "COMPLETE",
        "PENDING",
        "FULL_REFUND",
        "PARTIAL_REFUND",
        "AMBIGUOUS",
        "NOT_FOUND",
        "CANCELED",
      ],
      default: "pending",
    },
    paymentDate: { type: Date, default: Date.now },

    user: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
  },

  { timestamps: true }
);
const Payment = mongoose.model("payment", paymentSchema);
export default Payment;

import mongoose, { Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

export interface IToken {
  token: string;
  userId: any;
  expiresIn: Date;
}

const tokenSchema = new mongoose.Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
    },

    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    expiresIn: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const tokenModel: Model<IToken> = mongoose.model<IToken>("token", tokenSchema);
export default tokenModel;

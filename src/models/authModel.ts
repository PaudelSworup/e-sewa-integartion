import mongoose, { Model } from "mongoose";

export interface IUser {
  fullname: string;
  email: string;
  password?: string;
  created: Date;
  googleLogin?: boolean;
  isVerified?: boolean;
}

const authSchema = new mongoose.Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        // Password is required if not logging in via Google
        return !this.googleLogin;
      },
    },

    googleLogin: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", authSchema);

export default UserModel;

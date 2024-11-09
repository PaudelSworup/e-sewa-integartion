import mongoose, { Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

export interface IProfile {
  profileImage: string;
  userId: any;
}

const profileSchema = new mongoose.Schema<IProfile>({
  profileImage: {
    type: String,
    required: true,
    trim: true,
  },

  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
});

const profileModel: Model<IProfile> = mongoose.model<IProfile>(
  "Profile",
  profileSchema
);

export default profileModel;

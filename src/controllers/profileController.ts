import profileSchema from "../models/profileModel";
import fs from "fs";
import { Request, Response } from "express";

export const uploadProfile = async (req: Request, res: Response) => {
  let STATUS_CODE = 201;
  try {
    let profile = await profileSchema.findOne({ userId: req.params.userid });

    if (!req.file) {
      STATUS_CODE = 400;
      throw new Error("error uploading file");
    }

    if (!profile) {
      profile = new profileSchema({
        profileImage: req.file.path,
        userId: req.params.userid,
      });
      profile = await profile.save();
    }

    if (profile.profileImage) {
      fs.unlink(profile.profileImage, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully");
        }
      });
    }
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

export const getProfileByID = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  try {
    let profile = await profileSchema
      .findOne({ userId: req.params.id })
      .populate("userId");

    if (!profile) {
      STATUS_CODE = 400;
      throw new Error("something went wrong");
    }

    return res.status(STATUS_CODE).json({
      success: true,
      profile,
    });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

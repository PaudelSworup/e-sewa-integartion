import { Request, Response } from "express";
import bcrypt from "bcrypt";
import userSchema from "../models/authModel";
import tokenSchema from "../models/tokenModel";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { sendEmail } from "../../utils/SendMail";
import { generateToken } from "../../utils/generateToken";
import {
  getGoogleTokenInfoUrl,
  GoogleIdTokenPayload,
} from "../../utils/GoogleTokenUrlInfo";

//create user account
export const createUserAccount = async (req: Request, res: Response) => {
  const { fullname, password } = req.body;
  const hash_password = await bcrypt.hash(password, 10);
  let STATUS_CODE = 201;
  try {
    let users = new userSchema({
      fullname,
      email: req.body.email.toLowerCase(),
      password: hash_password,
    });
    users = await users.save();

    if (!users) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong!");
    }

    let token = new tokenSchema({
      token: crypto.randomBytes(16).toString("hex"),
      userId: users._id,
      expiresIn: addMinutes(Date.now(), 120),
    });

    token = await token.save();

    if (!token) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong!");
    }

    sendEmail({
      from: "e-store <estorenep@gmail.com>",
      to: users.email,
      subject: "Account Creation Successful",
      html: `  
      <h2>Account creation successful</h2>
      <h2>Hello <strong>${users.fullname}</strong>, <br/></h2> 
      <p style='font-size:20px;'>your account has been created.Activate your account to continue</p>
      <br>
      <p>your activation url is http://localhost:3030/api/auth/verify/${token.token}
    `,
      // your activation url is http://ec2-43-204-1-138.ap-south-1.compute.amazonaws.com:9000/api/auth/verify/${token.token}
    });

    return res.status(STATUS_CODE).json({
      success: true,
      message: "Account created. Please activate to log in.",
    });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

//activate user account
export const activateUserAccount = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;

  try {
    const token = await tokenSchema.findOne({ token: req.params.token });
    if (!token) {
      STATUS_CODE = 401;
      throw new Error("Invalid Token");
    }

    // check if token is expired or not
    if (token.expiresIn.getTime() < Date.now()) {
      STATUS_CODE = 401;
      throw new Error(
        "Expired Token: You need to generate a new token to activate your account"
      );
    }

    // if token is valid then find the user for that token
    let user = await userSchema.findOne({ _id: token.userId });
    if (!user) {
      STATUS_CODE = 401;
      throw new Error("user not found");
    }

    if (user.isVerified) {
      STATUS_CODE = 400;
      throw new Error("Account is already activated");
    } else {
      user.isVerified = true;

      user = await user.save();
    }

    if (!user) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }
    return res.status(STATUS_CODE).json({
      success: true,
      message: `Congrats ${user.fullname}, your account has been activated`,
    });
  } catch (err: any) {
    res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

//resend activation token
export const resendActivationToken = async (req: Request, res: Response) => {
  let STATUS_CODE = 200;
  try {
    let email = await userSchema.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!email) {
      STATUS_CODE = 401;
      throw new Error("Email not registred");
    }

    if (email.isVerified) {
      STATUS_CODE = 400;
      throw new Error("Account is already activated");
    }

    let token = new tokenSchema({
      token: crypto.randomBytes(16).toString("hex"),
      userId: email._id,
      expiresIn: addMinutes(Date.now(), 1440),
    });

    token = await token.save();

    if (!token) {
      STATUS_CODE = 400;
      throw new Error("Something went wrong");
    }

    // const emailVerificationUrl = `${process.env.CLIENT_SIDE}/confirmation/${token.token}`;
    sendEmail({
      from: "e-store <estorenep@gmail.com>",
      to: email.email,
      subject: "Account Activation Token",
      html: `  
      <h2>Account creation successful</h2>
      <h2>Hello <strong>${email.fullname}</strong>, <br/></h2> 
      <br>
      <p>your activation url is http://localhost:3030/api/auth/verify/${token.token}
    `,
    });
    return res.status(STATUS_CODE).send({
      success: true,
      message: "Activation link has been sent to your mail",
    });
  } catch (err: any) {
    res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

//login
export const Login = async (req: Request, res: Response) => {
  const { password } = req.body;
  let STATUS_CODE = 200;
  try {
    const user = await userSchema.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!user) {
      STATUS_CODE = 401;
      throw new Error("email not registred");
    }

    // check if accont is verified
    if (!user.isVerified) {
      STATUS_CODE = 401;
      throw new Error("account is not activated");
    }

    // if email found then check password for that email
    const checkPassword = await bcrypt.compare(password, user.password ?? "");
    if (checkPassword === false) {
      return res
        .status(STATUS_CODE)
        .json({ success: false, error: "Wrong Credentials" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, { expires: addMinutes(Date.now(), 1440) });
    const { _id, fullname, email } = user;
    return res.status(STATUS_CODE).json({
      success: true,
      token,
      user: {
        _id,
        fullname,
        email,
      },
    });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

//forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  let STATUS_CODE = 201;
  try {
    const user = await userSchema.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!user) {
      STATUS_CODE = 400;
      throw new Error("email account doesnot exist");
    }

    let token = new tokenSchema({
      token: crypto.randomBytes(16).toString("hex"),
      userId: user._id,
      expiresIn: addMinutes(Date.now(), 20),
    });

    token = await token.save();

    if (!token) {
      STATUS_CODE = 400;
      throw new Error("something went wrong");
    }

    sendEmail({
      from: "e-store <estorenep@gmail.com>",
      to: user.email,
      subject: "Password Reset successful",
      text: `hello ${user.fullname}, click your verificatinn link to continue`,
      html: `  
      <p>your activation url is http://localhost:3030/api/auth/resetpassword/${token.token}
    `,
    });

    return res
      .status(STATUS_CODE)
      .json({ success: true, message: "forgot password link has been sent" });
  } catch (err: any) {
    return res
      .status(STATUS_CODE)
      .json({ success: true, message: err.message });
  }
};

// reset password
export const resetPassword = async (req: Request, res: Response) => {
  let STATUS_CODE = 201;
  try {
    let token = await tokenSchema.findOne({ token: req.params.token });

    if (!token) {
      STATUS_CODE = 401;
      throw new Error("Invalid token!");
    }

    if (token.expiresIn.getTime() < Date.now()) {
      STATUS_CODE = 401;
      throw new Error("expired roken");
    }
    let user = await userSchema.findOne({ _id: token.userId });

    if (!user) {
      STATUS_CODE = 404;
      throw new Error("unable to find the user for valid token");
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user = await user.save();

    if (!user) {
      STATUS_CODE = 401;
      throw new Error("something went wrong");
    }
    return res
      .status(STATUS_CODE)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

export const GoogleLogin = async (req: Request, res: Response) => {
  let STATUS_CODE = 201;

  try {
    const googleRes: any = await getGoogleTokenInfoUrl(
      req.params.googleIdToken
    );

    console.log("googleres", googleRes);
    if (googleRes.aud !== process.env.GOOGLE_CLINET_ID) {
      STATUS_CODE = 401;
      throw new Error("Invalid token audience");
    }

    let user = await userSchema.findOne({
      email: googleRes.email.toLowerCase(),
    });

    //if user email already exist then return save credentials
    if (user) {
      STATUS_CODE = 200;
      return res.status(STATUS_CODE).json({
        success: true,
        user: {
          id: user._id,
          token: req.params.googleIdToken,
          username: googleRes.given_name,
          email: googleRes.email,
          picture: googleRes.picture,
        },
      });
    }

    let registration = new userSchema({
      fullname: googleRes.name,
      email: googleRes.email.toLowerCase(),
      googleLogin: true,
      isVerified: true,
    });
    await registration.save();

    return res.status(STATUS_CODE).json({
      success: true,
      user: {
        id: registration._id,
        token: req.params.googleIdToken,
        username: googleRes.given_name,
        email: googleRes.email,
      },
    });
  } catch (err: any) {
    return res.status(STATUS_CODE).json({ success: false, error: err.message });
  }
};

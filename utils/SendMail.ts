import nodemailer from "nodemailer";

const hostData: any = process.env.GMAIL_HOST ?? "";
const port: any = process.env.GMAIL_PORT ?? "";

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = (options: EmailOptions) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: hostData,
    port: port,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info);
    }
  });
};

export const sendOrdredEmail = (options: EmailOptions) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: hostData,
    port: port,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info);
    }
  });
};

import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import "./database/db-connection";
import bodyparser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import {
  authRoutes,
  productRoutes,
  orderRoutes,
  paymentRoutes,
} from "./src/routes/index";

const app: Application = express();
const port = process.env.PORT || 8000;

// e-store-hz3bv8qjo-paudelsworups-projects.vercel.app

const corsOptions = {
  origin: "https://e-store-omega-beige.vercel.app/", // Your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

//middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors(corsOptions));

//routes
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

//for testing
// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "public", "test.html"));
// });

app.get("/", async (req, res) => {
  res.json({ message: "hello there " });
});

// app.get("/email", function (req, res) {
//   res.sendFile(path.join(__dirname, "public", "email.html"));
// });

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

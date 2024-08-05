import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import "./database/db-connection";
import bodyparser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import {
  authRoutes,
  productRoutes,
  orderRoutes,
  paymentRoutes,
} from "./src/routes/index";

const app: Application = express();
const port = process.env.PORT || 8000;

//middlewares
app.use(bodyparser.json());
app.use(morgan("dev"));
// app.use("/public/blog", express.static("public/blog"));
app.use(cookieParser());
app.use(cors());

//routes
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/test.html");
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

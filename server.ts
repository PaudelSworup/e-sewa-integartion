import express, { Application } from "express";
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
import { connectRedis } from "./services/redisClient";

const app: Application = express();
const port = process.env.PORT || 8000;

// e-store-hz3bv8qjo-paudelsworups-projects.vercel.app

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

// const redisClient = createClient({
//   url: "redis://127.0.0.1:6379",
// });

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// // Connect to Redis
// redisClient.connect().then(() => console.log("Connected to Redis"));
connectRedis();

//middlewares
// app.set("redis", redisClient);
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.json());
app.use(morgan("dev"));
app.use(cookieParser());

//routes
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

// for testing
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

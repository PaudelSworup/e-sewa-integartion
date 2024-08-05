import mongoose from "mongoose";
const connectionString: string = process.env.DATABASE ?? "";
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("database connected");
  })
  .catch((err: any) => console.error(err));

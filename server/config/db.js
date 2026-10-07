import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
console.log("MONGO ERROR",error)
  }
};

export default connectDB;
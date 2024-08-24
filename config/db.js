import mongoose from "mongoose";
// If using `colors` package for coloring error messages
import colors from "colors";

// Function for connecting to the database
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected to MongoDB Database: ${conn.connection.host}`.bgYellow.white
    );
  } catch (error) {
    console.log(`MongoDB connection error: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

export default connectDb;

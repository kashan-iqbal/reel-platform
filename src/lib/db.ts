import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MongoDB URI in the .env file");
}

// Check if there is an existing cached connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("✅ Using existing database connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ Connecting to the database...");
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => {
        console.log("✅ Database connected successfully!");
        return mongoose.connection;
      })
      .catch((error) => {
        console.error("❌ Failed to connect to the database:", error);
        cached.promise = null; // Reset cached promise on failure
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("❌ Error during database connection:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

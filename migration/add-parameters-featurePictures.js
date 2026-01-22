const mongoose = require("mongoose");
require("dotenv").config(); // 🔥 MUST BE HERE
const Product = require("../src/model/Product.js");

const MONGO_URI = process.env.CONNECTION_STRING;

(async () => {
  try {
    console.log("Connecting to DB...");

    if (!MONGO_URI) {
      throw new Error("CONNECTION_STRING is not defined in .env file");
    }

    await mongoose.connect(MONGO_URI);

    console.log("Connected successfully");

    const result = await Product.updateMany(
      {},
      {
        $set: {
          parameters: [],
          featurePictures: [],
        },
      }
    );

    console.log("Migration completed");
    console.log(`Modified documents: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
})();

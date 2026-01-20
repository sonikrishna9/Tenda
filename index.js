const express = require("express");
const dotenv = require("dotenv");
const Dbconnect = require("./config/Dbconnect.js");
const cors = require("cors");

dotenv.config();
Dbconnect();

const app = express();

/* ✅ CORS (LOCAL + LIVE BOTH) */
app.use(
  cors({
    origin: true, // 👈 allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use("/api/product", require("./src/routes/productRoutes.js"));
app.use("/api/parentcategory", require("./src/routes/parentcategoryRoute.js"));


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

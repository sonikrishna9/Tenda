const express = require("express");
const dotenv = require("dotenv");
const Dbconnect = require("./config/Dbconnect.js");
const cors = require("cors");

dotenv.config();
Dbconnect();

const app = express();

/* TRUST PROXY (REQUIRED FOR RENDER) */
app.set("trust proxy", 1);

/* CORS CONFIG */
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:3000", 
      "https://tenda-frontend-pa94.vercel.app",
      "https://tenda-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

/* Admin Routes */

app.use("/api/admin", require("./src/routes/adminAuthRoutes.js"));
app.use("/api/admin/product", require("./src/routes/admin/AdminProductRoute.js"));
app.use("/api/admin/parentcategory", require("./src/routes/admin/ParentcategoryRoute.js"));
app.use("/api/admin/blog", require("./src/routes/admin/BlogRoute.js"));
app.use("/api/admin/slider", require("./src/routes/admin/SliderRoutes.js")); 
app.use("/api/admin/subcategory", require("./src/routes/admin/SubcategoryBannerRoute.js"));  
app.use("/api/admin/parentcategorybanner", require("./src/routes/admin/ParentCategoryBannerRoute.js"));  
app.use("/api/admin/gallery", require("./src/routes/admin/GalleryRoutes.js"));
app.use("/api/admin/news", require("./src/routes/admin/NewsRoute.js"));
app.use("/api/admin/company", require("./src/routes/admin/CompanyBuyRoute.js"));  

/* Frontend Routes */

app.use("/api/product", require("./src/routes/productRoutes.js"));
app.use("/api/parentcategory", require("./src/routes/parentcategoryRoute.js"));
app.use("/api/blog", require("./src/routes/blogroute.js"));
app.use("/api/gallery", require("./src/routes/galleryRoutes.js"));
app.use("/api/news", require("./src/routes/newsRoutes.js"));

app.use("/api/slider", require("./src/routes/common/sliderRoutes.js")); 

app.use("/api/subcategory", require("./src/routes/subcategoryBannerRoutes.js"));  
app.use("/api/parentcategorybanner", require("./src/routes/parentcateogryBannerRoutes.js"));  
app.use("/api/company", require("./src/routes/companyRoutes.js"));  

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
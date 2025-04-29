const express = require("express");
const app = express();
const port = process.env.PORT || 8082;
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const prisma = require("./utils/prisma");

// Controllers
const {
  register,
  login,
  updateUser,
  deleteUser,
  userById,
  resetPassword,
} = require("./controllers/auth/auth");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} = require("./controllers/products/products");
const {
  checkout,
  addToCart,
  cart,
  removeFromCart,
} = require("./controllers/user/cart");
const { isAdmin, checkAuth } = require("./middlewares/auth");
const { dashboardData, getAllUsers } = require("./controllers/admin/dashboard");
const {
  getAllOrders,
  changeStatusOfOrder,
} = require("./controllers/admin/orders");
const { orders } = require("./controllers/user/orders");
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("./controllers/categories/category");
const {
  addToWishlist,
  wishlist,
  removeFromWishlist,
} = require("./controllers/user/wishlist");

const multer = require("multer");
const { uploadFile } = require("./controllers/files/files");
const upload = multer({
  dest: "./uploads",
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10 MB limit

// Load environment variables
dotenv.config();

const allowedOrigins = ['http://192.168.171.160:8088', 'http://localhost:8088'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Hello World!"));

// AUTH
app.post("/register", register);
app.post("/login", login);

// USER ROUTES
app.post("/update-user", updateUser);
app.get("/user", userById);
app.get("/delete-user", deleteUser);
app.post("/reset-password", resetPassword);

// PRODUCTS
app.post("/product", [isAdmin], addProduct);
app.get("/products", getAllProducts);
app.post("/update-product", [isAdmin], updateProduct);
app.get("/delete-product", [isAdmin], deleteProduct);

// CATEGORIES
app.post("/category", [isAdmin], addCategory);
app.get("/categories", getCategories);
app.post("/update-category", [isAdmin], updateCategory);
app.get("/delete-category", [isAdmin], deleteCategory);

// ORDERS
app.get("/orders", [checkAuth], orders);

// CHECKOUT
app.post("/checkout", [checkAuth], checkout);

// WISHLIST
app.post("/add-to-wishlist", [checkAuth], addToWishlist);
app.get("/wishlist", [checkAuth], wishlist);
app.get("/remove-from-wishlist", [checkAuth], removeFromWishlist);

// ADMIN
app.get("/dashboard", [isAdmin], dashboardData);
app.get("/admin/orders", [isAdmin], getAllOrders);
app.get("/admin/order-status", [isAdmin], changeStatusOfOrder);
app.get("/admin/users", [isAdmin], getAllUsers);

// FILES
app.post("/upload-file", upload.single("file"), uploadFile);

// Start Server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // Connect to Prisma
  try {
    await prisma.$connect();
    console.log("Prisma connected to the database");
  } catch (error) {
    console.error("Prisma connection error:", error);
  }
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
  process.exit(0);
});

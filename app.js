const express = require("express");
const app = express();
const port = process.env.PORT;
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
var path = require("path");
var cors = require("cors");
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
const { isAdmin, checkAuth } = require("./controllers/middlewares/auth");
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
const mongoose = require("./config/database")();
const multer = require("multer");
const { uploadFile } = require("./controllers/files/files");
const upload = multer({
  dest: "./uploads",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// To access public folder
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Set up Global configuration access
dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// AUTH
app.post("/register", register);
app.post("/login", login);

// User Routes
app.post("/update-user", updateUser);
app.get("/user", userById);
app.get("/delete-user", deleteUser);
app.post("/reset-password", resetPassword);

// Products
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

app.listen(8082, () => {
  console.log(`Example app listening on port 8082!`);
});

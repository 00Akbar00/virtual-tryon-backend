const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const TOKEN_KEY = process.env.JWT_SECRET || "seceret"; // Use environment variable for security

// **Admin Authentication Middleware**
module.exports.isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No Auth Token Provided" });
    }

    // Verify Token
    const decoded = jwt.verify(token, TOKEN_KEY);
    req.user = decoded;

    // Check if User Exists and is ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // Using Prisma's `findUnique()`
      select: { userType: true },
    });

    if (!user || user.userType !== "ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied. Admin Only." });
    }

    next(); // Proceed to next middleware
  } catch (error) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Invalid or Expired Token",
        error: error.message,
      });
  }
};

// **General Authentication Middleware**
module.exports.checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No Auth Token Provided" });
    }

    // Verify Token
    const decoded = jwt.verify(token, TOKEN_KEY);
    req.user = decoded;

    // Check if User Exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // Using Prisma's `findUnique()`
      select: { id: true },
    });

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User Authentication Failed" });
    }

    next(); // Proceed to next middleware
  } catch (error) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Invalid or Expired Token",
        error: error.message,
      });
  }
};

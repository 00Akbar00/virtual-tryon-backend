const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// **Dashboard Data**
module.exports.dashboardData = async (req, res) => {
  try {
    // Fetch all counts in parallel
    const [ordersCount, usersCount, productsCount, categoriesCount] =
      await Promise.all([
        prisma.orders.count(),
        prisma.users.count(),
        prisma.products.count(),
        prisma.categories.count(),
      ]);

    return res.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        ordersCount,
        usersCount,
        productsCount,
        categoriesCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// **Get All Users**
module.exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding password and token
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        user_type: true,
        created_at: true,
      },
    });

    return res.json({
      success: true,
      message: "All users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

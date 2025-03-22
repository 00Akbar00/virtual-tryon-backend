const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// **Get All Orders**
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }, // Excludes password & token
        items: {
          include: {
            product: { select: { id: true, title: true, price: true } },
            category: { select: { id: true, title: true } },
          },
        },
      },
    });

    const ordersCount = await prisma.orders.count();

    return res.json({
      success: true,
      message: "All orders retrieved successfully",
      status: 200,
      data: orders,
      ordersCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// **Helper Function: Get Current Date**
const getCurrentDate = () => {
  const today = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[today.getMonth()]} ${String(today.getDate()).padStart(
    2,
    "0"
  )}, ${today.getFullYear()}`;
};

// **Change Order Status**
module.exports.changeStatusOfOrder = async (req, res) => {
  try {
    const { status, orderId } = req.query;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Status or order ID is missing",
      });
    }

    if (!["delivered", "pending", "shipped"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const today = getCurrentDate();
    let updateData = { status };

    if (status === "shipped") updateData.shipped_on = today;
    if (status === "delivered") updateData.delivered_on = today;

    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: updateData,
    });

    return res.json({
      success: true,
      message: "Order status updated successfully",
      status: 200,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

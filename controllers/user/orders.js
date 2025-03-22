const prisma = require('../../utils/prisma');
// **Get User Orders**
module.exports.orders = async (req, res) => {
  try {
    const user = req.user;

    // Fetch orders with related user & items
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true, category: true } },
      },
    });

    if (!orders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

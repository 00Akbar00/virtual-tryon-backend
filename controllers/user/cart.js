const prisma = require('../../utils/prisma');

// **Checkout (Place Order)**
module.exports.checkout = async (req, res) => {
  try {
    const user = req.user;
    const { items, totalAmount, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderId = Math.floor(Math.random() * 1000000000).toString();

    // Start a transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          orderId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
          totalAmount,
          paymentMethod,
          status: "pending",
        },
        include: { items: true },
      });

      // Update Product Quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Checkout successful",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Add to Cart**
module.exports.addToCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    const updatedCart = await prisma.user.update({
      where: { id: user.id },
      data: { cart: { create: { productId, quantity } } },
      include: { cart: true },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: updatedCart.cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Remove from Cart**
module.exports.removeFromCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.query;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const updatedCart = await prisma.user.update({
      where: { id: user.id },
      data: { cart: { deleteMany: { productId } } },
      include: { cart: true },
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: updatedCart.cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Get Cart Items**
module.exports.cart = async (req, res) => {
  try {
    const user = req.user;

    const cart = await prisma.user.findUnique({
      where: { id: user.id },
      include: { cart: { include: { product: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "User cart",
      data: cart.cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const prisma = require('../../utils/prisma');

// **Add to Wishlist**
module.exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    // Check if product is already in the wishlist
    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: { userId, productId },
    });

    if (existingWishlistItem) {
      return res
        .status(400)
        .json({ success: false, message: "Product already in wishlist" });
    }

    // Add product to wishlist
    const addedWishlist = await prisma.wishlist.create({
      data: { userId, productId },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: addedWishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Remove from Wishlist**
module.exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.query;
    const userId = req.user.id;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const removedWishlist = await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });

    if (!removedWishlist.count) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in wishlist" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Get Wishlist**
module.exports.wishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });

    if (!wishlist.length) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist is empty" });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      data: wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

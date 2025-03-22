const prisma = require("../../utils/prisma");

// **Add Product**
module.exports.addProduct = async (req, res) => {
  try {
    const { title, sku, price, image, categoryId } = req.body;

    if (!title || !sku || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, SKU, price, and categoryId are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        title,
        sku,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Get All Products with Pagination**
module.exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { category: true }, // Populate category
    });

    const productsCount = await prisma.product.count();

    return res.status(200).json({
      success: true,
      message: "List of all products",
      data: products,
      count: productsCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Update Product**
module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, sku, price, image, categoryId } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title,
        sku,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Delete Product**
module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.query;

    await prisma.product.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Search Products by Title**
module.exports.getAllProducts = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const products = await prisma.product.findMany({
      where: {
        title: { contains: search, mode: "insensitive" },
      },
      include: { category: true }, // Populate category
    });

    return res.status(200).json({
      success: true,
      message: "List of products matching search",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

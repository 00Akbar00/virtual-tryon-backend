const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// **Add Category**
module.exports.addCategory = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const category = await prisma.category.create({
      data: { title, description, image },
    });

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Get All Categories**
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const categoriesCount = await prisma.category.count();

    return res.status(200).json({
      success: true,
      message: "List of all categories",
      data: categories,
      count: categoriesCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Update Category**
module.exports.updateCategory = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const { id } = req.query;

    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { title, description, image },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Delete Category**
module.exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;

    const category = await prisma.category.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// **Search Categories by Title**
module.exports.searchCategories = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const categories = await prisma.category.findMany({
      where: {
        title: { contains: search, mode: "insensitive" },
      },
    });

    return res.status(200).json({
      success: true,
      message: "List of categories matching search",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

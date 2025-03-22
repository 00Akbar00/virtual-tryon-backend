const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET_KEY = "seceret";

function generateAuthToken(data) {
  return jwt.sign(data, JWT_SECRET_KEY, { expiresIn: "10h" });
}

// **Login User**
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist with this email.",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = generateAuthToken({ id: user.id, email: user.email });

      // Update token in DB
      await prisma.users.update({
        where: { id: user.id },
        data: { token },
      });

      return res.json({
        success: true,
        message: "User logged in",
        data: { ...user, token },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Incorrect email or password.",
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// **Register User**
module.exports.register = async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email or password is empty" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { email, password: hashedPassword, name, user_type: userType },
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// **Update User**
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const userDataToBeUpdated = req.body;

    const user = await prisma.users.findUnique({ where: { id: Number(id) } });

    if (!user) return res.status(404).send("User does not exist");

    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: userDataToBeUpdated,
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// **Delete User**
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await prisma.users.findUnique({ where: { id: Number(id) } });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });

    await prisma.users.delete({ where: { id: Number(id) } });

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// **Get User By ID**
module.exports.userById = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await prisma.users.findUnique({ where: { id: Number(id) } });

    if (!user) return res.status(404).send("User does not exist");

    return res.json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// **Reset Password**
module.exports.resetPassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const { id } = req.query;

    if (!password || !newPassword || !id)
      return res.status(400).send("Fields are empty");

    let user = await prisma.users.findUnique({ where: { id: Number(id) } });

    if (!user) return res.status(404).send("User does not exist");

    if (await bcrypt.compare(password, user.password)) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.users.update({
        where: { id: Number(id) },
        data: { password: hashedNewPassword },
      });

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Wrong password",
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

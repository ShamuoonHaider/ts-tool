import { db } from "../lib/db.js";

export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    await db.user.create({
      data: {
        username,
        email,
        password,
      },
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email, password } = req.body;
  console.log("Updating user with ID:", id);

  try {
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        username,
        email,
        password,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  console.log("Deleting user with ID:", id);
  try {
    await db.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

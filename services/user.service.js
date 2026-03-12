import { db } from "../db/index.js";

import {
  hashPasswordWithSalt,
  comparePasswordWithHash,
} from "../utils/hash.js";

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  return rows[0] || null;
};

export const createUser = async ({ username, email, password }) => {
  const { password: hashedPassword } = hashPasswordWithSalt(password);

  const [result] = await db.execute(
    "INSERT INTO users (username,email,password) VALUES (?,?,?)",
    [username, email, hashedPassword],
  );

  return { id: result.insertId };
};

export const validateUserPassword = (password, storedPassword) => {
  return comparePasswordWithHash(password, storedPassword);
};

export const getAllUsers = async () => {
  const [rows] = await db.execute(
    "SELECT id,username,email,created_at FROM users",
  );

  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await db.execute(
    "SELECT id,username,email,created_at FROM users WHERE id = ?",
    [id],
  );

  return rows[0] || null;
};

export const deleteUserById = async (id) => {
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

  return result.affectedRows > 0;
};

export const updateUserById = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.username) {
    fields.push("username = ?");
    values.push(data.username);
  }

  if (data.email) {
    fields.push("email = ?");
    values.push(data.email);
  }

  if (data.password) {
    const { password: hashedPassword } = hashPasswordWithSalt(data.password);
    fields.push("password = ?");
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

  await db.execute(query, values);

  return getUserById(id);
};

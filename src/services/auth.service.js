const { getDB } = require("../config/db");

const findUserByEmail = async (email) => {
  const db = getDB();

  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  return rows[0] || null;
};

const createUser = async ({ username, email, password }) => {
  const db = getDB();

  const [result] = await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );

  const [rows] = await db.execute(
    "SELECT id, username, email, is_email_verified, created_at FROM users WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
};

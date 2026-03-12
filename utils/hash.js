import crypto from "crypto";

export const hashPasswordWithSalt = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  return {
    salt,
    password: `${salt}:${hashedPassword}`,
  };
};

export const comparePasswordWithHash = (plainPassword, storedPassword) => {
  const [salt, hash] = storedPassword.split(":");

  const newHash = crypto
    .createHash("sha256")
    .update(plainPassword + salt)
    .digest("hex");

  return newHash === hash;
};

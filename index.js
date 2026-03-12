import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.middleware.js";

import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

app.use("/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

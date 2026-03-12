const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const healthcheckRoutes = require("./routes/healthcheck.routes");
const authRoutes = require("./routes/auth.routes");

const errorMiddleware = require("./middlewares/error.middleware");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

module.exports = app;

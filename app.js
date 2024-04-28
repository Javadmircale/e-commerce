require("dotenv").config();
require("express-async-errors");
// express
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
// Extra packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimiter = require("express-rate-limit");

// Connect DataBase
const connectDB = require("./db/connect");
const port = process.env.PORT || 5000;
// middleware imports
const { notFoundMiddleware, errorHandlerMiddleware } = require("./middleware");
// routers imports
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

// middleware
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    max: 60,
    windowMs: 1000 * 60 * 15,
  })
);
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());
app.use(cors());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// middleware errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port : ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

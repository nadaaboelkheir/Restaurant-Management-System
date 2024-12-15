const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const sanitizer = require("perfect-express-sanitizer");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const { PORT, NODE_ENV } = require("./utils/env");
const db = require("./models");
const routes = require("./routes/index");
const { createAdminIfNotExist } = require("./controllers/auth.controller");
const app = express();

// Middleware for rate limiting incoming requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Body parsing middleware with size limits
app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// Apply rate limiter for all routes
app.use(limiter);

// Logging incoming requests
app.use(morgan("dev"));

// Security: Helmet to set various HTTP headers for security
app.use(helmet());

// Input sanitization to prevent XSS and SQL Injection attacks
app.use(
  sanitizer.clean({
    xss: true,
    sql: true,
  })
);

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Routes
routes(app);

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;

  if (NODE_ENV?.trim() === "development") {
    res.status(statusCode).send({
      error: {
        message: err.message,
        stack: err.stack,
        status: statusCode,
      },
    });
  } else {
    res.status(statusCode).send({
      error: "Internal Server Error",
    });
  }
});

// Connect to the database
db.sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Connected to the database");

    app.listen(PORT, async () => {
      await createAdminIfNotExist();

      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

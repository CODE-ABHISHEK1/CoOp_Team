const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

// const dns = require("dns");
// dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const app = express();

// SECURE CORS: Only allow your specific frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ 
  origin: FRONTEND_URL,
  credentials: true 
}));

// SECURITY HEADERS FOR PRODUCTION
app.use(helmet());
app.use(express.json({ limit: '10mb' })); // Prevent payload attacks

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.get("/", (req, res) => res.json({ message: "Welcome to CoOp API" }));

// GLOBAL ERROR HANDLER (prevents unhandled promise rejections)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CoOp Server running on port ${PORT}`));
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());
const recipeRoutes = require("./routes/recipeRoutes");

// Connect DB
connectDB();

// Test route
app.get("/", (req, res) => res.send("Cook It Backend Running ✅"));

// Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

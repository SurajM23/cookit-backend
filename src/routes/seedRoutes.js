const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// Seed users from local JSON
router.post("/users/json", async (req, res) => {
  try {
    // Read users.json
    const filePath = path.join(__dirname, "../seed/users.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const usersJson = JSON.parse(data);

    // Prepare users array for insertion
    const usersToInsert = usersJson.map(user => ({
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      passwordHash: user.passwordHash // already hashed in JSON
    }));

    // Insert into DB
    const insertedUsers = await User.insertMany(usersToInsert);

    res.status(201).json({
      message: "Users seeded successfully",
      insertedUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error seeding users", error: err.message });
  }
});

module.exports = router;

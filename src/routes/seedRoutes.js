const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Comment = require("../models/Comment");

const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");

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


const { seedRecipes } = require("../controllers/seedController");
const authMiddleware = require("../middlewares/authMiddleware");



router.post("/seed-comments", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    const users = await User.find();

    if (!recipes.length || !users.length) {
      return res.status(400).json({ message: "No recipes or users found to seed comments" });
    }

    const sampleComments = [
      "Amazing recipe! Loved it.",
      "Easy to follow instructions, thank you!",
      "Will try this for dinner tonight.",
      "Yummy! My family loved it.",
      "I added some extra spices, turned out great.",
      "Perfect for beginners.",
      "Loved the flavors in this recipe.",
      "This is now my go-to recipe for weekends.",
      "Simple and delicious!",
      "Great step-by-step instructions."
    ];

    let createdComments = [];

    for (const recipe of recipes) {
      // Add 2-5 random comments per recipe
      const commentCount = Math.floor(Math.random() * 4) + 2; // 2-5 comments
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomText = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        const comment = await Comment.create({
          recipe: recipe._id,
          author: randomUser._id,
          text: randomText
        });

        createdComments.push(comment);
      }
    }

    res.status(201).json({ message: "Random comments seeded successfully", count: createdComments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;




// Seed recipes (protected, only admin or test user)
router.post("/recipes", authMiddleware, seedRecipes);
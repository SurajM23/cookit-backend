const Recipe = require("../models/Recipe");
const User = require("../models/User");
const recipesData = require("../seed/recipes_v2.json");

exports.seedRecipes = async (req, res) => {
  try {
    const users = await User.find(); // get all users
    if (users.length === 0) return res.status(400).json({ message: "No users found" });

    // For each recipe, assign a random user as author
    const seededRecipes = [];
    for (const recipe of recipesData) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const newRecipe = await Recipe.create({ ...recipe, author: randomUser._id });
      seededRecipes.push(newRecipe);
    }

    res.status(201).json({ message: "Recipes seeded successfully", seededRecipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




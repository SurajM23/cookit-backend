const Recipe = require("../models/Recipe");

// POST /api/recipes/add
exports.addRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, cookTime, imageUrl } = req.body;

    if (!title || !ingredients || !steps || !cookTime)
      return res.status(400).json({ message: "Missing required fields" });

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      cookTime,
      imageUrl,
      author: req.user._id, // comes from JWT middleware
    });

    const savedRecipe = await newRecipe.save();

    res.status(201).json({ message: "Recipe added successfully", recipe: savedRecipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/recipes?page=1
exports.getRecipes = async (req, res) => {
  try {
    // Page number from query, default 1
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; // fixed 10 recipes per page
    const skip = (page - 1) * limit;

    // Count total recipes
    const totalRecipes = await Recipe.countDocuments();

    // Fetch recipes
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })           // newest first
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl"); // populate author info

    // Send paginated response
    res.status(200).json({
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// POST /api/recipes/:id/like
exports.likeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.likes.includes(userId))
      return res.status(400).json({ message: "You already liked this recipe" });

    recipe.likes.push(userId);
    recipe.likeCount = recipe.likes.length;
    await recipe.save();

    res.status(200).json({ message: "Recipe liked successfully", likeCount: recipe.likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/recipes/:id/unlike
exports.unlikeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (!recipe.likes.includes(userId))
      return res.status(400).json({ message: "You have not liked this recipe" });

    recipe.likes = recipe.likes.filter(id => id.toString() !== userId.toString());
    recipe.likeCount = recipe.likes.length;
    await recipe.save();

    res.status(200).json({ message: "Recipe unliked successfully", likeCount: recipe.likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const currentUser = req.user; // from authMiddleware

    // Get recipes from users current user is following
    const totalRecipes = await Recipe.countDocuments({
      author: { $in: currentUser.following }
    });

    const recipes = await Recipe.find({ author: { $in: currentUser.following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl");

    res.status(200).json({
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/recipeController.js
exports.getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Count total recipes by this user
    const totalRecipes = await Recipe.countDocuments({ author: userId });

    // Fetch recipes
    const recipes = await Recipe.find({ author: userId })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl");

    res.status(200).json({
      userId,
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes
    });
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

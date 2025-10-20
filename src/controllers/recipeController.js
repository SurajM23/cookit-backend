const Recipe = require("../models/Recipe");
const User = require("../models/User");


// Utility function to normalize steps
const normalizeSteps = (recipe) => {
  let steps = [];

  if (recipe.steps && recipe.steps.length > 0) {
    steps = recipe.steps;
  }

  if (recipe.instructions && recipe.instructions.trim() !== "") {
    const instrSteps = recipe.instructions
      .split(".")
      .map(s => s.trim())
      .filter(s => s);

    // Combine both, remove duplicates
    steps = Array.from(new Set([...steps, ...instrSteps]));
  }

  return steps;
};

// POST /api/recipes/add
exports.addRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, instructions, cookTime, imageUrl } = req.body;

    if (!title || !ingredients || (!steps && !instructions) || !cookTime)
      return res.status(400).json({ message: "Missing required fields" });

    const normalizedSteps = normalizeSteps({ steps, instructions });

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps: normalizedSteps,
      cookTime,
      imageUrl,
      author: req.user._id, // comes from JWT middleware
      likesCount: 0,
      likes: []
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
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalRecipes = await Recipe.countDocuments();

    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl");

    // Normalize steps before sending response
    const recipesWithSteps = recipes.map(r => {
      const rObj = r.toObject();
      rObj.steps = normalizeSteps(rObj);
      return rObj;
    });

    res.status(200).json({
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes: recipesWithSteps
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let action = "";

    if (recipe.likes.includes(userId)) {
      // Already liked → remove like
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId.toString());
      recipe.likesCount = recipe.likes.length;

      user.likedRecipes = user.likedRecipes.filter(
        id => id.toString() !== recipeId.toString()
      );

      action = "unliked";
    } else {
      // Not liked yet → add like
      recipe.likes.push(userId);
      recipe.likesCount = recipe.likes.length;

      user.likedRecipes.push(recipeId);

      action = "liked";
    }

    await recipe.save();
    await user.save();

    res.status(200).json({
      message: `Recipe ${action} successfully`,
      likesCount: recipe.likesCount,
      action
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLikedRecipes = async (req, res) => {
  try {
    const userId = req.user._id; // comes from JWT via authMiddleware
    const user = await User.findById(userId).populate("likedRecipes");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ likedRecipes: user.likedRecipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/recipes/feed?page=1
exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const currentUser = req.user;

    let filter = {};
    if (currentUser.following && currentUser.following.length > 0) {
      filter = { author: { $in: currentUser.following } };
    } else {
      // Fallback: show popular or recent public recipes
      filter = {}; // all recipes
    }

    const totalRecipes = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl");

    const recipesWithSteps = recipes.map(r => {
      const rObj = r.toObject();
      rObj.steps = normalizeSteps(rObj);
      return rObj;
    });

    res.status(200).json({
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes: recipesWithSteps
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/recipes/user/:userId?page=1
exports.getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalRecipes = await Recipe.countDocuments({ author: userId });

    const recipes = await Recipe.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl");

    const recipesWithSteps = recipes.map(r => {
      const rObj = r.toObject();
      rObj.steps = normalizeSteps(rObj);
      return rObj;
    });

    res.status(200).json({
      userId,
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes: recipesWithSteps
    });
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/:id
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id)
      .populate("author", "username name avatarUrl");

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const recipeObj = recipe.toObject();
    recipeObj.steps = normalizeSteps(recipeObj);

    res.status(200).json({ recipe: recipeObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { followUser, unfollowUser, getUserSuggestions, getUserProfile } = require("../controllers/userController");

router.post("/:id/follow", authMiddleware, followUser);
router.post("/:id/unfollow", authMiddleware, unfollowUser);
router.get("/suggestions", authMiddleware, getUserSuggestions);
router.get("/:id", getUserProfile);
module.exports = router; 

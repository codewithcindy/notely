const express = require("express");
const router = express.Router({ mergeParams: true });

const Todo = require("../models/todoModel");
const User = require("../models/userModel");
const { isLoggedIn } = require("../middleware");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

router.get("/", isLoggedIn, async (req, res) => {
  const { user } = req.session.passport;
  const currentUser = await User.findOne({ username: user }).populate("todos");

  // Pass array of documents to home page
  res.render("home", { currentUser });
  // res.render("home");
});

// Serve edit pfp form
router.get("/profile", isLoggedIn, async (req, res) => {
  res.render("profile/edit");
});

// Save pfp form
router.post(
  "/profile",
  isLoggedIn,
  upload.single("profile-image"),
  async (req, res) => {
    const currentUser = req.user;

    // Get current user
    // const currentUser = await User.findOne({ username: user });

    // Get new profile image
    if (!req.file) {
      req.flash("error", "Please include an image file");
      return res.redirect("/home/profile");
    } else {
      currentUser.profile.image = {
        url: req.file.path,
        filename: req.file.filename,
      };

      currentUser.save();
    }
    // Set profile image to user's
    res.redirect("/home");
  }
);

module.exports = router;

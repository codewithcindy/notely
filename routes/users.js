const express = require("express");
const router = express.Router({ mergeParams: true });

const User = require("../models/userModel");
const passport = require("passport");

// Home Page
router.get("/", async (req, res) => {
  // Check if user is already logged in
  // If yes, redirect to home page
  // If not, serve requested page

  if (req.isAuthenticated()) {
    res.redirect("/home");
  } else {
    res.render("users/welcome");
  }
});

router.get("/prelogin", async (req, res) => {
  res.render("users/prelogin");
});

router.post("/prelogin", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  req.app.set("user", username);

  if (user) {
    // req.app.set("user", user);
    res.redirect("/login");
  } else {
    // req.app.set("user", username);
    res.redirect("/register");
  }
});

router.get("/login", async (req, res) => {
  // Check if user is already logged in
  // If yes, redirect to home page
  // If not, serve requested page

  if (req.isAuthenticated()) {
    res.redirect("/home");
  } else {
    res.render("users/login", { user: req.app.get("user") });
  }
});

// Log In
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const user = req.user;

    req.flash("success", `welcome back, ${user.username} :)`);
    res.redirect("/home");
  }
);

// Register - serve form
router.get("/register", async (req, res) => {
  // Check if user is already logged in
  // If yes, redirect to home page
  // If not, serve requested page

  if (req.isAuthenticated()) {
    res.redirect("/home");
  } else {
    res.render("users/register", { user: req.app.get("user") });
  }
});

// Register - save user and login
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ email, username });

    // Register new user
    const registeredUser = await User.register(user, password);

    // Log in user
    req.login(registeredUser, (err) => {
      if (err) return next(err);
    });

    req.flash("success", "welcome to notely :)");
    res.redirect("/home");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// Log Out
router.post("/logout", async (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;

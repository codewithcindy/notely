const express = require("express");
const router = express.Router({ mergeParams: true });

const Todo = require("../models/todoModel");
const User = require("../models/userModel");

// To Do List - Add new
router.post("/new", async (req, res) => {
  newTodo = req.body;
  const { user } = req.session.passport;

  const currentUser = await User.findOne({ username: user });

  if (newTodo.todoText) {
    // Create new document
    const todoItem = new Todo(newTodo);

    // Set document `text` to the todo input name
    todoItem.text = newTodo.todoText;

    // Set todo user to be current user
    todoItem.user = currentUser;

    // Add todo to the user's todos array
    await currentUser.todos.push(todoItem);

    // Save/update user
    await currentUser.save();

    // Save todo document
    await todoItem.save();

    // Redirect back to home page
    res.redirect("/home");
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.session.passport;

  // Get current user
  const currentUser = await User.findOne({ username: user });

  await Todo.findByIdAndDelete(id);

  await User.findByIdAndUpdate(currentUser._id, { $pull: { todos: id } });

  res.redirect("/home");
});

module.exports = router;

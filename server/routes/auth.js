const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in environment variables.");
  process.exit(1);
}

const validateAuthInput = (username, password) => {
  if (!username || !username.trim()) return "Username is required.";
  if (username.trim().length < 3) return "Username must be atleast 3 characters.";
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be atleast 6 characters.";
  return null;
}

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const validationError = validateAuthInput(username, password);
  if (validationError) return res.status(400).json({ msg: validationError });

  try {
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username: username.trim(), password: hashedPassword });
    await newUser.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const validationError = validateAuthInput(username, password);
  if (validationError) return res.status(400).json({ msg: validationError });

  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

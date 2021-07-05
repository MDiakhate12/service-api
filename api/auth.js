const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // Validations
  if (!email || !password)
    return res
      .status(400)
      .json({ msg: "Invalid request, Please give all fields." });

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User doesn't exist" });

    // Compare password
    bcrypt.compare(password, user.password);

    user = await User.findOne({ email }).select("-password");

    // Create a new token
    const token = await jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: 24 * 60 * 60,
    });

    // Send user info
    res.send({ token, user });
  } catch (error) {
    res.send({ msg: error.message });
  }
});

module.exports = router;

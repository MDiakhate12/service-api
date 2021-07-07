const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

router.post("/", async (req, res) => {
  const { firstname, lastname, matricule, email, password } = req.body;

  // Validations
  if (!firstname || !lastname || !matricule || !email || !password)
    return res
      .status(400)
      .json({ msg: "Invalid request, Please give all fields." });

  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) return res.status(400).json({ msg: "User already exists" });

  // Create user if doesn't exist
  user = User({
    firstname,
    lastname,
    matricule,
    email,
    password,
  });

  // Hash the user password
  let salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);

  // Save new user with hashed password
  await user.save();

  // Create a new token
  const token = await jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: 24 * 60 * 60,
  });

  // Send new user info
  res.send({ token, user });
});

module.exports = router;



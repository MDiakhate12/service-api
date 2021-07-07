const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

function auth(req, res, next) {
  const token = req.header("X-Auth-Token");

  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(400).json({ msg: "Invalid token" });
  }
}

module.exports = auth;

import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authValidate from '../middlewares/authValidate.js';
import mongoose from 'mongoose';
const auth_user_Router = express.Router();


auth_user_Router.post("/register", authValidate, async (req, res) => {
  const { username, email, password } = req.body;

  const role = "user";

  const existUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existUser) {
    return res.status(409).json({ message: "Username or Email already taken" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  res.json({ message: "User registered", user: newUser });
});

auth_user_Router.post("/login", authValidate, async (req, res) => {
  const { email, username, password } = req.body;

  const existUser = await User.findOne({ $or: [{ email }, { username }] });
  if (!existUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isValidPass = bcrypt.compareSync(password, existUser.password);
  if (!isValidPass) {
    return res.status(401).json({ message: "Wrong password" });
  }

  if (req.body.role && req.body.role !== existUser.role) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: existUser._id.toString(), email: existUser.email, username: existUser.username, role: existUser.role },
    process.env.SECRET_KEY
  );

  res.json({ message: "Logged in successfully", token, user: { id: existUser._id, email: existUser.email, username: existUser.username, role: existUser.role } });
});

export default auth_user_Router;

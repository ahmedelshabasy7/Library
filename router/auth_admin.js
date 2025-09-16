import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import authValidate from '../middlewares/authValidate.js';
import mongoose from 'mongoose';

const auth_admin_Router = express.Router();

auth_admin_Router.post("/register", authValidate, async (req, res) => {
  const { username, email, password } = req.body;
  const role = "admin";

  const existAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
  if (existAdmin) {
    return res.status(409).json({ message: "Username or Email already taken" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newAdmin = await Admin.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  res.json({ message: "Admin registered", admin: newAdmin });
});

auth_admin_Router.post("/login", authValidate, async (req, res) => {
  const { username, email, password } = req.body;

  const existAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
  if (!existAdmin) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const isValidPass = bcrypt.compareSync(password, existAdmin.password);
  if (!isValidPass) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: existAdmin._id.toString(), email: existAdmin.email, username: existAdmin.username, role: existAdmin.role },
    process.env.SECRET_KEY
  );

  res.json({ message: "Admin logged in successfully", token, admin: { id: existAdmin._id, username: existAdmin.username, email: existAdmin.email, role: existAdmin.role } });
});

export default auth_admin_Router;

import express from 'express';
import User from '../models/User.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import mongoose from 'mongoose';
const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  console.log(req.user);
  const user = await User.find();
  res.json({
    message: "users retrieved success",
    data: user,
  });
});

// current user info (username, email, role, notifications) with legacy name fallback
router.get('/me', authenticate, async (req, res) => {
  const me = await User.findById(req.user.id).select('username name email role notifications');
  if (!me) return res.status(404).json({ message: 'User not found' });
  // fallback: if legacy document has name but no username
  if (!me.username && me.name) {
    me.username = me.name; // in-memory only
  }
  res.json({ message: 'ok', user: { id: me._id, username: me.username, email: me.email, role: me.role, notifications: me.notifications } });
});

// mark all notifications as read
router.put('/notifications/read-all', authenticate, async (req, res) => {
  await User.updateOne({ _id: req.user.id, 'notifications.read': false }, { $set: { 'notifications.$[].read': true } });
  const me = await User.findById(req.user.id).select('notifications');
  res.json({ message: 'ok', notifications: me.notifications });
});

export default router;

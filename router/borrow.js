import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import authenticate from '../middlewares/authenticate.js';
import mongoose from 'mongoose';
const borrowRouter = express.Router();


function hasActiveBorrow(book) {
  const now = new Date();
  return book.history.some(h => h.status === 'active' && !h.returned_at && h.borrowed_to > now);
}

// Borrow a book
borrowRouter.post("/:id", authenticate, async function (req, res) {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: "Admins are not allowed to borrow books", code: 403 });
  }
  const book_id = req.params.id;
  const user_id = req.user.id;
  const borrowed_to_raw = req.body.borrowed_to;

  // Validate date
  if (!borrowed_to_raw) {
    return res.status(400).json({ message: 'set the date', code: 400 });
  }
  const borrowed_to = new Date(borrowed_to_raw);
  const now = new Date();
  if (isNaN(borrowed_to.getTime())) {
    return res.status(400).json({ message: 'Invalid borrowed_to date', code: 400 });
  }
  if (borrowed_to <= now) {
    return res.status(400).json({ message: 'borrowed_to must be in the future', code: 400 });
  }

  const MAX_DAYS = parseInt(process.env.MAX_BORROW_DAYS || '30', 10);
  const diffDays = (borrowed_to - now) / (1000 * 60 * 60 * 24);
  if (diffDays > MAX_DAYS) {
    return res.status(400).json({ message: `Maximum borrow period is ${MAX_DAYS} days`, code: 400 });
  }

  // Fetch book + user
  const book = await Book.findById(book_id);
  if (!book) {
    return res.status(404).json({ message: "Book not found", code: 404 });
  }
  if (!book.isApproved || !book.isPublished) {
    return res.status(403).json({ message: "Book not available for borrowing", code: 403 });
  }
  if (book.author.toString() === user_id.toString()) {
    return res.status(400).json({ message: "You cannot borrow your own book", code: 400 });
  }
  if (hasActiveBorrow(book)) {
    return res.status(400).json({ message: "Book is already borrowed", code: 400 });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found", code: 404 });
  }
  const userActiveBorrow = user.borrowed_books.find(b => b.book.toString() === book._id.toString());
  if (userActiveBorrow) {
    return res.status(400).json({ message: 'You already borrowed this book', code: 400 });
  }

  // Append to user
  user.borrowed_books.push({
    book: book._id,
    borrowed_from: now,
    borrowed_to
  });
  await user.save();

  // Append to book history
  book.history.push({
    borrowed_from: now,
    borrowed_to,
    borrowed_by: user_id,
    status: 'active'
  });
  await book.save();

  res.json({ message: 'Book borrowed successfully', code: 200 });
});

borrowRouter.get("/", authenticate, async function (req, res) {
  const user = await User.findById(req.user.id).populate("borrowed_books.book", "type isApproved");

  if (!user) {
    return res.status(404).json({ message: "User not found", code: 404 });
  }

  res.json({
    message: "Borrowed books",
    data: user.borrowed_books,
  });
});

// Return a borrowed book (early or normal)
borrowRouter.put('/:id/return', authenticate, async function (req, res) {
  const book_id = req.params.id;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Remove from user.borrowed_books
  const before = user.borrowed_books.length;
  user.borrowed_books = user.borrowed_books.filter(entry => entry.book.toString() !== book_id);
  if (user.borrowed_books.length === before) {
    return res.status(400).json({ message: 'You do not have this book borrowed' });
  }
  await user.save();

  // Remove the active borrow record from book.history 
  const book = await Book.findById(book_id);
  if (book) {
    const beforeLen = book.history.length;

    book.history = book.history.filter(h => {
      if (!h.borrowed_by) return true;
      const sameUser = h.borrowed_by.toString() === req.user.id.toString();
      const active = h.status === 'active' && !h.returned_at;
      return !(sameUser && active);
    });
    if (book.history.length !== beforeLen) {
      await book.save();
    }
  }

  res.json({ message: 'Book returned successfully' });
});

export default borrowRouter;

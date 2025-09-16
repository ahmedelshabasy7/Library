import express from 'express';
import Book from '../models/Book.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import authenticate from '../middlewares/authenticate.js';
import mongoose from 'mongoose';
const bookRouter = express.Router();

// User publishes a book -> starts as not published & not approved; admin approval will publish it
bookRouter.post("/", authenticate, async function (req, res) {
  const { type } = req.body;
  const author = new mongoose.Types.ObjectId(req.user.id);
  const book = await Book.create({ author, type, isPublished: false, isApproved: false, isRejected: false });
  res.json({ message: "Book submitted for approval", book });
});

bookRouter.get("/", async function (req, res) {
  const books = await Book.find({ isApproved: true, isPublished: true }).populate("author", "username name email");
  const now = new Date();
  const toPersist = []; // books needing status update (expired)

  const normalized = books.map(b => {
    let mutated = false;
    // Normalize author
    const obj = b.toObject({ getters: true });
    if (obj.author && (!obj.author.username || obj.author.username === '')) {
      if (obj.author.name && obj.author.name !== '') {
        obj.author.username = obj.author.name;
      } else if (obj.author.email) {
        obj.author.username = obj.author.email.split('@')[0];
      } else {
        obj.author.username = 'Unknown';
      }
    }
    // Upgrade history statuses (expire where needed)
    if (Array.isArray(b.history)) {
      b.history.forEach(h => {
        if (h.status === 'active' && !h.returned_at && h.borrowed_to < now) {
          h.status = 'expired';
          mutated = true;
        }
      });
    }
    if (mutated) toPersist.push(b);

    const hasActive = b.history.some(h => h.status === 'active' && !h.returned_at && h.borrowed_to > now);
    obj.isCurrentlyBorrowed = hasActive;
    obj.state = hasActive ? 'borrowed' : 'available';
    return obj;
  });

  // Persist any mutation (best effort / fire and forget style)
  Promise.allSettled(toPersist.map(doc => doc.save())).catch(() => { });

  res.json({
    message: "successfully retrieved books",
    code: 200,
    data: normalized,
  });
});

// Get all books authored by current authenticated user (any status)
bookRouter.get('/mine', authenticate, async function (req, res) {
  const authorId = req.user.id;
  const books = await Book.find({ author: authorId }).sort({ _id: -1 });
  res.json({
    message: 'my books',
    data: books,
  });
});

bookRouter.get("/:id", async function (req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book id" });
  }
  const book = await Book.findById(id).populate("author", "username name email");
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json({
    message: "success",
    data: book,
  });
});

bookRouter.put("/:id", authenticate, async function (req, res) {
  const id = req.params.id;
  const author = new mongoose.Types.ObjectId(req.user.id);
  const { type } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book id" });
  }
  const book = await Book.findByIdAndUpdate(id, { author, type }, { new: true, upsert: false });
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json({
    message: "updated success",
    data: book,
  });
});

bookRouter.delete("/:id", authenticate, async function (req, res) {
  const bookId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book id" });
  }

  const book = await Book.findByIdAndDelete(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }


  await Admin.updateMany(
    { approved_books: book._id },
    { $pull: { approved_books: book._id } }
  );


  await User.updateMany(
    { authored_books: book._id },
    { $pull: { authored_books: book._id } }
  );


  await User.updateMany(
    { "borrowed_books.book": book._id },
    { $pull: { borrowed_books: { book: book._id } } }
  );

  return res.json({
    message: "Book deleted successfully and cleaned from related users/admins",
    data: book,
  });
});


export default bookRouter;

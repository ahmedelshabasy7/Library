import express from 'express';
import Book from '../models/Book.js';
import Admin from '../models/Admin.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import User from '../models/User.js';
const adminRouter = express.Router();

// Simple health endpoint to verify admin router is mounted and auth works
adminRouter.get('/_health', authenticate, authorize, (req, res) => {
  res.json({ ok: true, user: { id: req.user.id, role: req.user.role } });
});

adminRouter.get("/", authenticate, authorize, async (req, res) => {
  const admin = await Admin.findById(req.user.id).populate({
    path: "approved_books",
    select: "_id author type",
    populate: {
      path: "author",
      model: "User",
      select: "username name email"
    }
  });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  res.json({
    message: "Admin retrieved successfully",
    admin: {
      username: admin.username || admin.name,
      name: admin.name, // legacy
      email: admin.email,
      role: admin.role,
      id: admin._id,
      approved_books: admin.approved_books,
    },
  });
});

// List all books (approved & pending) for admin moderation
adminRouter.get("/books", authenticate, authorize, async (req, res) => {
  const books = await Book.find({}).sort({ _id: -1 }).populate("author", "username name email");

  const normalized = books.map(b => {
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
    return obj;
  });
  const pending = normalized.filter(b => !b.isApproved).length;
  const approved = normalized.filter(b => b.isApproved).length;
  console.log(`[ADMIN /books] total=${normalized.length} pending=${pending} approved=${approved}`);
  res.json({
    message: "All books",
    total: normalized.length,
    pending,
    approved,
    data: normalized,
  });
});

adminRouter.put("/books/:id/approve", authenticate, authorize, async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, isPublished: true, isRejected: false },
    { new: true }
  );

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
      code: 404,
    });
  }


  const admin = await Admin.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { approved_books: book._id } },
    { new: true }
  );


  const authorId = book.author;
  const user = await User.findByIdAndUpdate(
    authorId,
    {
      $addToSet: { authored_books: book._id },
      $push: { notifications: { message: `Your book "${book.type}" was approved.` } }
    },
    { new: true }
  );

  res.json({
    message: "Book approved successfully and added to admin's approved list and user's authored_books",
    book,
    admin,
  });
});

adminRouter.put("/books/:id/reject", authenticate, authorize, async (req, res) => {
  const bookId = req.params.id;


  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found", code: 404 });
  }


  book.isApproved = false;
  book.isPublished = false;
  book.isRejected = true;
  await book.save();


  await Admin.updateMany(
    { approved_books: book._id },
    { $pull: { approved_books: book._id } }
  );


  await User.updateMany(
    { authored_books: book._id },
    { $pull: { authored_books: book._id } }
  );
  // Notify author
  await User.findByIdAndUpdate(book.author, { $push: { notifications: { message: `Sorry, admin rejected your book "${book.type}".` } } });

  res.json({
    message: "Book rejected , removed from author and admin lists",
    data: book,
  });
});

export default adminRouter;
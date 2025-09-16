import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: "user",
    required: true,
  },
  authored_books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  borrowed_books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      borrowed_from: { type: Date, required: true },
      borrowed_to: { type: Date, required: true },
    },
  ],
  notifications: [
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: () => new Date() },
      read: { type: Boolean, default: false },
    },
  ],
});

const User = mongoose.model('User', userSchema);
export default User;

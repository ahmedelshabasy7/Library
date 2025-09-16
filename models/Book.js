import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  history: {
    type: [
      {
        borrowed_from: {
          type: Date,
          required: true,
          default: () => new Date(),
        },
        borrowed_to: {
          type: Date,
          required: true,
        },
        borrowed_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        status: {
          type: String,
          enum: ["active", "returned", "expired"],
          default: "active",
        },

        returned_at: { type: Date, default: null },
      },
    ],
    default: [],
  },
});

const Book = mongoose.model('Book', bookSchema);
export default Book;

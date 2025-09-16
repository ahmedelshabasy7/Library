import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  approved_books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  role: {
    type: String,
    default: "admin",
    required: true,
  },
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;

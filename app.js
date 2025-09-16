import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import auth_user_Router from './router/auth_user.js';
import auth_admin_Router from './router/auth_admin.js';
import userRouter from './router/users.js';
import adminRouter from './router/admin.js';
import bookRouter from './router/books.js';
import borrowRouter from './router/borrow.js';
import dbConnect from './config/database.js';
import mongoose from 'mongoose';
import { handleBorrowManagement } from './utils/returnScheduler.js';

dotenv.config();

const app = express();

const uri = process.env.APP_URI;
app.use(bodyParser.json());
app.use((req, res, next) => { console.log(`[REQ] ${req.method} ${req.url}`); next(); });
app.use(cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		const allowed = ["http://localhost:5174", process.env.FRONTEND_ORIGIN].filter(Boolean);
		if (allowed.length === 0) return callback(null, true);
		if (allowed.includes(origin)) return callback(null, true);
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: false,
}));
dbConnect(uri);

app.use('/auth/user', auth_user_Router);
app.use('/auth/admin', auth_admin_Router);
app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/books', bookRouter);
app.use('/borrow', borrowRouter);

handleBorrowManagement();

const port = process.env.PORT || 3000;
if (!process.env.VERCEL) {
	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
}

export default app;

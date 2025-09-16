import cron from 'node-cron';
import Book from '../models/Book.js';
import User from '../models/User.js';

// Function to send notifications
async function sendNotification(userId, message) {
    const user = await User.findById(userId);
    if (user) {
        user.notifications.push({ message, read: false });
        await user.save();
    }
}

// Function to handle notifications and automatic removals
async function handleBorrowManagement() {
    const now = new Date();

    const books = await Book.find({ 'history.status': 'active' });

    for (const book of books) {
        const originalLength = book.history.length;


        const activeBorrows = book.history.filter(h => h.status === 'active');

        for (const borrow of activeBorrows) {
            const borrowedTo = new Date(borrow.borrowed_to);
            const timeRemaining = borrowedTo - now;
            const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

            if (daysRemaining > 0 && daysRemaining <= 3) {
                await sendNotification(
                    borrow.user,
                    `The borrow period for the book "${book.title}" is nearing expiration. Please return it by ${borrowedTo.toDateString()}.`
                );
            } else if (daysRemaining <= 0) {

                book.history = book.history.filter(
                    (h) => h._id.toString() !== borrow._id.toString()
                );

                await sendNotification(
                    borrow.user,
                    `The borrow period for the book "${book.title}" has expired and the book has been automatically returned.`
                );
            }
        }


        if (book.history.length !== originalLength) {
            book.markModified('history');
            await book.save();
        }
    }
}

// Schedule the cron job to run daily (conditional by env ENABLE_CRON)
if (!process.env.ENABLE_CRON || process.env.ENABLE_CRON.toLowerCase() === 'true') {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily borrow management (notifications and removals)...');
        await handleBorrowManagement();
    });
}

export { handleBorrowManagement };

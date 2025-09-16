import mongoose from 'mongoose';

const dbConnect = (uri) => {
  try {
    mongoose
      .connect(uri, { dbName: 'My_Library' })
      .then(() => console.log('Connected to Database successfully'))
      .catch(() => console.error('Error connecting to db'));
  } catch (error) {
    console.error('Error connecting to db');
    process.exit(1);
  }
};

export default dbConnect;

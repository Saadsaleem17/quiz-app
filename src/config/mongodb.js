// MongoDB configuration and connection
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://saadsaleem17oct:mmsMijMD1g9r1uyM@cluster0.xwdy0te.mongodb.net/quiz-app';

let isConnected = false;

export const connectMongoDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export const disconnectMongoDB = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('MongoDB disconnection error:', error);
    }
};

// Connection status
export const isMongoConnected = () => isConnected;

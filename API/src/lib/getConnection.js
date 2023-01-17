import mongoose from 'mongoose';

export default function getConnection(){
    return mongoose.createConnection(process.env.MONGO_URI).asPromise();
}
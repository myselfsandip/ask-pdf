import mongoose from "mongoose";

export const GRIDFS_BUCKET_NAME = "documents"; 

export const getGridFSBucket = (): mongoose.mongo.GridFSBucket => {
    if (!mongoose.connection.db) {
        throw new Error("MongoDB connection not established");
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: GRIDFS_BUCKET_NAME,
    });
};
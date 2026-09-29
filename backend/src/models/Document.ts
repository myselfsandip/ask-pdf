import mongoose, { Document, Schema } from "mongoose";

export interface IDocuments extends Document {
    userId: string;
    filename: string;
    path: string;
    status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
    chunkCount: number;
    uploadedAt: Date;
    processedAt?: Date;
    error?: string;
}

const documentsSchema = new Schema<IDocuments>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        filename: {
            type: String,
            required: true,
            trim: true,
        },
        path: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"],
            default: "UPLOADED",
            required: true,
        },
        chunkCount: {
            type: Number,
            default: 0,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
        error: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Documents = mongoose.model<IDocuments>(
    "Document",
    documentsSchema
);
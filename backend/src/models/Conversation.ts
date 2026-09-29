import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
    _id: Types.ObjectId;
    userId: string;
    documentId: string;
}

const conversationSchema = new Schema<IConversation>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        documentId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
    },
    { timestamps: true },
);

export const Conversations = mongoose.model<IConversation>("Conversation", conversationSchema);
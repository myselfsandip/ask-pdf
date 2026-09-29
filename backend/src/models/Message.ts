import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    userId: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
}

const messageSchema = new Schema<IMessage>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        conversationId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

export const Messages = mongoose.model<IMessage>("Message", messageSchema);
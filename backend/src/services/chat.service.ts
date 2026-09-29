import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Conversations } from "../models/Conversation.js";
import { Messages, type IMessage } from "../models/Message.js";
import { Documents } from "../models/Document.js";
import { retrieveRelevantChunks } from "./retrieval.service.js";
import { buildRagPrompt } from "./prompt.service.js";
import { Env } from "../config/env.config.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import { ErrorCodeEnum } from "../utils/error-code.enum.js";

// Only Send Limited History to AI MODEL not ALL History
const MAX_HISTORY_MESSAGES = 8;

export type ChatStreamEvent =
    | { type: "conversationId"; value: string }
    | { type: "token"; value: string }
    | { type: "sources"; value: { filename: string; pageNumber: number | null }[] };


let model: ChatGoogleGenerativeAI | null = null;

function getModel(): ChatGoogleGenerativeAI {
    if (!model) {
        model = new ChatGoogleGenerativeAI({
            model: Env.GEMINI_CHAT_MODEL,
            apiKey: Env.GEMINI_API_KEY,
            temperature: 0.2,
            streaming: true,
        });
    }
    return model;
}

async function* streamAnswer(prompt: string): AsyncGenerator<string> {
    const stream = await getModel().stream(prompt);

    for await (const chunk of stream) {
        const content = chunk.content;
        const text =
            typeof content === "string"
                ? content
                : Array.isArray(content)
                    ? content
                        .map((part) => (typeof part === "string" ? part : ("text" in part ? part.text : "")))
                        .join("")
                    : "";

        if (text) yield text;
    }
}



async function getOrCreateConversation(userId: string, documentId: string, conversationId?: string) {
    if (conversationId) {
        const existing = await Conversations.findOne({ _id: conversationId, userId, documentId });
        if (existing) return existing;
    }
    return Conversations.create({ userId, documentId });
}

async function getRecentMessages(conversationId: string): Promise<Pick<IMessage, "role" | "content">[]> {
    const messages = await Messages.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(MAX_HISTORY_MESSAGES)
        .lean();

    return messages.reverse();
}

function formatHistory(messages: Pick<IMessage, "role" | "content">[]): string {
    if (messages.length === 0) return "(no previous messages)";
    return messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
}




export async function* answerQuestion({
    userId,
    documentId,
    question,
    conversationId,
}: {
    userId: string;
    documentId: string;
    question: string;
    conversationId?: string | undefined;
}): AsyncGenerator<ChatStreamEvent> {
    if (!question?.trim()) {
        throw new BadRequestException("question is required");
    }

    const document = await Documents.findOne({ _id: documentId, userId });
    if (!document) {
        throw new NotFoundException("Document not found");
    }
    if (document.status !== "COMPLETED") {
        throw new BadRequestException("This document isn't finished indexing yet", ErrorCodeEnum.DOCUMENT_NOT_READY);
    }

    const conversation = await getOrCreateConversation(userId, documentId, conversationId);
    const conversationIdStr = conversation._id.toString();

    const history = await getRecentMessages(conversationIdStr);
    const chunks = await retrieveRelevantChunks(documentId, question);

    const context =
        chunks.length > 0
            ? chunks.map((c, i) => `[${i + 1}] (Page ${c.pageNumber ?? "?"}) ${c.content}`).join("\n\n")
            : "(no relevant context was found in the document for this question)";

    const prompt = buildRagPrompt({
        context,
        recentConversation: formatHistory(history),
        question,
    });

    await Messages.create({ userId, conversationId: conversationIdStr, role: "user", content: question });

    yield { type: "conversationId", value: conversationIdStr };

    let fullAnswer = "";
    for await (const token of streamAnswer(prompt)) {
        fullAnswer += token;
        yield { type: "token", value: token };
    }

    await Messages.create({
        userId,
        conversationId: conversationIdStr,
        role: "assistant",
        content: fullAnswer,
    });

    yield {
        type: "sources",
        value: chunks.map((c) => ({ filename: c.filename, pageNumber: c.pageNumber })),
    };
}

export async function getConversationMessages(conversationId: string, userId: string) {
    const conversation = await Conversations.findOne({ _id: conversationId, userId });
    if (!conversation) {
        throw new NotFoundException("Conversation not found", ErrorCodeEnum.CONVERSATION_NOT_FOUND);
    }
    return Messages.find({ conversationId }).sort({ createdAt: 1 }).lean();
}
import { Request, Response } from "express";
import { z } from "zod";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../config/asyncHandler.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { answerQuestion, getConversationMessages } from "../services/chat.service.js";
import { UnauthorizedException } from "../utils/app-error.js";
import { logger } from "../config/winston.js";

const streamChatSchema = z.object({
    documentId: z.string().min(1, "documentId is required"),
    question: z.string().trim().min(1, "question is required"),
    conversationId: z.string().min(1).optional(),
});

const conversationParamsSchema = z.object({
    conversationId: z.string().min(1, "conversationId is required"),
});


export const streamChatController = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new UnauthorizedException();
    }

    const { documentId, question, conversationId } = streamChatSchema.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    req.on("close", () => {
        res.end();
    });

    try {
        for await (const chunk of answerQuestion({ userId, documentId, question, conversationId })) {
            send(chunk.type, chunk.value);
        }
        send("done", true);
    } catch (error) {
        logger.error(`Error Ocurred In Chat Stream`, error);
        send("error", error instanceof Error ? error.message : "Something went wrong");
    } finally {
        res.end();
    }
});


export const getConversationController = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new UnauthorizedException();
    }

    const { conversationId } = conversationParamsSchema.parse(req.params);

    const messages = await getConversationMessages(conversationId, userId);

    return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Conversation fetched successfully",
        messages,
    });
});
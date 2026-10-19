import { Router } from "express";
import { getConversationController, getDocumentConversationController, streamChatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/stream", streamChatController);
router.get("/conversations/:conversationId", getConversationController);
router.get("/documents/:documentId/conversation", getDocumentConversationController);

export default router;
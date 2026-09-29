import { Router } from "express";
import { getConversationController, streamChatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/stream", streamChatController);
router.get("/conversations/:conversationId", getConversationController);

export default router;
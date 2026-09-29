import { Router } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import documentsRoutes from "./documents.routes.js";
import chatRoutes from "./chat.routes.js";




const router = Router();


router.get("/health", (req, res) => {
    res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Health 100% Ok 🥴",
    })
});


router.use("/documents", documentsRoutes);
router.use("/chat", chatRoutes);


export default router;
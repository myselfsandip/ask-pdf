import { Router } from "express";
import {
    deleteDocumentController,
    getDocumentByIdController,
    listAllDocumentsController,
    uploadDocumentController,
} from "../controllers/document.controller.js";
import { uploadSingle } from "../config/multer.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(requireAuth);

router.post("/", uploadSingle.single("pdf"), uploadDocumentController);
router.get("/", listAllDocumentsController);
router.get("/:documentId", getDocumentByIdController);
router.delete("/:documentId", deleteDocumentController);

export default router;
import { Router } from "express";
import {
    deleteDocumentController,
    downloadDocumentController,
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
router.get("/:documentId/download", downloadDocumentController);


export default router;
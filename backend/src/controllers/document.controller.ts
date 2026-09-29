import { Request, Response } from "express";
import { z } from "zod";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../config/asyncHandler.js";
import { HTTPSTATUS } from "../config/http.config.js";
import {
    deleteDocument,
    getDocumentById,
    listAllDocuments,
    uploadDocument,
} from "../services/document.service.js";
import { UnauthorizedException } from "../utils/app-error.js";

const documentParamsSchema = z.object({
    documentId: z.string().min(1, "documentId is required"),
});

export const uploadDocumentController = asyncHandler(async (req: Request, res: Response) => {
    const { jobId, document } = await uploadDocument(req);
    return res.status(HTTPSTATUS.ACCEPTED).json({
        success: true,
        message: "File processing started",
        documentId: document._id,
        jobId,
    })
});

export const listAllDocumentsController = asyncHandler(
    async (req, res) => {
        const { userId } = getAuth(req);
        if (!userId) {
            throw new UnauthorizedException();
        }
        const documents = await listAllDocuments(userId);
        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Documents fetched successfully",
            documents,
        })
    }
)

export const getDocumentByIdController = asyncHandler(
    async (req, res) => {
        const { userId } = getAuth(req);
        if (!userId) {
            throw new UnauthorizedException();
        }

        const { documentId } = documentParamsSchema.parse(req.params);

        const document = await getDocumentById(documentId, userId);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Document fetched successfully",
            document,
        })
    }
)

export const deleteDocumentController = asyncHandler(
    async (req, res) => {
        const { userId } = getAuth(req);
        if (!userId) {
            throw new UnauthorizedException();
        }

        const { documentId } = documentParamsSchema.parse(req.params);

        await deleteDocument(documentId, userId);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Document deleted successfully",
        });
    }
)
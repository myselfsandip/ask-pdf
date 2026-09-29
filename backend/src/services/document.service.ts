import { Request } from "express";
import path from "path";
import fs from "fs/promises";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import { documentQueue } from "../queues/document.queue.js";
import { Documents } from "../models/Document.js";
import { deleteVectorsForDocument } from "./retrieval.service.js";

export const uploadDocument = async (req: Request) => {
    if (!req.file) {
        throw new BadRequestException("PDF File is required");
    }
    if (!req.userId) {
        throw new UnauthorizedException();
    }

    const absolutePath = path.resolve(req.file.path);
    const fileName = req.file.originalname;

    const document = await Documents.create({
        userId: req.userId,
        filename: fileName,
        path: absolutePath,
        status: "UPLOADED",
        uploadedAt: new Date(),
    });

    // Create JOB
    const job = await documentQueue.add('file-ready', {
        documentId: document._id.toString(),
        filename: fileName,
        path: absolutePath,
    });

    return {
        document,
        jobId: job.id,
    }
}

export const listAllDocuments = async (userId: string) => {
    const allDocuments = await Documents.find({ userId }).sort({ uploadedAt: -1 });
    return allDocuments;
}

export const getDocumentById = async (documentId: string, userId: string) => {
    const document = await Documents.findOne({
        _id: documentId,
        userId,
    });

    if (!document) {
        throw new NotFoundException("Document Not Found");
    }

    return document;
}


export const deleteDocument = async (documentId: string, userId: string) => {
    const document = await Documents.findOne({ _id: documentId, userId });

    if (!document) {
        throw new NotFoundException("Document Not Found");
    }

    await deleteVectorsForDocument(documentId);

    try {
        await fs.unlink(document.path);
    } catch (err) {
        console.warn(`Could not delete file at ${document.path}:`, err);
    }

    await Documents.deleteOne({ _id: documentId });

    return { deleted: true };
}
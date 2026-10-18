import { Request } from "express";
import path from "path";
import fs from "fs/promises";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import { documentQueue } from "../queues/document.queue.js";
import { Documents } from "../models/Document.js";
import { deleteVectorsForDocument } from "./retrieval.service.js";
import mongoose from "mongoose";
import { getGridFSBucket } from "../config/gridfs.js";

export const uploadDocument = async (req: Request) => {
    if (!req.file) {
        throw new BadRequestException("PDF File is required");
    }
    if (!req.userId) {
        throw new UnauthorizedException();
    }

    const fileId = req.file.id as mongoose.Types.ObjectId;
    const fileName = req.file.originalname;


    const document = await Documents.create({
        userId: req.userId,
        filename: fileName,
        fileId,
        status: "UPLOADED",
        uploadedAt: new Date(),
    });

    // Create JOB
    const job = await documentQueue.add('file-ready', {
        documentId: document._id.toString(),
        filename: fileName,
        fileId: fileId.toString(),
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

    const bucket = getGridFSBucket();
    try {
        await bucket.delete(document.fileId);
    } catch (err) {
        console.warn(`File ${document.fileId} could not be deleted:`, err);
    }

    await Documents.deleteOne({ _id: documentId });

    console.log(`${document.fileId} is deleted successfully`);

    return { deleted: true };
}
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";
import { BadRequestException } from "../utils/app-error.js";
import { GRIDFS_BUCKET_NAME } from "./gridfs.js";

const storage = new GridFsStorage({
    db: mongoose.connection as any, 

    file: (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return {
            filename: `${uniqueSuffix}-${file.originalname}`,
            bucketName: GRIDFS_BUCKET_NAME,
            metadata: {
                originalName: file.originalname,
                contentType: file.mimetype,
                uploadedBy: req.userId,
            },
        };
    },
});

export const uploadSingle = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isPdfMime = file.mimetype === "application/pdf";
        const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
        if (isPdfMime && isPdfExt) return cb(null, true);
        cb(new BadRequestException("Only PDF files are allowed"));
    },
});
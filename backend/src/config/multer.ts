import multer from "multer";
import path from "path";
import fs from "fs";
import { Env } from "./env.config.js";
import { BadRequestException } from "../utils/app-error.js";

const uploadDir = path.resolve(Env.UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

export const uploadSingle = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB, per the plan
    },
    fileFilter: (req, file, cb) => {
        const isPdfMime = file.mimetype === "application/pdf";
        const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
        if (isPdfMime && isPdfExt) {
            cb(null, true);
            console.log(`File Uploaded Successfully : ${file.originalname}`);
            return;
        }
        cb(new BadRequestException("Only PDF files are allowed"));
    },
});
import winston from 'winston';
import 'winston-daily-rotate-file'; 
import path from 'path';
import { Env } from './env.config.js';

const { combine, timestamp, json, errors, prettyPrint } = winston.format;

//  Define Rotation Transport (14 days retention)
const fileRotateTransport = new winston.transports.DailyRotateFile({
    dirname: path.join(process.cwd(), 'logs'),
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d', // Auto-delete logs older than 14 days
    maxSize: '20m',  // Rotate if file exceeds 20MB
    zippedArchive: true, // Compress old logs to save space
});

// Define Error Transport (30 days retention)
const errorRotateTransport = new winston.transports.DailyRotateFile({
    dirname: path.join(process.cwd(), 'logs'),
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    zippedArchive: true,
});

export const logger = winston.createLogger({
    level: Env.LOG_LEVEL || 'info',
    // Use JSON in production for easier parsing 
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
    ),
    transports: [fileRotateTransport, errorRotateTransport],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ],
});

//  Add Console Transport for Non-Production
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: combine(
                winston.format.colorize(),
                winston.format.simple() // Simpler format for dev console
            ),
        })
    );
}

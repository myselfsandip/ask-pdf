import { rateLimit } from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, //15 min
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: (req) => req.url === '/reset',
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },

});

export const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    },
});
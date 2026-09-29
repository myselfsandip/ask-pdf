
/// <reference types="@clerk/express/env" />

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export { }; 
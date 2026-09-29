import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Env } from "../config/env.config.js";

let embeddings: GoogleGenerativeAIEmbeddings | null = null;

export function getEmbeddings(): GoogleGenerativeAIEmbeddings {
    if (!embeddings) {
        embeddings = new GoogleGenerativeAIEmbeddings({
            model: Env.GEMINI_EMBEDDING_MODEL,
            apiKey: Env.GEMINI_API_KEY,
        });
    }
    return embeddings;
}


export async function embedTextsIndividually(
    texts: string[],
    concurrency = 5,
): Promise<number[][]> {
    const embeddingsModel = getEmbeddings();
    const results: number[][] = new Array(texts.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < texts.length) {
            const i = nextIndex++;
            results[i] = await embeddingsModel.embedQuery(texts[i]);
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, () => worker()));

    return results;
}
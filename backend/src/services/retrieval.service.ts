import { QdrantVectorStore } from "@langchain/qdrant";
import { getEmbeddings } from "./embedding.service.js";
import { qdrantClient } from "../config/qdrant.js";
import { Env } from "../config/env.config.js";


const SIMILARITY_THRESHOLD = 0.7;
const TOP_K = 6;

export interface RetrievedChunk {
    content: string;
    filename: string;
    pageNumber: number | null;
    chunkIndex: number;
    score: number;
}

async function getVectorStore() {
    return QdrantVectorStore.fromExistingCollection(getEmbeddings(), {
        url: Env.QDRANT_URL,
        apiKey: Env.QDRANT_API_KEY,
        collectionName: Env.QDRANT_COLLECTION,
    });
}


export async function retrieveRelevantChunks(
    documentId: string,
    question: string,
): Promise<RetrievedChunk[]> {
    const vectorStore = await getVectorStore();

    const results = await vectorStore.similaritySearchWithScore(question, TOP_K, {
        must: [{ key: "metadata.documentId", match: { value: documentId } }],
    });

    return results
        .filter(([, score]) => score >= SIMILARITY_THRESHOLD)
        .map(([doc, score]) => ({
            content: doc.pageContent,
            filename: (doc.metadata?.["filename"] as string | undefined) ?? "unknown",
            pageNumber: (doc.metadata?.["pageNumber"] as number | undefined) ?? null,
            chunkIndex: (doc.metadata?.["chunkIndex"] as number | undefined) ?? -1,
            score,
        }));
}


export async function deleteVectorsForDocument(documentId: string): Promise<void> {
    try {
        await qdrantClient.getCollection(Env.QDRANT_COLLECTION);
    } catch {
        console.warn(
            `Qdrant collection "${Env.QDRANT_COLLECTION}" doesn't exist - skipping vector deletion for document ${documentId}.`,
        );
        return;
    }

    await qdrantClient.delete(Env.QDRANT_COLLECTION, {
        filter: {
            must: [{ key: "metadata.documentId", match: { value: documentId } }],
        },
    });
}
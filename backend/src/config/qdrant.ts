import { QdrantClient } from "@qdrant/js-client-rest";
import { Env } from "./env.config.js";
import { getEmbeddings } from "../services/embedding.service.js";

// @langchain/qdrant's QdrantVectorStore is great but does not give delete feature so we are including Qdrant Official SDK Client
export const qdrantClient = new QdrantClient({
    url: Env.QDRANT_URL,
    apiKey: Env.QDRANT_API_KEY,
});

let cachedDimensions: number | null = null;

async function getEmbeddingDimensions(): Promise<number> {
    if (cachedDimensions !== null) return cachedDimensions;
    const probeVector = await getEmbeddings().embedQuery("dimension probe");
    cachedDimensions = probeVector.length;
    return cachedDimensions;
}


export async function ensureQdrantCollection(): Promise<void> {
    const embeddingDimensions = await getEmbeddingDimensions();

    let existing: Awaited<ReturnType<typeof qdrantClient.getCollection>> | null = null;

    try {
        existing = await qdrantClient.getCollection(Env.QDRANT_COLLECTION);
    } catch {
        existing = null;
    }

    if (existing) {
        const vectorsConfig = existing.config?.params?.vectors;
        const currentSize =
            vectorsConfig && typeof vectorsConfig === "object" && "size" in vectorsConfig
                ? (vectorsConfig as { size?: number }).size
                : undefined;

        if (currentSize !== embeddingDimensions) {
            const problem =
                `Qdrant collection "${Env.QDRANT_COLLECTION}" exists with vector size ${currentSize}, ` +
                `but the configured embedding model outputs ${embeddingDimensions} dimensions. ` +
                `Every insert will fail with a dimension-mismatch error until this is fixed.`;

            if (Env.NODE_ENV === "production") {
                throw new Error(
                    `${problem} Refusing to auto-recreate in production — drop and recreate the collection manually once you're sure, then re-index affected documents.`,
                );
            }

            console.warn(
                `⚠️ ${problem} Recreating it (dev only) — any previously indexed vectors are lost; re-upload documents afterward.`,
            );

            await qdrantClient.deleteCollection(Env.QDRANT_COLLECTION);
            existing = null;
        }
    }

    if (!existing) {
        await qdrantClient.createCollection(Env.QDRANT_COLLECTION, {
            vectors: {
                size: embeddingDimensions,
                distance: "Cosine",
            },
        });

        console.log(
            `Created Qdrant collection "${Env.QDRANT_COLLECTION}" (size ${embeddingDimensions})`,
        );
    }

    await qdrantClient.createPayloadIndex(Env.QDRANT_COLLECTION, {
        field_name: "metadata.documentId",
        field_schema: "keyword",
    });

    console.log("Qdrant payload index ready: metadata.documentId");
}
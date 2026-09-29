import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Env } from "../config/env.config.js";
import { ensureQdrantCollection } from "../config/qdrant.js";
import { getEmbeddings, embedTextsIndividually } from "../services/embedding.service.js";
import { Documents } from "../models/Document.js";


await connectDB();
await ensureQdrantCollection();

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    const { documentId, filename, path } = job.data;

    try {
      await Documents.updateOne({ _id: documentId }, { $set: { status: "PROCESSING" } });
      await job.updateProgress(10);

      const loader = new PDFLoader(path);
      const docs = await loader.load();
      await job.updateProgress(30);

      const textSplitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
      });
      const chunks = await textSplitter.splitDocuments(docs);
      await job.updateProgress(50);

      
      const nonEmptyChunks = chunks.filter((chunk) => chunk.pageContent.trim().length > 0);

      if (nonEmptyChunks.length === 0) {
        throw new Error(
          "No extractable text was found in this PDF — it may be a scanned/image-only document, which this pipeline doesn't OCR.",
        );
      }

      const chunksWithMetadata = nonEmptyChunks.map((chunk, index) => {
        const pageNumber =
          (chunk.metadata?.["loc"] as { pageNumber?: number } | undefined)?.pageNumber ??
          (chunk.metadata?.["pdf"] as { loc?: { pageNumber?: number } } | undefined)?.loc?.pageNumber ??
          null;

        chunk.metadata = {
          ...chunk.metadata,
          documentId,
          filename,
          chunkIndex: index,
          pageNumber,
        };
        return chunk;
      });

     
      const vectors = await embedTextsIndividually(chunksWithMetadata.map((chunk) => chunk.pageContent));
      await job.updateProgress(70);

      const emptyIndex = vectors.findIndex((v) => !Array.isArray(v) || v.length === 0);
      if (emptyIndex !== -1) {
        throw new Error(
          `Embedding for chunk ${emptyIndex} came back empty from the Gemini API. This usually means an invalid/expired GEMINI_API_KEY or an exceeded quota — check for an API error logged just above this.`,
        );
      }

      const vectorStore = await QdrantVectorStore.fromExistingCollection(getEmbeddings(), {
        url: Env.QDRANT_URL,
        apiKey: Env.QDRANT_API_KEY,
        collectionName: Env.QDRANT_COLLECTION,
      });

     
      await vectorStore.addVectors(vectors, chunksWithMetadata);
      await job.updateProgress(90);

      await Documents.updateOne(
        { _id: documentId },
        { $set: { status: "COMPLETED", chunkCount: chunksWithMetadata.length, processedAt: new Date() } },
      );
      await job.updateProgress(100);

      console.log(`Job ${job.id} → document ${documentId} completed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error during processing";

      await Documents.updateOne(
        { _id: documentId },
        { $set: { status: "FAILED", error: message } },
      );

      console.error(`Job ${job.id} failed:`, error);
      throw error; // BullMQ marks the job as failed and retries per defaultJobOptions
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`BullMQ: Job ${job.id} finished successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`BullMQ: Job ${job?.id} failed:`, err.message);
});
export function buildRagPrompt({
    context,
    recentConversation,
    question,
}: {
    context: string;
    recentConversation: string;
    question: string;
}): string {
    return `You are a document question-answering assistant.

Answer the user's question only using the provided document context.

If the answer cannot be found in the provided context, say that the information is not available in the document.

Do not invent facts.

Document context:
----------------
${context}
----------------

Conversation:
${recentConversation}

Question:
${question}`;
}
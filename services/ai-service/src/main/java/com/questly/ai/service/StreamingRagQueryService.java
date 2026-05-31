package com.questly.ai.service;

import com.questly.ai.dto.ChatMessageDto;
import com.questly.ai.dto.QueryRequest;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.StreamingResponseHandler;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreamingRagQueryService {

    private final EmbeddingModel embeddingModel;
    private final StreamingChatLanguageModel streamingChatModel;
    private final EmbeddingCacheService embeddingCacheService;
    private final QueryCacheService queryCacheService;

    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    private static final String NO_DOCS_ANSWER = "Please upload study documents to this notebook first.";
    private static final String AI_UNAVAILABLE_ANSWER = "Questly is currently experiencing AI service interruption. Please try again in a few moments.";

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are Questly, an expert student learning tutor.
            Answer the student's question based strictly on the source documents provided below.
            If the answer cannot be found in the provided sources, state exactly:
            "I cannot find the answer in your uploaded documents."
            Do not make up facts. Do not reference information outside the provided sources.
            
            ---
            SOURCE CHUNKS:
            %s
            
            ---
            CHAT HISTORY:
            %s
            
            ---
            STUDENT QUESTION:
            %s
            """;

    public Flux<String> streamQuery(QueryRequest req) {
        return Flux.create(sink -> {
            try {
                String collectionName = "notebook_" + req.getNotebookId();
                log.info("Streaming RAG query for notebook {} (collection {})", req.getNotebookId(), collectionName);

                // 0. Check query cache
                com.questly.ai.dto.QueryResponse cachedResponse = queryCacheService.getCachedResponse(req.getNotebookId(), req.getQuestion());
                if (cachedResponse != null) {
                    log.info("Streaming cached response for notebook {}", req.getNotebookId());
                    sink.next("⚡ [Instant Cache Hit]\n\n" + cachedResponse.getAnswer());
                    sink.complete();
                    return;
                }

                // 1. Build per-notebook ChromaDB store
                ChromaEmbeddingStore collectionStore;
                try {
                    collectionStore = ChromaEmbeddingStore.builder()
                            .baseUrl(chromaBaseUrl)
                            .collectionName(collectionName)
                            .build();
                } catch (Exception e) {
                    log.warn("ChromaDB collection {} not available: {}", collectionName, e.getMessage());
                    sink.next(NO_DOCS_ANSWER);
                    sink.complete();
                    return;
                }

                // 2. Embed the question (with cache)
                Embedding questionEmbedding = embeddingCacheService.getCachedEmbedding(req.getQuestion());
                if (questionEmbedding == null) {
                    questionEmbedding = embeddingModel.embed(req.getQuestion()).content();
                    embeddingCacheService.cacheEmbedding(req.getQuestion(), questionEmbedding);
                }

                // 3. Search ChromaDB
                EmbeddingSearchResult<TextSegment> result;
                try {
                    result = collectionStore.search(
                            EmbeddingSearchRequest.builder()
                                    .queryEmbedding(questionEmbedding)
                                    .maxResults(5)
                                    .build()
                    );
                } catch (Exception e) {
                    log.warn("ChromaDB search failed for collection {}: {}", collectionName, e.getMessage());
                    sink.next(NO_DOCS_ANSWER);
                    sink.complete();
                    return;
                }

                List<EmbeddingMatch<TextSegment>> matches = result.matches();
                if (matches == null || matches.isEmpty()) {
                    log.info("No relevant chunks found for question in notebook {}", req.getNotebookId());
                    sink.next(NO_DOCS_ANSWER);
                    sink.complete();
                    return;
                }

                // 4. Build context string
                StringBuilder chunksBuilder = new StringBuilder();
                for (int i = 0; i < matches.size(); i++) {
                    EmbeddingMatch<TextSegment> match = matches.get(i);
                    TextSegment segment = match.embedded();
                    chunksBuilder.append("[Source ").append(i + 1).append("]\n");
                    chunksBuilder.append(segment.text()).append("\n\n");
                }
                
                // Build chat history string
                StringBuilder historyBuilder = new StringBuilder();
                if (req.getChatHistory() != null && !req.getChatHistory().isEmpty()) {
                    for (ChatMessageDto msg : req.getChatHistory()) {
                        historyBuilder.append(msg.getRole().toUpperCase()).append(": ").append(msg.getContent()).append("\n");
                    }
                } else {
                    historyBuilder.append("None");
                }

                // 5. Build prompt
                String prompt = String.format(SYSTEM_PROMPT_TEMPLATE,
                        chunksBuilder.toString().trim(),
                        historyBuilder.toString().trim(),
                        req.getQuestion());

                // 7. Build sources list for caching
                List<com.questly.ai.dto.SourceCitation> sources = new java.util.ArrayList<>();
                for (EmbeddingMatch<TextSegment> match : matches) {
                    TextSegment segment = match.embedded();
                    String documentId = segment.metadata().getString("document_id");
                    String sourceName = segment.metadata().getString("source_name");
                    String chunkText = segment.text();
                    if (chunkText != null && chunkText.length() > 200) {
                        chunkText = chunkText.substring(0, 200) + "...";
                    }
                    sources.add(com.questly.ai.dto.SourceCitation.builder()
                            .documentId(documentId)
                            .sourceName(sourceName)
                            .chunk(chunkText)
                            .build());
                }

                // 6. Call streaming chat model
                streamingChatModel.generate(prompt, new StreamingResponseHandler<AiMessage>() {
                    @Override
                    public void onNext(String token) {
                        sink.next(token);
                    }

                    @Override
                    public void onComplete(Response<AiMessage> response) {
                        // Cache the generated response
                        String fullAnswer = response.content().text();
                        com.questly.ai.dto.QueryResponse qResp = com.questly.ai.dto.QueryResponse.builder()
                                .answer(fullAnswer)
                                .sources(sources)
                                .build();
                        queryCacheService.cacheResponse(req.getNotebookId(), req.getQuestion(), qResp);
                        
                        sink.complete();
                    }

                    @Override
                    public void onError(Throwable error) {
                        log.error("Streaming generation error: {}", error.getMessage());
                        sink.error(error);
                    }
                });

            } catch (Exception e) {
                log.error("Streaming RAG query failed for notebook {}: {}", req.getNotebookId(), e.getMessage(), e);
                String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                if (msg.contains("timeout") || msg.contains("timed out") || msg.contains("connect")) {
                    sink.next(AI_UNAVAILABLE_ANSWER);
                    sink.complete();
                } else {
                    sink.error(e);
                }
            }
        });
    }
}

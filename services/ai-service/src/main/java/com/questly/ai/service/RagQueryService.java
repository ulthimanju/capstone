package com.questly.ai.service;

import com.questly.ai.dto.QueryRequest;
import com.questly.ai.dto.QueryResponse;
import com.questly.ai.dto.SourceCitation;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagQueryService {

    private final OllamaEmbeddingModel embeddingModel;
    private final OllamaChatModel chatModel;

    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    private static final String NO_DOCS_ANSWER =
            "Please upload study documents to this notebook first.";

    private static final String AI_UNAVAILABLE_ANSWER =
            "Questly is currently experiencing local AI engine maintenance. Please try again in a few minutes.";

    private static final String SYSTEM_PROMPT_TEMPLATE =
            """
            You are Questly, an expert student learning tutor.
            Answer the student's question based strictly on the source documents provided below.
            If the answer cannot be found in the provided sources, state exactly:
            "I cannot find the answer in your uploaded documents."
            Do not make up facts. Do not reference information outside the provided sources.
            
            ---
            SOURCE CHUNKS:
            %s
            
            ---
            STUDENT QUESTION:
            %s
            """;

    public QueryResponse query(QueryRequest req) {
        try {
            String collectionName = "notebook_" + req.getNotebookId();
            log.info("RAG query for notebook {} (collection {})", req.getNotebookId(), collectionName);

            // 1. Build per-notebook ChromaDB store
            ChromaEmbeddingStore collectionStore;
            try {
                collectionStore = ChromaEmbeddingStore.builder()
                        .baseUrl(chromaBaseUrl)
                        .collectionName(collectionName)
                        .build();
            } catch (Exception e) {
                log.warn("ChromaDB collection {} not available: {}", collectionName, e.getMessage());
                return QueryResponse.builder()
                        .answer(NO_DOCS_ANSWER)
                        .sources(Collections.emptyList())
                        .build();
            }

            // 2. Embed the question
            Embedding questionEmbedding = embeddingModel.embed(req.getQuestion()).content();

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
                return QueryResponse.builder()
                        .answer(NO_DOCS_ANSWER)
                        .sources(Collections.emptyList())
                        .build();
            }

            List<EmbeddingMatch<TextSegment>> matches = result.matches();
            if (matches == null || matches.isEmpty()) {
                log.info("No relevant chunks found for question in notebook {}", req.getNotebookId());
                return QueryResponse.builder()
                        .answer(NO_DOCS_ANSWER)
                        .sources(Collections.emptyList())
                        .build();
            }

            // 4. Build context string
            StringBuilder chunksBuilder = new StringBuilder();
            for (int i = 0; i < matches.size(); i++) {
                EmbeddingMatch<TextSegment> match = matches.get(i);
                TextSegment segment = match.embedded();
                chunksBuilder.append("[Source ").append(i + 1).append("]\n");
                chunksBuilder.append(segment.text()).append("\n\n");
            }

            // 5. Build prompt
            String prompt = String.format(SYSTEM_PROMPT_TEMPLATE,
                    chunksBuilder.toString().trim(),
                    req.getQuestion());

            // 6. Call chat model
            String answer = chatModel.generate(prompt);
            log.info("Generated answer for notebook {} query", req.getNotebookId());

            // 7. Build sources list
            List<SourceCitation> sources = new ArrayList<>();
            for (EmbeddingMatch<TextSegment> match : matches) {
                TextSegment segment = match.embedded();
                String documentId = segment.metadata().getString("document_id");
                String sourceName = segment.metadata().getString("source_name");
                String chunkText = segment.text();
                if (chunkText != null && chunkText.length() > 200) {
                    chunkText = chunkText.substring(0, 200) + "...";
                }
                sources.add(SourceCitation.builder()
                        .documentId(documentId)
                        .sourceName(sourceName)
                        .chunk(chunkText)
                        .build());
            }

            return QueryResponse.builder()
                    .answer(answer)
                    .sources(sources)
                    .build();

        } catch (Exception e) {
            log.error("RAG query failed for notebook {}: {}", req.getNotebookId(), e.getMessage(), e);
            // Check if timeout-related
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("timeout") || msg.contains("timed out") || msg.contains("connect")) {
                return QueryResponse.builder()
                        .answer(AI_UNAVAILABLE_ANSWER)
                        .sources(Collections.emptyList())
                        .build();
            }
            return QueryResponse.builder()
                    .answer("An error occurred while processing your query: " + e.getMessage())
                    .sources(Collections.emptyList())
                    .build();
        }
    }
}

package com.questly.ai.service;

import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import dev.langchain4j.store.embedding.filter.MetadataFilterBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class CollectionService {

    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    /**
     * Deletes all embeddings for a notebook collection.
     * LangChain4j ChromaEmbeddingStore does not support full collection deletion via API,
     * so we remove all embeddings by metadata filter on notebook_id.
     */
    public void deleteCollection(UUID notebookId) {
        String collectionName = "notebook_" + notebookId;
        log.info("Deleting ChromaDB collection: {}", collectionName);
        try {
            ChromaEmbeddingStore store = ChromaEmbeddingStore.builder()
                    .baseUrl(chromaBaseUrl)
                    .collectionName(collectionName)
                    .build();

            // Remove all embeddings filtered by notebook_id metadata
            store.removeAll(
                    MetadataFilterBuilder.metadataKey("notebook_id").isEqualTo(notebookId.toString())
            );
            log.info("Deleted all embeddings from ChromaDB collection {}", collectionName);
        } catch (Exception e) {
            log.warn("Could not delete ChromaDB collection {} (may not exist): {}", collectionName, e.getMessage());
        }
    }

    /**
     * Deletes all chunks belonging to a specific document from the notebook's ChromaDB collection.
     */
    public void deleteDocumentChunks(UUID documentId, UUID notebookId) {
        String collectionName = "notebook_" + notebookId;
        log.info("Deleting chunks for document {} from collection {}", documentId, collectionName);
        try {
            ChromaEmbeddingStore store = ChromaEmbeddingStore.builder()
                    .baseUrl(chromaBaseUrl)
                    .collectionName(collectionName)
                    .build();

            store.removeAll(
                    MetadataFilterBuilder.metadataKey("document_id").isEqualTo(documentId.toString())
            );
            log.info("Deleted chunks for document {} from collection {}", documentId, collectionName);
        } catch (Exception e) {
            log.warn("Could not delete chunks for document {} from collection {}: {}", documentId, collectionName, e.getMessage());
        }
    }
}

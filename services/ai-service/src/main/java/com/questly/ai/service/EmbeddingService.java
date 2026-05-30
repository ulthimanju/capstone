package com.questly.ai.service;

import com.questly.ai.config.LangChain4jConfig;
import com.questly.ai.dto.EmbedRequest;
import com.questly.ai.dto.EmbedResponse;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final MinioClient minioClient;
    private final OllamaEmbeddingModel embeddingModel;
    private final QueryCacheService queryCacheService;
    private final AdaptiveChunkingService adaptiveChunkingService;

    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    private static final String BUCKET = "documents";

    public EmbedResponse embed(EmbedRequest req) {
        try {
            log.info("Starting embedding for document {} in notebook {}", req.getDocumentId(), req.getNotebookId());

            // 1. Download object from MinIO
            InputStream inputStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(BUCKET)
                            .object(req.getMinioPath())
                            .build()
            );

            // 2. Parse with Apache Tika (use fully-qualified Tika Metadata to avoid conflict)
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            org.apache.tika.metadata.Metadata tikaMetadata = new org.apache.tika.metadata.Metadata();
            parser.parse(inputStream, handler, tikaMetadata);
            String text = handler.toString();

            if (text == null || text.isBlank()) {
                log.warn("Tika extracted empty text from document {}", req.getDocumentId());
                return EmbedResponse.builder()
                        .status("FAILED")
                        .error("Extracted text is empty - document may be unsupported or corrupt")
                        .build();
            }

            log.info("Extracted {} characters from document {}", text.length(), req.getDocumentId());

            // 3. Create LangChain4j Document with metadata
            Metadata lcMetadata = new Metadata();
            lcMetadata.put("document_id", req.getDocumentId().toString());
            lcMetadata.put("notebook_id", req.getNotebookId().toString());
            lcMetadata.put("source_name", req.getMinioPath());
            Document lcDocument = Document.from(text, lcMetadata);

            // 4. Split into segments using adaptive chunking
            DocumentSplitter splitter = adaptiveChunkingService.getSplitterForDocument(lcDocument);
            List<TextSegment> segments = splitter.split(lcDocument);
            log.info("Split document {} into {} chunks", req.getDocumentId(), segments.size());

            if (segments.isEmpty()) {
                return EmbedResponse.builder()
                        .status("FAILED")
                        .error("No text segments produced after splitting")
                        .build();
            }

            // 5. Create per-notebook ChromaDB collection store
            String collectionName = "notebook_" + req.getNotebookId();
            ChromaEmbeddingStore collectionStore = ChromaEmbeddingStore.builder()
                    .baseUrl(chromaBaseUrl)
                    .collectionName(collectionName)
                    .build();

            // 6. Embed and store
            List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
            collectionStore.addAll(embeddings, segments);

            log.info("Stored {} embeddings in ChromaDB collection {}", embeddings.size(), collectionName);
            
            // 7. Invalidate query cache for this notebook since context has changed
            queryCacheService.invalidateNotebookCache(req.getNotebookId());

            return EmbedResponse.builder()
                    .status("COMPLETED")
                    .chunkCount(segments.size())
                    .collectionId(collectionName)
                    .build();

        } catch (Exception e) {
            log.error("Embedding failed for document {}: {}", req.getDocumentId(), e.getMessage(), e);
            return EmbedResponse.builder()
                    .status("FAILED")
                    .error(e.getMessage())
                    .build();
        }
    }
}

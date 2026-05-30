package com.questly.ai.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AdaptiveChunkingService {

    /**
     * Analyzes the text and selects an appropriate DocumentSplitter based on its content.
     */
    public DocumentSplitter getSplitterForDocument(Document document) {
        String text = document.text();
        if (text == null || text.isEmpty()) {
            return DocumentSplitters.recursive(512, 64);
        }

        // Basic heuristic: check for code blocks or high density of newlines
        int newlineCount = countOccurrences(text, '\n');
        double newlineDensity = (double) newlineCount / text.length();

        if (text.contains("```") || text.contains("public class") || text.contains("function ") || text.contains("def ")) {
            log.info("Detected code content. Using larger chunk size for context retention.");
            // Code usually needs larger chunks to keep context
            return DocumentSplitters.recursive(1024, 128);
        } else if (newlineDensity > 0.05) {
            log.info("Detected list or tabular content based on newline density. Using moderate chunk size.");
            return DocumentSplitters.recursive(256, 32);
        } else {
            log.info("Detected standard prose content. Using standard recursive chunker.");
            // Standard prose can be chunked normally
            return DocumentSplitters.recursive(512, 64);
        }
    }

    private int countOccurrences(String str, char ch) {
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == ch) {
                count++;
            }
        }
        return count;
    }
}

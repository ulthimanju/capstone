package com.questly.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.ai.dto.*;
import dev.langchain4j.model.ollama.OllamaChatModel;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiGenerationService {

    private final MinioClient minioClient;
    private final OllamaChatModel chatModel;
    private final ObjectMapper objectMapper;

    private static final String BUCKET = "documents";
    private static final int TEXT_SAFETY_CAP_PER_DOC = 10000;

    /**
     * Generates a plain-text simple language summary of a single document.
     */
    public SummarizeResponse summarize(SummarizeRequest req) {
        log.info("Generating summary for document path: {}", req.getMinioPath());
        try {
            String text = downloadAndParseDocument(req.getMinioPath());
            if (text == null || text.isBlank()) {
                return SummarizeResponse.builder()
                        .summary("I could not extract any text from the provided document to summarize.")
                        .build();
            }

            String prompt = String.format(
                    """
                    You are Questly, an expert student learning tutor.
                    Summarize the following study document in plain, simple language.
                    The summary must be highly concise, clear, and easily understandable by a student.
                    The maximum length is 500 words. Format with clean paragraphs and bullet points if appropriate.
                    
                    Document Text:
                    %s
                    """, text);

            String summary = chatModel.generate(prompt);
            return SummarizeResponse.builder()
                    .summary(summary.trim())
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate summary for document {}: {}", req.getMinioPath(), e.getMessage(), e);
            return SummarizeResponse.builder()
                    .summary("An error occurred while generating the document summary: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Generates a list of Q&A flashcards from notebook documents.
     */
    public FlashcardGenResponse generateFlashcards(FlashcardGenRequest req) {
        log.info("Generating {} flashcards for notebook {}", req.getCount(), req.getNotebookId());
        try {
            String combinedText = assembleContext(req.getDocuments());
            if (combinedText.isBlank()) {
                return FlashcardGenResponse.builder().flashcards(new ArrayList<>()).build();
            }

            String prompt = String.format(
                    """
                    You are an expert student learning tutor. Given the following study text from a student's notebook, generate exactly %d flashcards as a JSON object containing a "flashcards" array.
                    Each flashcard must have a "question" (concise, clear query about a key concept) and "answer" (short, complete, accurate explanation of the question).
                    Do not output anything other than a valid JSON object. Do not wrap the JSON in HTML or extra text.
                    
                    Format specification:
                    {
                      "flashcards": [
                        {
                          "question": "What is self-attention?",
                          "answer": "A mechanism that correlates different positions of a single sequence to compute a representation of the sequence."
                        }
                      ]
                    }
                    
                    Study text:
                    %s
                    """, req.getCount(), combinedText);

            String responseText = chatModel.generate(prompt);
            String cleanJson = sanitizeJsonPayload(responseText);

            return objectMapper.readValue(cleanJson, FlashcardGenResponse.class);

        } catch (Exception e) {
            log.error("Failed to generate flashcards for notebook {}: {}", req.getNotebookId(), e.getMessage(), e);
            // Return empty list on complete failure
            return FlashcardGenResponse.builder().flashcards(new ArrayList<>()).build();
        }
    }

    /**
     * Generates a list of quiz questions of specified types from notebook documents.
     */
    public QuizGenResponse generateQuiz(QuizGenRequest req) {
        log.info("Generating {} quiz questions for notebook {}", req.getCount(), req.getNotebookId());
        try {
            String combinedText = assembleContext(req.getDocuments());
            if (combinedText.isBlank()) {
                return QuizGenResponse.builder().questions(new ArrayList<>()).build();
            }

            String allowedTypes = String.join(", ", req.getTypes());
            String topicsFocus = (req.getTopics() != null && !req.getTopics().isEmpty())
                    ? "Prioritize and focus heavily on generating questions for the following weak spot topics: " + String.join(", ", req.getTopics())
                    : "Generate questions representing key topics of the text.";

            String prompt = String.format(
                    """
                    You are an expert student learning tutor. Given the following study text from a student's notebook, generate exactly %d quiz questions as a JSON object containing a "questions" array.
                    For each question, select a specific topic from the text and generate a question of one of these types: %s.
                    
                    %s
                    
                    Question type rules:
                    - For "MCQ" type: provide a "question", a list of 4 "options" (strings), the correct "answer" (must be exactly equal to one of the options), and the "topic".
                    - For "FILL" type: provide a "question" (with a blank spot represented by "_______"), the correct "answer" (which completes the blank), the "options" must be null, and the "topic".
                    - For "SHORT" type: provide a "question", a concise correct "answer" (1-2 sentences), the "options" must be null, and the "topic".
                    
                    Ensure every question object has the exact keys: "type", "question", "options", "answer", and "topic".
                    Do not output anything other than a valid JSON object.
                    
                    Format specification:
                    {
                      "questions": [
                        {
                          "type": "MCQ",
                          "question": "Which architecture relies solely on attention mechanisms?",
                          "options": ["RNN", "CNN", "Transformer", "LSTM"],
                          "answer": "Transformer",
                          "topic": "Transformer Architecture"
                        },
                        {
                          "type": "FILL",
                          "question": "The Transformer relies entirely on self-_______ to correlate different positions.",
                          "options": null,
                          "answer": "attention",
                          "topic": "Attention Mechanism"
                        },
                        {
                          "type": "SHORT",
                          "question": "What is the primary role of the Encoder in a Transformer?",
                          "options": null,
                          "answer": "To map an input sequence of representations to a sequence of continuous representations.",
                          "topic": "Encoder Role"
                        }
                      ]
                    }
                    
                    Study text:
                    %s
                    """, req.getCount(), allowedTypes, topicsFocus, combinedText);

            String responseText = chatModel.generate(prompt);
            String cleanJson = sanitizeJsonPayload(responseText);

            return objectMapper.readValue(cleanJson, QuizGenResponse.class);

        } catch (Exception e) {
            log.error("Failed to generate quiz for notebook {}: {}", req.getNotebookId(), e.getMessage(), e);
            // Return empty list on complete failure
            return QuizGenResponse.builder().questions(new ArrayList<>()).build();
        }
    }

    /**
     * Downloads a document from MinIO and extracts up to TEXT_SAFETY_CAP_PER_DOC characters.
     */
    private String downloadAndParseDocument(String minioPath) throws Exception {
        log.info("Downloading and parsing minio object: {}", minioPath);
        try (InputStream inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(BUCKET)
                        .object(minioPath)
                        .build()
        )) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            org.apache.tika.metadata.Metadata tikaMetadata = new org.apache.tika.metadata.Metadata();
            parser.parse(inputStream, handler, tikaMetadata);
            String text = handler.toString();

            if (text != null && text.length() > TEXT_SAFETY_CAP_PER_DOC) {
                log.info("Capping text of document {} to {} characters for latency safety.", minioPath, TEXT_SAFETY_CAP_PER_DOC);
                text = text.substring(0, TEXT_SAFETY_CAP_PER_DOC);
            }
            return text != null ? text.trim() : "";
        }
    }

    /**
     * Assembles parsed text from all provided documents.
     */
    private String assembleContext(List<DocumentPath> documents) {
        if (documents == null || documents.isEmpty()) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        for (DocumentPath doc : documents) {
            try {
                String text = downloadAndParseDocument(doc.getMinioPath());
                if (!text.isBlank()) {
                    builder.append(text).append("\n\n");
                }
            } catch (Exception e) {
                log.error("Failed to download or parse document {} in assemble: {}", doc.getMinioPath(), e.getMessage());
            }
        }
        return builder.toString().trim();
    }

    /**
     * Sanitizes LLM response to ensure we only parse the JSON block.
     * Strips any markdown fence boundaries like ```json ... ``` or prepended notes.
     */
    private String sanitizeJsonPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return "{}";
        }
        String clean = payload.trim();
        if (clean.contains("```json")) {
            int start = clean.indexOf("```json") + 7;
            int end = clean.indexOf("```", start);
            if (end != -1) {
                clean = clean.substring(start, end);
            } else {
                clean = clean.substring(start);
            }
        } else if (clean.contains("```")) {
            int start = clean.indexOf("```") + 3;
            int end = clean.indexOf("```", start);
            if (end != -1) {
                clean = clean.substring(start, end);
            } else {
                clean = clean.substring(start);
            }
        }
        
        // Find actual JSON braces boundaries as final fallback
        int firstBrace = clean.indexOf("{");
        int lastBrace = clean.lastIndexOf("}");
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }

        return clean.trim();
    }

    /**
     * Grades a student submission against an evaluation rubric.
     */
    public GradeResponse gradeSubmission(GradeRequest req) {
        log.info("Grading submission against rubric...");
        try {
            String prompt = String.format(
                    """
                    You are an expert grading tutor. Grade the following student's assignment submission based strictly on the evaluation rubric.
                    Provide a numeric score out of 100 and construct clear, actionable structured feedback.
                    Do not output anything other than a valid JSON object matching the format below.
                    
                    Format:
                    {
                      "score": 85.5,
                      "feedback": "Your explanation of self-attention is solid, but you missed the formula."
                    }
                    
                    Rubric:
                    %s
                    
                    Submission:
                    %s
                    """, req.getRubric(), req.getSubmissionContent());

            String responseText = chatModel.generate(prompt);
            String cleanJson = sanitizeJsonPayload(responseText);
            log.info("Sanitized grading LLM response: {}", cleanJson);

            return objectMapper.readValue(cleanJson, GradeResponse.class);
        } catch (Exception e) {
            log.error("Failed to grade assignment submission via LLM: {}", e.getMessage(), e);
            // Return a fallback grading response so the pipeline does not completely fail
            return GradeResponse.builder()
                    .score(java.math.BigDecimal.valueOf(50.0))
                    .feedback("Auto-grading encountered an error, but here is a default pass: " + e.getMessage())
                    .build();
        }
    }
}


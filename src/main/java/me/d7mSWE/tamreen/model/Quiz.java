package me.d7mSWE.tamreen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
public class Quiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "question_count")
    private Integer questionCount;
    
    @Column(name = "quiz_link", unique = true)
    private String quizLink;
    
    @Column(name = "created_by")
    private String createdBy; // سيكون Username أو 'مجهول'
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "questions_data", columnDefinition = "LONGTEXT")
    private String questionsData;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
    
    public String getQuizLink() { return quizLink; }
    public void setQuizLink(String quizLink) { this.quizLink = quizLink; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getQuestionsData() { return questionsData; }
    public void setQuestionsData(String questionsData) { this.questionsData = questionsData; }
}

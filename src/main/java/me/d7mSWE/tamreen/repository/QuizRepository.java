package me.d7mSWE.tamreen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import me.d7mSWE.tamreen.model.Quiz;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByQuizLink(String quizLink);

    java.util.List<Quiz> findByCreatedByOrderByIdDesc(String username);

    @Modifying
    @Transactional
    @Query("UPDATE Quiz q SET q.createdBy = :newUsername WHERE q.createdBy = :oldUsername")
    void updateCreatorUsername(@Param("oldUsername") String oldUsername, @Param("newUsername") String newUsername);
}

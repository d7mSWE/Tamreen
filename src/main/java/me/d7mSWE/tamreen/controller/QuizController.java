package me.d7mSWE.tamreen.controller;

import me.d7mSWE.tamreen.model.Quiz;
import me.d7mSWE.tamreen.repository.QuizRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quizRequest, jakarta.servlet.http.HttpSession session) {
        
        String loggedUser = (String) session.getAttribute("user");
        if (loggedUser != null) {
            quizRequest.setCreatedBy(loggedUser);
        } else {
            quizRequest.setCreatedBy("unknown");
        }

        // توليد رابط فريد للكويز
        String uniqueLink = UUID.randomUUID().toString();
        quizRequest.setQuizLink(uniqueLink);

        Quiz savedQuiz = quizRepository.save(quizRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "تم إنشاء الاختبار بنجاح");
        response.put("quizLink", savedQuiz.getQuizLink());
        response.put("quizId", savedQuiz.getId());

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{link}")
    public ResponseEntity<?> getQuizByLink(@PathVariable String link) {
        return quizRepository.findByQuizLink(link)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserQuizzes(@PathVariable String username, jakarta.servlet.http.HttpSession session) {
        String loggedUser = (String) session.getAttribute("user");
        if (loggedUser == null || !loggedUser.equals(username)) {
            return ResponseEntity.status(401).body(Map.of("error", "غير مصرح لك بعرض هذه الاختبارات"));
        }
        
        java.util.List<Quiz> quizzes = quizRepository.findByCreatedByOrderByIdDesc(username);
        return ResponseEntity.ok(quizzes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        String loggedUser = (String) session.getAttribute("user");
        if (loggedUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "يرجى تسجيل الدخول أولاً"));
        }

        Optional<Quiz> quizOpt = quizRepository.findById(id);
        if (quizOpt.isPresent()) {
            Quiz quiz = quizOpt.get();
            if (quiz.getCreatedBy().equals(loggedUser)) {
                quizRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "تم حذف الاختبار بنجاح"));
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "لا تملك صلاحية حذف هذا الاختبار"));
            }
        }
        return ResponseEntity.notFound().build();
    }
}

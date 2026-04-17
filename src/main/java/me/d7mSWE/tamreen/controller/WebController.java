package me.d7mSWE.tamreen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class WebController {

    @GetMapping({"/", "/home"})
    public String index() {
        return "forward:/HTML/index.html";
    }

    @GetMapping("/create-quiz")
    public String createQuiz() {
        return "forward:/HTML/create-quiz.html";
    }

    @GetMapping("/profile")
    public String profile() {
        return "forward:/HTML/profile.html";
    }

    @GetMapping("/quiz/{link}")
    public String viewQuiz(@PathVariable String link) {
        return "forward:/HTML/quiz.html";
    }
}

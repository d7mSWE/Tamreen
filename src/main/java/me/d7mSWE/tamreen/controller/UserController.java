package me.d7mSWE.tamreen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import me.d7mSWE.tamreen.model.User;
import me.d7mSWE.tamreen.repository.QuizRepository;
import me.d7mSWE.tamreen.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User userRequest, HttpSession session) {
        Map<String, String> response = new HashMap<>();
        
        if (userRequest.getUsername() == null || userRequest.getUsername().trim().isEmpty() ||
            userRequest.getEmail() == null || userRequest.getEmail().trim().isEmpty() ||
            userRequest.getPassword() == null || userRequest.getPassword().trim().isEmpty()) {
            response.put("error", "جميع الحقول مطلوبة");
            return ResponseEntity.badRequest().body(response);
        }

        String username = userRequest.getUsername().trim();
        String password = userRequest.getPassword();

        // 1. منع تسجيل اسم unknown
        if (username.equalsIgnoreCase("unknown")) {
            response.put("error", "هذا الاسم غير متاح للتسجيل");
            return ResponseEntity.badRequest().body(response);
        }

        // 2. اسم المستخدم يجب أن يكون باللغة الإنجليزية والأرقام فقط (بدون مسافات)
        if (!username.matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
            response.put("error", "اسم المستخدم يجب أن يبدأ بحرف إنجليزي ويحتوي على أحرف وأرقام إنجليزية فقط بدون مسافات");
            return ResponseEntity.badRequest().body(response);
        }

        // 3. شروط كلمة المرور (حرف كبير، حرف صغير، رمز مميز، 8 خانات)
        if (password.length() < 8 || !password.matches(".*[A-Z].*") || !password.matches(".*[a-z].*") || !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            response.put("error", "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير وصغير ورمز مميز");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsByUsername(username)) {
            response.put("error", "اسم المستخدم محجوز مسبقاً");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            response.put("error", "البريد الإلكتروني مستخدم مسبقاً");
            return ResponseEntity.badRequest().body(response);
        }

        // نستخدم كلمة المرور العادية للتبسيط بناءً على الطلب (Plain Text Password)
        userRepository.save(userRequest);
        
        // تسجيل الدخول التلقائي بعد التسجيل
        session.setAttribute("user", userRequest.getUsername());
        
        response.put("message", "تم تسجيل الحساب بنجاح");
        response.put("username", userRequest.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User userRequest, HttpSession session) {
        Map<String, String> response = new HashMap<>();
        
        // البحث عن طريق اسم المستخدم (Username) ومطابقة كلمة المرور
        Optional<User> userOptional = userRepository.findByUsername(userRequest.getUsername());
        
        if (userOptional.isPresent() && userOptional.get().getPassword().equals(userRequest.getPassword())) {
            session.setAttribute("user", userOptional.get().getUsername());
            response.put("message", "تم تسجيل الدخول بنجاح");
            response.put("username", userOptional.get().getUsername());
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "اسم المستخدم أو كلمة المرور غير صحيحة");
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpSession session) {
        session.invalidate();
        Map<String, String> response = new HashMap<>();
        response.put("message", "تم تسجيل الخروج");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Map<String, String> response = new HashMap<>();
        String username = (String) session.getAttribute("user");
        
        if (username != null) {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if(userOpt.isPresent()){
                response.put("username", username);
                response.put("email", userOpt.get().getEmail());
                return ResponseEntity.ok(response);
            }
        }
        
        response.put("error", "غير مسجل الدخول");
        return ResponseEntity.status(401).body(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, String> updateRequest, HttpSession session) {
        Map<String, String> response = new HashMap<>();
        String currentUsername = (String) session.getAttribute("user");
        
        if (currentUsername == null) {
            return ResponseEntity.status(401).body(Map.of("error", "غير مسجل الدخول"));
        }

        Optional<User> userOptional = userRepository.findByUsername(currentUsername);
        if (!userOptional.isPresent()) return ResponseEntity.status(404).build();
        User user = userOptional.get();

        String oldPassword = updateRequest.get("oldPassword");
        if (oldPassword == null || !user.getPassword().equals(oldPassword)) {
            response.put("error", "كلمة المرور القديمة غير صحيحة");
            return ResponseEntity.badRequest().body(response);
        }

        String newUsername = updateRequest.get("newUsername");
        String newEmail = updateRequest.get("newEmail");
        String newPassword = updateRequest.get("newPassword");

        if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.equals(currentUsername)) {
            if (newUsername.equalsIgnoreCase("unknown") || !newUsername.matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
                response.put("error", "اسم المستخدم الجديد غير صالح");
                return ResponseEntity.badRequest().body(response);
            }
            if (userRepository.existsByUsername(newUsername)) {
                response.put("error", "اسم المستخدم مستخدم مسبقاً");
                return ResponseEntity.badRequest().body(response);
            }
            user.setUsername(newUsername);
            quizRepository.updateCreatorUsername(currentUsername, newUsername);
            session.setAttribute("user", newUsername);
        }

        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(user.getEmail())) {
            if (userRepository.existsByEmail(newEmail)) {
                response.put("error", "البريد الإلكتروني مستخدم مسبقاً");
                return ResponseEntity.badRequest().body(response);
            }
            user.setEmail(newEmail);
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (newPassword.length() < 8 || !newPassword.matches(".*[A-Z].*") || !newPassword.matches(".*[a-z].*") || !newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
                response.put("error", "كلمة المرور الجديدة ضعيفة");
                return ResponseEntity.badRequest().body(response);
            }
            user.setPassword(newPassword);
        }

        userRepository.save(user);
        response.put("message", "تم تحديث البيانات بنجاح");
        return ResponseEntity.ok(response);
    }
}

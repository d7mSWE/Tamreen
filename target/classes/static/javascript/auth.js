document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// ============================================
// نظام تسجيل الدخول والمستخدمين (Auth System)
// ============================================

function initAuth() {
    checkCurrentUser();

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const alertBox = document.getElementById('registerAlert');
            
            alertBox.style.display = 'none';

            if (password !== passwordConfirm) {
                alertBox.textContent = getTranslation('passwords-no-match');
                alertBox.style.display = 'block';
                return;
            }

            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
                alertBox.textContent = getTranslation('invalid-username-format');
                alertBox.style.display = 'block';
                return;
            }

            if (username.toLowerCase() === 'unknown') {
                alertBox.textContent = getTranslation('username-unavailable');
                alertBox.style.display = 'block';
                return;
            }

            const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
            if (!pwdRegex.test(password)) {
                alertBox.textContent = getTranslation('password-weak');
                alertBox.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    alertBox.textContent = result.error || getTranslation('register-error');
                    alertBox.style.display = 'block';
                } else {
                    window.location.reload();
                }
            } catch (err) {
                alertBox.textContent = getTranslation('connection-fail');
                alertBox.style.display = 'block';
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const alertBox = document.getElementById('loginAlert');
            
            alertBox.style.display = 'none';

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    alertBox.textContent = result.error || getTranslation('login-invalid');
                    alertBox.style.display = 'block';
                } else {
                    window.location.reload();
                }
            } catch (err) {
                alertBox.textContent = getTranslation('connection-fail');
                alertBox.style.display = 'block';
            }
        });
    }
}

async function checkCurrentUser() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const data = await response.json();
            const btnLogin = document.getElementById('navLoginBtn');
            if (btnLogin) {
                // استبدال الزر القديم بقائمة منسدلة (Dropdown)
                const dropdownHtml = `
                  <div class="dropdown" style="display:inline-block;">
                    <button class="btn btn-outline-light dropdown-toggle rounded-pill px-4 fw-bold shadow-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-user-check me-2"></i>${data.username}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                      <li><a class="dropdown-item py-2" href="/profile"><i class="fas fa-id-badge text-primary me-2"></i>${getTranslation('profile')}</a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item py-2 text-danger" href="#" onclick="logoutUser(event)"><i class="fas fa-sign-out-alt text-danger me-2"></i>${getTranslation('logout')}</a></li>
                    </ul>
                  </div>
                  `;
                btnLogin.outerHTML = dropdownHtml;
                
                // دالة تسجيل الخروج المربوطة بالزر
                window.logoutUser = async (e) => {
                    e.preventDefault();
                    if(confirm(getTranslation('confirm-logout'))) {
                        await fetch('/api/users/logout', { method: 'POST' });
                        window.location.href = '/';
                    }
                };
            }
        }
    } catch (err) {
        // console.error('Auth check failed', err);
    }
}

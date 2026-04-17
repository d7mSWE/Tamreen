document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    // 1. Fetch user data
    let currentAuthUser = null;
    try {
        const resp = await fetch('/api/users/me');
        if (resp.ok) {
            currentAuthUser = await resp.json();
            document.getElementById('profUsername').value = currentAuthUser.username;
            document.getElementById('profEmail').value = currentAuthUser.email;
            loadUserQuizzes(currentAuthUser.username);
        } else {
            window.location.href = '/'; // غير مسجل
        }
    } catch(e) { console.error(e); }

    // 2. Handle Profile Update (opens modal)
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('profileAlert');
        const newPassword = document.getElementById('profNewPassword').value;
        const confirmPassword = document.getElementById('profConfirmPassword').value;

        if (newPassword && newPassword !== confirmPassword) {
            showAlert(alertBox, getTranslation('passwords-mismatch'), 'danger');
            return;
        }
        
        // Show modal
        document.getElementById('modalOldPassword').value = '';
        document.getElementById('modalAlert').classList.add('d-none');
        const modalElem = document.getElementById('passwordConfirmModal');
        if (modalElem) {
            const modal = new bootstrap.Modal(modalElem);
            modal.show();
        }
    });

    // 3. Confirm Save from Modal
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener('click', async () => {
            const modalAlertBox = document.getElementById('modalAlert');
            const newUsername = document.getElementById('profUsername').value;
            const newEmail = document.getElementById('profEmail').value;
            const newPassword = document.getElementById('profNewPassword').value;
            const oldPassword = document.getElementById('modalOldPassword').value;

            if (!oldPassword) {
                showAlert(modalAlertBox, getTranslation('current-password-required'), 'danger');
                return;
            }

            try {
                const res = await fetch('/api/users/update', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ oldPassword, newUsername, newEmail, newPassword })
                });
                const result = await res.json();
                if(res.ok) {
                    showAlert(modalAlertBox, getTranslation('profile-update-success'), 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showAlert(modalAlertBox, result.error || getTranslation('profile-update-error'), 'danger');
                }
            } catch(e) {
                showAlert(modalAlertBox, getTranslation('connection-fail'), 'danger');
            }
        });
    }
});

function showAlert(box, msg, type) {
    if (!box) return;
    box.className = `alert alert-${type}`;
    box.textContent = msg;
    box.classList.remove('d-none');
}

// 3. Load Quizzes
async function loadUserQuizzes(username) {
    const tbody = document.getElementById('quizzesTableBody');
    if (!tbody) return;

    try {
        const res = await fetch(`/api/quizzes/user/${username}`);
        if(res.ok) {
            const quizzes = await res.json();
            if(quizzes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">${getTranslation('no-quizzes-recorded')}</td></tr>`;
                return;
            }
            let html = '';
            quizzes.forEach(q => {
                const lang = localStorage.getItem('preferred-lang') || 'ar';
                const date = new Date(q.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');
                const link = `/quiz/${q.quizLink}`;
                html += `
                <tr>
                    <td class="fw-bold">${q.title}</td>
                    <td>${q.questionCount}</td>
                    <td>${date}</td>
                    <td>
                        <a href="${link}" target="_blank" class="btn btn-sm btn-outline-primary" title="${getTranslation('view-quiz-title')}"><i class="fas fa-external-link-alt"></i></a>
                        <button onclick="deleteQuiz(${q.id})" class="btn btn-sm btn-outline-danger ms-2" title="${getTranslation('delete-quiz-title')}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }
    } catch(e) { console.error(e); }
}

// 4. Delete Quiz
async function deleteQuiz(id) {
    if(!confirm(getTranslation('delete-quiz-confirm'))) return;
    try {
        const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
        if(res.ok) {
            alert(getTranslation('delete-quiz-success'));
            window.location.reload();
        } else {
            const result = await res.json();
            alert(result.error || getTranslation('delete-quiz-error'));
        }
    } catch(e) { alert(getTranslation('connection-fail')); }
}

document.addEventListener('DOMContentLoaded', () => {
    const quizContentSection = document.getElementById('quizContentSection');
    if (quizContentSection) {
        initQuiz();
    }
});

// ============================================
// أوامر ودوائل صفحة "حل الاختبـــار" (quiz.html)
// ============================================
let questionsList = [];
let currentIndex = 0;
let selectedOptionIndices = [];
let correctAnswersCount = 0;

function initQuiz() {
    const urlParts = window.location.pathname.split('/');
    const quizLink = urlParts[urlParts.length - 1];
    
    const fullLink = window.location.origin + '/quiz/' + quizLink;
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) shareLinkInput.value = fullLink;

    window.copyShareLink = function() {
        const input = document.getElementById('shareLinkInput');
        input.select();
        document.execCommand('copy');
        
        const btn = document.querySelector('.btn-primary[onclick="copyShareLink()"]');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check me-1"></i> ${getTranslation('copied-msg')}`;
        btn.style.background = '#38a169';
        
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = '';
        }, 3000);
    };

    if (quizLink && quizLink !== 'quiz.html') {
        fetch(`/api/quizzes/${quizLink}`)
            .then(res => {
                if(!res.ok) throw new Error("Not Found");
                return res.json();
            })
            .then(data => {
                document.getElementById('quizTitle').textContent = data.title;
                document.getElementById('quizCreator').textContent = data.createdBy;
                
                try {
                    questionsList = JSON.parse(data.questionsData);
                } catch(e) {
                    questionsList = [];
                }
                
                document.getElementById('quizCount').textContent = questionsList.length;
                document.getElementById('totalQs').textContent = questionsList.length;

                if(questionsList && questionsList.length > 0) {
                    document.getElementById('quizContentSection').style.display = 'block';
                    document.getElementById('controlsSection').style.display = 'block';
                    renderQuestion();
                } else {
                    document.getElementById('quizTitle').textContent += ` ${getTranslation('no-questions-error')}`;
                }
            })
            .catch(err => {
                document.getElementById('quizTitle').textContent = getTranslation('quiz-not-found-error');
            });
    }

    window.renderQuestion = function() {
        if(currentIndex >= questionsList.length) {
            finishQuiz();
            return;
        }

        const q = questionsList[currentIndex];
        selectedOptionIndices = [];
        
        document.getElementById('currentQNum').textContent = currentIndex + 1;
        document.getElementById('questionText').textContent = q.text;
        document.getElementById('explanationBox').style.display = 'none';
        
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        if (q.type === 'truefalse') {
            container.className = 'd-flex justify-content-center gap-3 mb-4 flex-wrap';
        } else {
            container.className = 'd-flex flex-column gap-3 mb-4';
        }

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            if (q.type === 'truefalse') {
                btn.style.width = 'auto';
                btn.style.minWidth = '150px';
                btn.style.justifyContent = 'center';
            }
            
            const iconClass = q.type === 'multiple' ? 'fa-square' : 'fa-circle';
            btn.innerHTML = `<i class="far ${iconClass} me-3 text-muted"></i> `;
            const textNode = document.createTextNode(opt.text);
            btn.appendChild(textNode);
            
            btn.onclick = () => selectOption(btn, idx, q.type);
            container.appendChild(btn);
        });

        document.getElementById('checkBtn').style.display = 'inline-block';
        document.getElementById('checkBtn').disabled = true;
        document.getElementById('nextBtn').style.display = 'none';
    };

    window.selectOption = function(btnElement, idx, type) {
        if(type === 'multiple') {
            btnElement.classList.toggle('selected');
            const icon = btnElement.querySelector('i');
            
            if(btnElement.classList.contains('selected')) {
                selectedOptionIndices.push(idx);
                icon.classList.replace('fa-square', 'fa-check-square');
                icon.classList.replace('far', 'fas');
                icon.style.color = 'var(--gradient-start)';
            } else {
                selectedOptionIndices = selectedOptionIndices.filter(i => i !== idx);
                icon.classList.replace('fa-check-square', 'fa-square');
                icon.classList.replace('fas', 'far');
                icon.style.color = '';
            }
        } else {
            const allBtns = document.getElementById('optionsContainer').querySelectorAll('.option-btn');
            allBtns.forEach(b => {
                b.classList.remove('selected');
                const i = b.querySelector('i');
                i.classList.replace('fa-dot-circle', 'fa-circle');
                i.classList.replace('fas', 'far');
                i.style.color = '';
            });
            
            btnElement.classList.add('selected');
            const icon = btnElement.querySelector('i');
            icon.classList.replace('fa-circle', 'fa-dot-circle');
            icon.classList.replace('far', 'fas');
            icon.style.color = 'var(--gradient-start)';
            
            selectedOptionIndices = [idx];
        }
        
        document.getElementById('checkBtn').disabled = selectedOptionIndices.length === 0;
    };

    window.checkAnswer = function() {
        const q = questionsList[currentIndex];
        const allBtns = document.getElementById('optionsContainer').querySelectorAll('.option-btn');
        
        allBtns.forEach(b => {
            b.disabled = true;
            b.style.cursor = 'default';
        });
        
        let isQuestionCorrect = true;
        
        allBtns.forEach((btn, idx) => {
            const isCorrect = q.options[idx].isCorrect;
            const isSelected = selectedOptionIndices.includes(idx);
            const icon = btn.querySelector('i');
            
            if(isCorrect !== isSelected) {
                isQuestionCorrect = false;
            }
            
            if(isCorrect) {
                btn.classList.add('correct');
                icon.className = 'fas fa-check-circle me-3';
            } else if (isSelected && !isCorrect) {
                btn.classList.add('incorrect');
                icon.className = 'fas fa-times-circle me-3';
            }
        });
        
        if(isQuestionCorrect) {
            correctAnswersCount++;
        }

        if(q.explanation && q.explanation.trim() !== "") {
            document.getElementById('explanationText').textContent = q.explanation;
            document.getElementById('explanationBox').style.display = 'block';
        }

        document.getElementById('checkBtn').style.display = 'none';
        
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.style.display = 'inline-block';
        if(currentIndex === questionsList.length - 1) {
            nextBtn.innerHTML = `${getTranslation('finish-quiz-btn')} <i class="fas fa-flag-checkered ms-2"></i>`;
        }
    };

    window.nextQuestion = function() {
        currentIndex++;
        renderQuestion();
    };

    window.finishQuiz = function() {
        document.getElementById('quizContentSection').style.display = 'none';
        document.getElementById('controlsSection').style.display = 'none';
        
        document.getElementById('finalScore').textContent = correctAnswersCount;
        document.getElementById('finalTotal').textContent = questionsList.length;
        
        document.getElementById('finishSection').style.display = 'block';
        document.querySelector('.share-box-premium').style.display = 'none';
    };
}

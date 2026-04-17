document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questionsContainer');
    if (questionsContainer) {
        initCreateQuiz();
    }
});

// ============================================
// أوامر ودوائل صفحة "إنشاء الكويز" (create-quiz.html)
// ============================================

let totalSelected = 10;
let globalQuestionId = 0;
let manualInitialized = false;

function initCreateQuiz() {
    const questionsContainer = document.getElementById('questionsContainer');
    const showExplanation = document.getElementById('showExplanation');
    const saveBtn = document.getElementById('saveBtn');

    // 1. تعريف دالة تحديث أرقام الأسئلة
    window.updateQuestionNumbers = function() {
        const boxes = document.querySelectorAll('.question-box');
        boxes.forEach((box, index) => {
            const numSpan = box.querySelector('.q-display-number');
            if (numSpan) numSpan.textContent = index + 1;
        });
    };

    // 2. تعريف دالة حذف سؤال
    window.deleteQuestion = function(qId) {
        const box = document.getElementById('question_' + qId);
        if (box) {
            box.remove();
            updateQuestionNumbers();
        }
    };

    // 3. تعريف دالة تغيير نوع السؤال
    window.changeQuestionType = function (questionId) {
        const select = document.getElementById(`type_${questionId}`);
        const type = select.value;
        const optionsDiv = document.getElementById(`options_${questionId}`);
        optionsDiv.innerHTML = getOptionsHTML(type, questionId);
        
        // إعادة ترجمة الخيارات الجديدة
        if (typeof translatePage === 'function') {
            translatePage(optionsDiv);
        }
    };

    // 4. تعريف دالة توليد HTML الخيارات
    window.getOptionsHTML = function (type, questionId) {
        if (type === 'truefalse') {
            return `
            <div id="options_container_${questionId}" class="d-flex justify-content-center gap-5 my-4">
                <div class="form-check d-flex align-items-center gap-2 m-0 p-0 option-row" style="cursor: pointer;">
                    <input type="radio" class="form-check-input mt-0 correct-radio" name="tf_${questionId}" id="tf_true_${questionId}" value="true" style="width:25px; height:25px; cursor: pointer;">
                    <label class="form-check-label fw-bold ms-2" for="tf_true_${questionId}" style="cursor: pointer;" data-i18n="true-label">صح</label>
                </div>
                <div class="form-check d-flex align-items-center gap-2 m-0 p-0 option-row" style="cursor: pointer;">
                    <input type="radio" class="form-check-input mt-0 correct-radio" name="tf_${questionId}" id="tf_false_${questionId}" value="false" style="width:25px; height:25px; cursor: pointer;">
                    <label class="form-check-label fw-bold ms-2" for="tf_false_${questionId}" style="cursor: pointer;" data-i18n="false-label">خطأ</label>
                </div>
            </div>
        `;
        } else if (type === 'multiple') {
            return `
            <div id="options_container_${questionId}">
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="checkbox" class="form-check-input mt-0 correct-checkbox" style="width:25px; height:25px;"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-1"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="checkbox" class="form-check-input mt-0 correct-checkbox" style="width:25px; height:25px;"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-2"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="checkbox" class="form-check-input mt-0 correct-checkbox" style="width:25px; height:25px;"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-3"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="checkbox" class="form-check-input mt-0 correct-checkbox" style="width:25px; height:25px;"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-4"></div>
            </div>
        `;
        } else {
            return `
            <div id="options_container_${questionId}">
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="radio" class="form-check-input mt-0 correct-radio" style="width:25px; height:25px;" name="correct_${questionId}" value="1"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-1"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="radio" class="form-check-input mt-0 correct-radio" style="width:25px; height:25px;" name="correct_${questionId}" value="2"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-2"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="radio" class="form-check-input mt-0 correct-radio" style="width:25px; height:25px;" name="correct_${questionId}" value="3"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-3"></div>
                <div class="d-flex align-items-center mb-2 gap-2 option-row"><input type="radio" class="form-check-input mt-0 correct-radio" style="width:25px; height:25px;" name="correct_${questionId}" value="4"><span class="fw-bold ms-2 me-2" data-i18n="correct-label">صحيح</span><input type="text" class="form-control option-text" data-i18n-placeholder="option-placeholder-4"></div>
            </div>
        `;
        }
    };



    // 5. تعريف دالة تحديث رؤية التوضيح
    window.updateExplanationVisibility = function() {
        const explainBoxes = document.querySelectorAll('[id^="explain_"]');
        const show = showExplanation ? showExplanation.checked : false;
        explainBoxes.forEach(box => {
            if (box.id.startsWith('explain_') && !isNaN(box.id.split('_')[1])) {
                box.style.display = show ? 'block' : 'none';
            }
        });
    };

    // 6. تعريف دالة إضافة سؤال جديد
    window.addNewQuestion = function() {
        globalQuestionId++;
        const qId = globalQuestionId;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div class="card shadow-sm border-0 mb-4 rounded-4 p-4 question-box" id="question_${qId}">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="question-number"><span data-i18n="question-label-prefix">السؤال</span> <span class="q-display-number"></span></span>
                        <button class="btn btn-sm" style="color: #e53e3e; border: 1px solid #e53e3e; background: transparent; padding: 3px 12px; border-radius: 8px; cursor: pointer;" onclick="deleteQuestion(${qId})" data-i18n-title="delete-question-title"><i class="fas fa-trash-alt me-1"></i> <span data-i18n="delete-label">حذف</span></button>
                    </div>
                    <select class="form-select w-auto mt-2 mt-md-0 fw-bold text-primary" id="type_${qId}" onchange="changeQuestionType(${qId})">
                        <option value="mcq" data-i18n="type-mcq">اختيارات</option>
                        <option value="truefalse" data-i18n="type-tf">صح و خطأ</option>
                        <option value="multiple" data-i18n="type-multi">اختيار متعدد</option>
                    </select>
                </div>
                
                <input type="text" class="form-control form-control-lg mb-4 fw-bold question-input" id="question_${qId}_text" data-i18n-placeholder="question-text-placeholder">
                
                <div class="options-container" id="options_${qId}">
                    ${getOptionsHTML('mcq', qId)}
                </div>
                
                <div class="explain-box" id="explain_${qId}" style="display: none;">
                    <input type="text" class="form-control mt-3 bg-body-tertiary" id="explain_${qId}_text" data-i18n-placeholder="explanation-placeholder">
                </div>
                
                <div id="error_box_${qId}" style="color: #e53e3e; font-size: 0.95rem; background: rgba(229, 62, 62, 0.1); padding: 10px; border-radius: 10px; margin-top: 15px; display: none;">
                    <i class="fas fa-exclamation-circle me-1"></i> <span id="error_text_${qId}"></span>
                </div>
            </div>
        `;
        const newElem = tempDiv.firstElementChild;
        questionsContainer.appendChild(newElem);
        
        // ترجمة العنصر الجديد فوراً
        if (typeof translatePage === 'function') {
            translatePage(newElem);
        }
        
        updateQuestionNumbers();
        updateExplanationVisibility();
    };

    // 7. تعريف دالة معالجة تغيير عدد الأسئلة
    window.handleRadioChange = function(radioBtn) {
        totalSelected = parseInt(radioBtn.value);
        if (questionsContainer) {
            questionsContainer.innerHTML = '';
        }
        globalQuestionId = 0;
        for (let i = 0; i < totalSelected; i++) {
            addNewQuestion();
        }
    };

    // 8. المبادرة الأولية (Initial Load)
    if (!manualInitialized) {
        const selected = document.querySelector('input[name="questionCount"]:checked');
        let initCount = selected ? parseInt(selected.value) : 10;
        questionsContainer.innerHTML = '';
        globalQuestionId = 0;
        for (let i = 0; i < initCount; i++) {
            addNewQuestion();
        }
        manualInitialized = true;
    }

    // 9. ربط حدث تغيير رؤية التوضيح
    if (showExplanation) {
        showExplanation.addEventListener('change', updateExplanationVisibility);
    }

    // 10. دالة جمع البيانات للحفظ
    window.gatherQuestionsData = function() {
        let questions = [];
        let isValid = true;
        
        document.querySelectorAll('[id^="error_box_"]').forEach(box => box.style.display = 'none');
        
        const qBoxes = document.querySelectorAll('.question-box');
        for(let i=0; i<qBoxes.length; i++) {
            const box = qBoxes[i];
            const qId = box.id.split('_')[1];
            let text = document.getElementById('question_' + qId + '_text').value.trim();

            if (!text) {
                isValid = false;
                const errBox = document.getElementById('error_box_' + qId);
                const errText = document.getElementById('error_text_' + qId);
                if(errBox && errText) {
                    errText.innerHTML = `<strong>${getTranslation('empty-question-error')}</strong><br>${getTranslation('fill-or-delete-hint')}`;
                    errBox.style.display = 'block';
                }
                continue;
            }

            const type = document.getElementById('type_' + qId).value;
            let qError = null;
            let options = [];

            if (type === 'truefalse') {
                const checked = box.querySelector('input[type="radio"]:checked');
                if(!checked) {
                    qError = getTranslation('select-tf-error');
                } else {
                    const correctVal = checked.value;
                    options.push({ text: getTranslation('true-label'), isCorrect: correctVal === 'true' });
                    options.push({ text: getTranslation('false-label'), isCorrect: correctVal === 'false' });
                }
            } else if (type === 'mcq') {
                const checked = box.querySelector('.correct-radio:checked');
                if(!checked) {
                    qError = getTranslation('select-correct-error');
                } else {
                    const correctVal = checked.value;
                    const rows = box.querySelectorAll('.option-row');
                    
                    let hasEmptyOption = false;
                    rows.forEach(row => {
                        const radio = row.querySelector('.correct-radio');
                        let optText = row.querySelector('.option-text').value.trim();
                        if (!optText) hasEmptyOption = true;
                        options.push({ text: optText || "Empty Option", isCorrect: radio && radio.value === correctVal });
                    });
                    
                    if(hasEmptyOption) {
                        qError = getTranslation('fill-all-options-error');
                    }
                }
            } else { // multiple
                const rows = box.querySelectorAll('.option-row');
                let hasChecked = false;
                let hasEmptyOption = false;
                rows.forEach(row => {
                    const cb = row.querySelector('.correct-checkbox');
                    let optText = row.querySelector('.option-text').value.trim();
                    if (cb && cb.checked) hasChecked = true;
                    if (!optText) hasEmptyOption = true;
                    options.push({ text: optText || "Empty Option", isCorrect: cb && cb.checked });
                });
                
                if(!hasChecked) {
                    qError = getTranslation('select-at-least-one-error');
                } else if(hasEmptyOption) {
                    qError = getTranslation('fill-all-or-delete-extra-error');
                }
            }
            
            if (qError) {
                const errBox = document.getElementById('error_box_' + qId);
                const errText = document.getElementById('error_text_' + qId);
                if(errBox && errText) {
                    errText.textContent = qError;
                    errBox.style.display = 'block';
                }
                isValid = false;
            }
            
            const explainInput = document.getElementById('explain_' + qId + '_text');
            const explanation = explainInput ? explainInput.value : '';
            questions.push({ text, type, options, explanation });
        }
        
        return { valid: isValid, data: JSON.stringify(questions) };
    };

    // 11. ربط حدث الحفظ
    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            try {
                const titleBox = document.getElementById('titleErrorBox');
                const mainBox = document.getElementById('mainSaveErrorBox');
                if (titleBox) titleBox.style.display = 'none';
                if (mainBox) mainBox.style.display = 'none';
                
                let customTitle = document.getElementById('quizTitleInput').value.trim();
                let hasTitleError = false;
                if (!customTitle) {
                    if (titleBox) {
                        document.getElementById('titleErrorText').textContent = getTranslation('quiz-title-required-error');
                        titleBox.style.display = 'block';
                    }
                    hasTitleError = true;
                }
                let resultObj = gatherQuestionsData();
                if (hasTitleError || !resultObj.valid) {
                    if (mainBox) {
                        document.getElementById('mainSaveErrorText').textContent = getTranslation('fix-errors-msg');
                        mainBox.style.display = 'block';
                    }
                    
                    let firstErrorBox = null;
                    const errorBoxes = document.querySelectorAll('[id^="error_box_"]');
                    for (let i = 0; i < errorBoxes.length; i++) {
                        if (errorBoxes[i].style.display !== 'none' && errorBoxes[i].style.display !== '') {
                            firstErrorBox = errorBoxes[i];
                            break;
                        }
                    }

                    if (hasTitleError) {
                        document.getElementById('quizTitleInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (firstErrorBox) {
                        const parentBox = firstErrorBox.closest('.question-box') || firstErrorBox;
                        parentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }
                
                let collectedData = resultObj.data;
                let parsedData = JSON.parse(collectedData);

                if (parsedData.length === 0) {
                    if (mainBox) {
                        document.getElementById('mainSaveErrorText').textContent = getTranslation('at-least-one-question-error');
                        mainBox.style.display = 'block';
                        mainBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                const response = await fetch('/api/quizzes/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: customTitle,
                        questionCount: parsedData.length,
                        createdBy: '',
                        questionsData: collectedData
                    })
                });
                const result = await response.json();
                alert(`✅ تم إرسال الاختبار للخادم بنجاح!\nالرابط الخاص بالكويز هو: ${window.location.origin}/quiz/${result.quizLink}`);
                window.location.href = '/quiz/' + result.quizLink;
            } catch (err) {
                alert(' حدث خطأ في الاتصال بالخادم!');
            }
        });
    }
}

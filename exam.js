document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. DATA LOADING ---
    const activeCode = localStorage.getItem('activeExamCode');
    const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    let currentExamData = null;
    let questions = [];

    // Hardcoded Demo Fallback (Preserving original demo questions structure)
    const demoQuestions = [
        // MCQs
        { id: 1, type: 'mcq', text: 'Where is the map definition file generally stored?', mark: 1, options: ['RECYCLE BIN', 'CGI-BIN', 'BIN', 'All of the above'] },
        { id: 2, type: 'mcq', text: 'The latest HTML standard is:', mark: 1, options: ['HTML 4.0', 'HTML 5.0', 'XML', 'SGML'] },
        { id: 3, type: 'mcq', text: 'The MIME text file is saved with which of the following extension?', mark: 1, options: ['THM extension', 'HTM exension', 'HTML extension', 'None'] },
        { id: 4, type: 'mcq', text: 'Which one of the following is an example of an internet search engine?', mark: 1, options: ['LINUX','Google','MS Word','Windows'] },
        { id: 5, type: 'mcq', text: 'Which of the following is not an HTML tag?', mark: 1, options: ['select', 'input', 'textarea', 'list'] },
        
        // Short Answers
        { id: 11, type: 'text', text: 'Explain the purpose of the CSS Box Model.', mark: 2 },
        { id: 12, type: 'text', text: 'Define Protocol.', mark: 2 },
        
        // Comparison
        { id: 21, type: 'comparison', text: 'Compare and contrast `margin` and `padding` properties in CSS.', mark: 10 }
    ];

    // Try to find the exam in storage
    const foundExam = storedExams.find(e => e.code === activeCode);

    if (foundExam) {
        currentExamData = foundExam;
        questions = foundExam.questions;
        // Update Header Info
        const subjectHeader = document.querySelector('.subject-name');
        if(subjectHeader) subjectHeader.textContent = `${foundExam.subject} (${foundExam.code})`;
    } else {
        // Default to demo if code matches or nothing found
        questions = demoQuestions;
        const subjectHeader = document.querySelector('.subject-name');
        if(subjectHeader) subjectHeader.textContent = "Web Technology - WEBTECH1010";
    }

    // --- 2. ELEMENT REFERENCES ---
    const contentContainer = document.getElementById('question-content-container');
    const prevButton = document.querySelector('.nav-btn.prev');
    const nextButton = document.querySelector('.nav-btn.next');
    const flagButton = document.querySelector('.nav-btn.flag');
    const doubtButton = document.querySelector('.nav-btn.doubt');
    // We target the card inside the status column to inject sections
    const statusCard = document.querySelector('.status-card'); 
    const timerElement = document.querySelector('.timer');
    const submitBtn = document.querySelector('.submit-btn');
    const maxWords = 500;
    
    let currentQuestionIndex = 0;

    // --- 3. SUBMIT LOGIC (REDIRECT) ---
    function submitExam() {
        if(confirm("Are you sure you want to submit the exam?")) {
            window.location.href = 'success.html';
        }
    }

    if(submitBtn) {
        // Remove inline onclick from HTML first to be safe
        submitBtn.removeAttribute('onclick'); 
        submitBtn.addEventListener('click', submitExam);
    }

    // --- 4. DYNAMIC SIDEBAR GENERATION ---
    function generateSidebar() {
        // Clear existing static content (hardcoded bubbles)
        statusCard.innerHTML = ''; 

        // Helper function to create a section
        function createSection(title, qList) {
            if (!qList || qList.length === 0) return;

            const section = document.createElement('div');
            section.className = 'status-section';
            
            const header = document.createElement('h4');
            header.textContent = title;
            section.appendChild(header);
            
            const grid = document.createElement('div');
            grid.className = 'q-grid';

            qList.forEach(q => {
                const bubble = document.createElement('div');
                bubble.className = 'q-bubble';
                // Display logic: Use original ID if available, or just incrementing count based on global index
                // We use questions.indexOf(q) + 1 to ensure numbers are sequential 1..N
                const globalIndex = questions.indexOf(q);
                bubble.textContent = globalIndex + 1; 
                bubble.dataset.index = globalIndex; // Store global index for click handler
                
                // Click to navigate
                bubble.addEventListener('click', () => loadQuestion(globalIndex));
                grid.appendChild(bubble);
            });

            section.appendChild(grid);
            statusCard.appendChild(section);
        }

        // Filter questions by type to group them
        const mcqs = questions.filter(q => q.type === 'mcq');
        const shortAnswers = questions.filter(q => q.type === 'text');
        const comparisons = questions.filter(q => q.type === 'comparison');

        // Generate sections ONLY if questions exist for that type
        // This adapts the layout: if no MCQs, no MCQ section.
        if (mcqs.length > 0) {
            createSection(`MCQ - ${mcqs[0].mark} Mark`, mcqs);
        }
        if (shortAnswers.length > 0) {
            createSection(`Short Answer - ${shortAnswers[0].mark} Marks`, shortAnswers);
        }
        if (comparisons.length > 0) {
            createSection(`Long Answer - ${comparisons[0].mark} Marks`, comparisons);
        }
        
        // Fallback if empty
        if (questions.length === 0) {
            statusCard.innerHTML = '<p style="padding:20px; text-align:center; color:#777;">No questions available for this exam.</p>';
        }
    }

    // --- 5. RENDER FUNCTIONS ---

    function renderMCQ(question) {
        let optionsHtml = question.options.map((option, index) => `
            <label class="mcq-option" data-index="${index + 1}">
                <input type="radio" name="q${question.id}_answer" value="${index + 1}">
                <span class="mcq-bubble">${index + 1}</span> 
                <span class="mcq-text">${option}</span>
            </label>
        `).join('');

        return `
            <div class="question-top-bar">
                <div class="question-header">
                    <span class="q-label">Q${currentQuestionIndex + 1}</span>
                    <h2 class="question-text">${question.text} (${question.mark} mark)</h2>
                </div>
            </div>
            <div class="mcq-answer-area" style="padding: 20px 0;">
                ${optionsHtml}
            </div>
            <p class="points-label" style="padding-left: 50px; color: #555;">Select one option.</p>
        `;
    }

    function renderDescriptive(question, type) {
        const isComparison = type === 'comparison';
        const markText = `${question.mark} marks`;
        
        return `
            <div class="question-top-bar">
                <div class="question-header">
                    <span class="q-label">Q${currentQuestionIndex + 1}</span>
                    <h2 class="question-text">${question.text} (${markText})</h2>
                </div>
                <div class="view-toggles">
                    <button class="toggle-btn ${!isComparison ? 'active' : ''}">Text</button>
                    <button class="toggle-btn ${isComparison ? 'active' : ''}">Comparison</button>
                </div>
            </div>
            
            <div class="descriptive-answer-area">
                <div class="answer-wrapper" style="display: ${isComparison ? 'none' : 'block'};"> 
                    <textarea placeholder="Type your answer here..." class="answer-textbox" id="textbox1"></textarea>
                </div>

                <div class="comparison-wrapper" style="display: ${isComparison ? 'flex' : 'none'};">
                    <div class="comparison-column">
                        <textarea placeholder="Topic Name 1" class="answer-textbox header-box" id="header-comp-1"></textarea>
                        <textarea placeholder="Write points for Topic 1 here..." class="answer-textbox comparison-box" id="textbox-comp-1"></textarea>
                    </div>
                    
                    <div class="vertical-separator"></div>

                    <div class="comparison-column">
                        <textarea placeholder="Topic Name 2" class="answer-textbox header-box" id="header-comp-2"></textarea>
                        <textarea placeholder="Write points for Topic 2 here..." class="answer-textbox comparison-box" id="textbox-comp-2"></textarea>
                    </div>
                </div>
                
                <div class="word-count" style="margin-top: 15px;">Words: 0 / ${maxWords} (Max)</div>
            </div>
        `;
    }

    function loadQuestion(index) {
        if (index < 0 || index >= questions.length) return;

        currentQuestionIndex = index;
        const question = questions[currentQuestionIndex];

        // Render Content
        if (question.type === 'mcq') {
            contentContainer.innerHTML = renderMCQ(question);
            attachMCQListeners(index);
        } else {
            contentContainer.innerHTML = renderDescriptive(question, question.type);
            attachDescriptiveListeners(index);
        }

        // Nav Button State
        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = currentQuestionIndex === questions.length - 1;
        
        // Update Sidebar Active State
        updateStatusBubble(index);
        updateProgressBar();
    }

    // --- 6. EVENT LISTENERS ---

    function attachMCQListeners(idx) {
        const mcqOptions = contentContainer.querySelectorAll('.mcq-option input[type="radio"]');
        // Find bubble by dataset index to allow flexible ordering across sections
        const bubble = document.querySelector(`.q-bubble[data-index="${idx}"]`);

        mcqOptions.forEach(input => {
            input.addEventListener('change', function() {
                if (this.checked && bubble) {
                    bubble.classList.add('answered');
                    bubble.classList.remove('flagged', 'doubt');
                    updateProgressBar();
                }
            });
        });
    }

    function attachDescriptiveListeners(idx) {
        const bubble = document.querySelector(`.q-bubble[data-index="${idx}"]`);
        const textboxFull = document.getElementById('textbox1');
        const wordCountDisplay = contentContainer.querySelector('.word-count');
        
        // Toggles logic
        const toggleButtons = contentContainer.querySelectorAll('.view-toggles .toggle-btn');
        const answerWrapper = contentContainer.querySelector('.answer-wrapper'); 
        const comparisonWrapper = contentContainer.querySelector('.comparison-wrapper'); 

        if (toggleButtons.length > 0) {
            toggleButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    toggleButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    if (this.textContent.trim() === 'Text') {
                        answerWrapper.style.display = 'block';
                        comparisonWrapper.style.display = 'none';
                    } else {
                        answerWrapper.style.display = 'none';
                        comparisonWrapper.style.display = 'flex';
                    }
                });
            });
        }

        function updateWordCount() {
            let totalWordCount = 0;
            if (textboxFull && answerWrapper.style.display !== 'none') {
                const text = textboxFull.value.trim();
                totalWordCount = text ? text.split(/\s+/).length : 0;
            } 
            
            if(wordCountDisplay) {
                wordCountDisplay.textContent = `Words: ${totalWordCount} / ${maxWords} (Max)`;
                wordCountDisplay.style.color = (totalWordCount > maxWords) ? 'red' : '#777';
            }
            
            if (totalWordCount > 0 && bubble) {
                 bubble.classList.add('answered');
                 updateProgressBar();
            }
        }

        if (textboxFull) textboxFull.addEventListener('input', updateWordCount);
        
        // Also listen to comparison boxes
        const compBoxes = contentContainer.querySelectorAll('.comparison-box');
        compBoxes.forEach(box => {
            box.addEventListener('input', () => {
                if(box.value.trim().length > 0 && bubble) {
                    bubble.classList.add('answered');
                    updateProgressBar();
                }
            });
        });
    }

    function updateStatusBubble(idx) {
        document.querySelectorAll('.q-bubble').forEach(bubble => {
            bubble.classList.remove('active-q');
            // Use dataset.index because bubbles might be in different containers
            if (parseInt(bubble.dataset.index) === idx) {
                 bubble.classList.add('active-q');
            }
        });
    }

    function updateProgressBar() {
        const totalQuestions = questions.length;
        const answeredQuestions = document.querySelectorAll('.q-bubble.answered').length;
        const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `Progress: ${answeredQuestions}/${totalQuestions} answered`;
        }
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    // Flag & Doubt Buttons
    if (flagButton) {
        flagButton.addEventListener('click', function() {
            const bubble = document.querySelector(`.q-bubble[data-index="${currentQuestionIndex}"]`);
            if (bubble) {
                bubble.classList.toggle('flagged');
                bubble.classList.remove('doubt');
            }
        });
    }

    if (doubtButton) {
        doubtButton.addEventListener('click', function() {
            const bubble = document.querySelector(`.q-bubble[data-index="${currentQuestionIndex}"]`);
            if (bubble) {
                bubble.classList.toggle('doubt');
                bubble.classList.remove('flagged');
            }
        });
    }

    nextButton.addEventListener('click', () => loadQuestion(currentQuestionIndex + 1));
    prevButton.addEventListener('click', () => loadQuestion(currentQuestionIndex - 1));

    // --- 7. TIMER LOGIC ---
    let durationMins = (currentExamData && currentExamData.duration) ? parseInt(currentExamData.duration) : 120; 
    let totalSeconds = durationMins * 60; 

    const timerInterval = setInterval(function() {
        totalSeconds--;

        if (totalSeconds < 0) {
            clearInterval(timerInterval);
            // Time up redirect
            alert("Time is up! Submitting your exam automatically.");
            window.location.href = 'success.html';
            return;
        }

        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');        
        if (timerElement) {
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }

    }, 1000); 

    // --- INITIAL LOAD ---
    generateSidebar();
    loadQuestion(0);
});
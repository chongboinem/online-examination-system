// Global counters for unique IDs
let qCount = 0;

// --- QUESTION BUILDER FUNCTIONS (Exposed to Window) ---

window.addMCQ = function() {
    const container = document.getElementById('questions-container');
    document.getElementById('empty-msg').style.display = 'none';
    qCount++;

    const div = document.createElement('div');
    div.className = 'question-item';
    div.dataset.type = 'mcq';
    // Unique group name for radio buttons so they toggle correctly per question
    const radioGroup = `q${qCount}_correct`;

    div.innerHTML = `
        <div class="question-header">
            <span>Q${qCount} - Multiple Choice (1 Mark)</span>
            <i class="fas fa-times delete-q-btn" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
        <input type="text" class="q-input q-text" placeholder="Type your question here..." required>
        
        <div class="option-row">
            <input type="radio" name="${radioGroup}" value="0" class="correct-ans-radio" title="Mark as Correct">
            <input type="text" class="q-input q-opt" placeholder="Option A" required>
        </div>
        <div class="option-row">
            <input type="radio" name="${radioGroup}" value="1" class="correct-ans-radio" title="Mark as Correct">
            <input type="text" class="q-input q-opt" placeholder="Option B" required>
        </div>
        <div class="option-row">
            <input type="radio" name="${radioGroup}" value="2" class="correct-ans-radio" title="Mark as Correct">
            <input type="text" class="q-input q-opt" placeholder="Option C" required>
        </div>
        <div class="option-row">
            <input type="radio" name="${radioGroup}" value="3" class="correct-ans-radio" title="Mark as Correct">
            <input type="text" class="q-input q-opt" placeholder="Option D" required>
        </div>
    `;
    container.appendChild(div);
};

window.addShortAnswer = function() {
    const container = document.getElementById('questions-container');
    document.getElementById('empty-msg').style.display = 'none';
    qCount++;

    const div = document.createElement('div');
    div.className = 'question-item';
    div.dataset.type = 'text';
    div.innerHTML = `
        <div class="question-header">
            <span>Q${qCount} - Short Answer (2 Marks)</span>
            <i class="fas fa-times delete-q-btn" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
        <input type="text" class="q-input q-text" placeholder="Type your question here..." required>
        <p style="font-size:0.8em; color:#777;">Teacher will grade this manually.</p>
    `;
    container.appendChild(div);
};

window.addComparison = function() {
    const container = document.getElementById('questions-container');
    document.getElementById('empty-msg').style.display = 'none';
    qCount++;

    const div = document.createElement('div');
    div.className = 'question-item';
    div.dataset.type = 'comparison';
    div.innerHTML = `
        <div class="question-header">
            <span>Q${qCount} - Comparison (10 Marks)</span>
            <i class="fas fa-times delete-q-btn" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
        <input type="text" class="q-input q-text" placeholder="Enter the comparison topic (e.g., TCP vs UDP)" required>
        <p style="font-size:0.8em; color:#777;">Teacher will grade this manually.</p>
    `;
    container.appendChild(div);
};


document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. TAB NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active-section'));
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-section');
            
            pageTitle.textContent = this.textContent.trim();
        });
    });

    const quickCreateBtn = document.getElementById('quick-create-btn');
    if (quickCreateBtn) {
        quickCreateBtn.addEventListener('click', () => {
            document.querySelector('[data-target="create-section"]').click();
        });
    }


    // --- 2. PUBLISH EXAM LOGIC ---
    const form = document.getElementById('create-exam-main-form');
    const tableBody = document.querySelector('#exams-table tbody');

    // Load existing exams on page load
    if (tableBody) loadExamsToTable();

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // A. Gather Metadata
            const subject = document.getElementById('main-subject').value;
            const code = document.getElementById('main-code').value;
            const datetime = document.getElementById('main-datetime').value;
            const duration = document.getElementById('main-duration').value;

            // B. Gather Questions
            const qItems = document.querySelectorAll('.question-item');
            let questionsData = [];

            qItems.forEach((item, index) => {
                const text = item.querySelector('.q-text').value;
                const type = item.dataset.type;
                let options = [];
                let marks = 2; 
                let correctAnswerIndex = null;

                if (type === 'mcq') {
                    marks = 1;
                    item.querySelectorAll('.q-opt').forEach(opt => options.push(opt.value));
                    
                    // --- FIND CHECKED RADIO BUTTON TO SET CORRECT ANSWER ---
                    const checkedRadio = item.querySelector('input[type="radio"]:checked');
                    if (checkedRadio) {
                        correctAnswerIndex = parseInt(checkedRadio.value);
                    }
                } else if (type === 'comparison') {
                    marks = 10;
                }

                questionsData.push({
                    id: index + 1,
                    type: type,
                    text: text,
                    options: options,
                    correctAnswer: correctAnswerIndex, // Save correct answer index (0-3)
                    mark: marks
                });
            });

            if (questionsData.length === 0) {
                alert("Please add at least one question.");
                return;
            }

            // C. Create Object
            const newExam = {
                code: code,
                subject: subject,
                datetime: datetime,
                duration: duration,
                questions: questionsData
            };

            // D. Save to Storage
            const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
            storedExams.push(newExam);
            localStorage.setItem('exams', JSON.stringify(storedExams));

            // E. Refresh Table
            if (tableBody) loadExamsToTable();

            alert('Exam Published Successfully!');
            
            // F. Reset UI
            form.reset();
            const qContainer = document.getElementById('questions-container');
            if (qContainer) {
                qContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;" id="empty-msg">No questions added yet. Use the buttons below to add questions.</p>';
            }
            qCount = 0;
            document.querySelector('[data-target="exams-section"]').click();
        });
    }

    // Helper to render table from LocalStorage
    function loadExamsToTable() {
        const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
        if (!tableBody) return;
        
        tableBody.innerHTML = ''; // Clear current table

        // Add default/demo exam
        tableBody.innerHTML += `
            <tr>
                <td class="exam-code"><b>WEBTECH1010</b></td>
                <td class="exam-subject">Web Technology</td>
                <td>2025-11-25 10:00</td>
                <td class="exam-duration">120 Mins</td>
                <td><button class="action-btn edit-exam-btn">Edit</button></td>
            </tr>
        `;

        // Add created exams
        storedExams.forEach(exam => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="exam-code"><b>${exam.code}</b></td>
                <td class="exam-subject">${exam.subject}</td>
                <td>${exam.datetime.replace('T', ' ')}</td>
                <td class="exam-duration">${exam.duration} Mins</td>
                <td><button class="action-btn edit-exam-btn">Edit</button></td>
            `;
            tableBody.prepend(row);
        });
        
        attachEditListeners();
    }


    // --- 3. EDIT & DELETE EXAM LOGIC ---
    const editModal = document.getElementById('edit-exam-modal');
    const editClose = editModal ? editModal.querySelector('.close-button') : null;
    const editForm = document.getElementById('edit-exam-form');
    const deleteBtn = document.getElementById('delete-exam-btn');
    
    const editSubject = document.getElementById('edit-subject');
    const editCode = document.getElementById('edit-code');
    const editDuration = document.getElementById('edit-duration');
    
    let currentEditingCode = null;

    function attachEditListeners() {
        document.querySelectorAll('.edit-exam-btn').forEach(btn => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                const row = this.closest('tr');
                const code = row.querySelector('.exam-code b').textContent;
                
                // Find exam data
                const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
                const examData = storedExams.find(e => e.code === code);
                
                if (examData) {
                    // Populate Modal
                    currentEditingCode = code;
                    editSubject.value = examData.subject;
                    editCode.value = examData.code;
                    editDuration.value = examData.duration;
                    
                    if (editModal) editModal.classList.add('visible');
                } else if (code === 'WEBTECH1010') {
                    alert("This is a demo exam and cannot be edited.");
                }
            });
        });
    }

    if(editClose) editClose.addEventListener('click', () => editModal.classList.remove('visible'));
    
    // SAVE EDITED EXAM
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentEditingCode) {
                let storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
                // Update exam in array
                const index = storedExams.findIndex(e => e.code === currentEditingCode);
                if (index !== -1) {
                    storedExams[index].subject = editSubject.value;
                    storedExams[index].duration = editDuration.value;
                    
                    localStorage.setItem('exams', JSON.stringify(storedExams));
                    loadExamsToTable();
                    editModal.classList.remove('visible');
                    alert("Exam updated successfully!");
                }
            }
        });
    }

    // DELETE EXAM
    if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if(currentEditingCode) {
                if (confirm("Are you sure you want to delete this exam?")) {
                    let storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
                    storedExams = storedExams.filter(e => e.code !== currentEditingCode);
                    localStorage.setItem('exams', JSON.stringify(storedExams));
                    
                    loadExamsToTable();
                    editModal.classList.remove('visible');
                }
            }
        });
    }

    window.addEventListener('click', (e) => {
        if(e.target === editModal) editModal.classList.remove('visible');
    });
});
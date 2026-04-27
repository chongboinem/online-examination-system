document.addEventListener('DOMContentLoaded', function() {
    
    // --- MODAL LOGIC (Standard) ---
    const btnStudent = document.getElementById('btn-student');
    const btnAdmin = document.getElementById('btn-admin');
    const btnExaminer = document.getElementById('btn-examiner');
    const modalStudent = document.getElementById('student-modal');
    const modalAdmin = document.getElementById('admin-modal');
    const modalExaminer = document.getElementById('examiner-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    function openModal(modal) { modal.classList.add('visible'); }
    function closeModal(modal) { 
        modal.classList.remove('visible'); 
        if(modal.querySelector('.error-text')) modal.querySelector('.error-text').textContent = '';
    }

    if(btnStudent) btnStudent.addEventListener('click', () => openModal(modalStudent));
    if(btnAdmin) btnAdmin.addEventListener('click', () => openModal(modalAdmin));
    if(btnExaminer) btnExaminer.addEventListener('click', () => openModal(modalExaminer));

    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.getAttribute('data-target'));
            closeModal(target);
        });
    });

    window.addEventListener('click', (e) => {
        if(e.target.classList.contains('modal-overlay')) closeModal(e.target);
    });


    // --- STUDENT LOGIN LOGIC ---
    const studentForm = document.getElementById('student-login-form');
    if(studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('exam-code').value;
            const pass = document.getElementById('student-password').value;
            const err = document.getElementById('student-error');

            // 1. Demo Credentials
            const isDemo = (code === 'WEBTECH1010' && pass === 'password');

            // 2. Check Created Exams (LocalStorage)
            const exams = JSON.parse(localStorage.getItem('exams') || '[]');
            const exists = exams.find(ex => ex.code === code);

            if (isDemo || (exists && pass === 'password')) {
                // SAVE ACTIVE CODE so exam.js knows what to load
                localStorage.setItem('activeExamCode', code);
                window.location.href = 'quote.html';
            } else {
                err.textContent = "Invalid Code or Password.";
            }
        });
    }

    // --- ADMIN LOGIN ---
    const adminForm = document.getElementById('admin-login-form');
    if(adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(document.getElementById('admin-id').value === 'ADMIN01' && document.getElementById('admin-password').value === 'admin123') {
                window.location.href = 'admin.html';
            } else {
                document.getElementById('admin-error').textContent = 'Invalid Credentials';
            }
        });
    }

    // --- EXAMINER LOGIN ---
    const examForm = document.getElementById('examiner-login-form');
    if(examForm) {
        examForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(document.getElementById('examiner-email').value === 'faculty@university.edu' && document.getElementById('examiner-password').value === 'teacher123') {
                window.location.href = 'examiner.html';
            } else {
                document.getElementById('examiner-error').textContent = 'Invalid Credentials';
            }
        });
    }
}); 
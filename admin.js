document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. SIDEBAR NAVIGATION LOGIC
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Stop link from jumping

            // 1. Remove 'active' class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            
            // 2. Add 'active' to clicked link
            this.classList.add('active');

            // 3. Hide all sections
            sections.forEach(section => {
                section.classList.remove('active-section');
            });

            // 4. Show target section
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-section');
            }

            // 5. Update Header Title based on text
            // e.g., "<icon> Students" becomes "Students"
            pageTitle.textContent = this.textContent.trim();
        });
    });


    // ==========================================
    // 2. MODAL & TABLE LOGIC (Existing)
    // ==========================================
    
    // --- ELEMENTS FOR EDIT MODAL ---
    const editModal = document.getElementById('edit-modal');
    const closeBtn = editModal ? editModal.querySelector('.close-button') : null;
    const editForm = document.getElementById('edit-user-form');
    const deleteBtn = document.getElementById('delete-user-btn');
    
    const nameInput = document.getElementById('edit-name');
    const roleInput = document.getElementById('edit-role');

    let currentRow = null;

    // --- FUNCTIONS ---

    function openEditModal(row) {
        currentRow = row; 
        
        // Look for specific classes, fallback to cell index for Students table
        const nameCell = row.querySelector('.user-name') || row.cells[1]; 
        const roleCell = row.querySelector('.user-role'); // Might be null in Student table
        
        const currentName = nameCell ? nameCell.textContent : "Unknown";
        // If role cell exists use it, otherwise assume based on section or context
        const currentRole = roleCell ? roleCell.textContent : "Student"; 

        if (nameInput) nameInput.value = currentName;
        if (roleInput) roleInput.value = currentRole;

        if (editModal) editModal.classList.add('visible');
    }

    function attachEditListeners() {
        const allEditButtons = document.querySelectorAll('.edit-btn');
        allEditButtons.forEach(btn => {
            // Remove old listener to avoid duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                const row = this.closest('tr');
                openEditModal(row);
            });
        });
    }

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            editModal.classList.remove('visible');
            currentRow = null;
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('visible');
            currentRow = null;
        }
    });


    // --- APPROVE / REJECT LOGIC ---
    const approveButtons = document.querySelectorAll('.approve-btn');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const actionCell = this.closest('td');
            const statusSpan = row.querySelector('.status');

            if (statusSpan) {
                statusSpan.textContent = 'Active';
                statusSpan.className = 'status active'; 
            }

            actionCell.innerHTML = '<button class="action-btn edit-btn">Edit</button>';
            
            // Re-attach listeners for the newly created button
            attachEditListeners();
        });
    });

    const rejectButtons = document.querySelectorAll('.reject-btn');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const statusSpan = row.querySelector('.status');
            const approveBtn = this.parentElement.querySelector('.approve-btn');

            if (statusSpan) {
                statusSpan.textContent = 'Rejected';
                statusSpan.className = 'status rejected'; 
            }

            if (approveBtn) approveBtn.remove();

            this.textContent = 'Rejected';
            this.disabled = true;
            this.style.cursor = 'not-allowed';
            this.style.backgroundColor = '#ccc';
        });
    });


    // --- SAVE CHANGES ---
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentRow) {
                const nameCell = currentRow.querySelector('.user-name') || currentRow.cells[1];
                const roleCell = currentRow.querySelector('.user-role');

                if(nameCell) nameCell.textContent = nameInput.value;
                if(roleCell) roleCell.textContent = roleInput.value;
                
                editModal.classList.remove('visible');
            }
        });
    }


    // --- DELETE PROFILE ---
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (currentRow) {
                if(confirm("Are you sure you want to delete this profile?")) {
                    currentRow.remove();
                    editModal.classList.remove('visible');
                    currentRow = null;
                }
            }
        });
    }

    // Initial Listener Attach
    attachEditListeners();
});
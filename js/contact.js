/**
 * Contact Page Functionality
 * Handles interactions, validation, file handling, and submission
 */
class ContactManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.modal = document.getElementById('success-modal');
        this.fileInput = document.getElementById('file');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        
        // Configuration
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 
            'application/pdf', 'application/illustrator', 
            'image/vnd.adobe.photoshop'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupRealTimeValidation();
        this.setupMobileMenu();
    }

    /* ===========================
       Event Listeners
       =========================== */
    setupEventListeners() {
        // Form Submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Modal Interactions
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target.matches('.modal-close, .modal-overlay, .close-modal, .close-modal *')) {
                    this.closeModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    setupMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;

        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking links
        this.navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ===========================
       File Upload Handling
       =========================== */
    setupFileUpload() {
        const uploadArea = document.querySelector('.file-upload-area');
        if (!uploadArea || !this.fileInput) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight visual state
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'));
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'));
        });

        // Handle Drop
        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files; // Update input value
                this.updateFilePreviews(files);
            }
        });

        // Handle Click (Browse)
        uploadArea.addEventListener('click', () => this.fileInput.click());

        // Handle Input Change
        this.fileInput.addEventListener('change', () => {
            this.updateFilePreviews(this.fileInput.files);
        });
    }

    updateFilePreviews(files) {
        const uploadArea = document.querySelector('.file-upload-area');
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        
        // Remove existing previews
        uploadArea.querySelectorAll('.file-preview').forEach(el => el.remove());

        if (files.length === 0) {
            placeholder.style.display = 'block';
            return;
        }

        placeholder.style.display = 'none';

        Array.from(files).forEach(file => {
            if (!this.validateFile(file)) return;

            const preview = document.createElement('div');
            preview.className = 'file-preview';
            
            // Format size
            const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
            
            preview.innerHTML = `
                <div class="file-icon">
                    ${file.type.startsWith('image/') 
                        ? `<img src="${URL.createObjectURL(file)}" alt="preview">` 
                        : '<i class="fas fa-file-alt fa-2x" style="color:#64748b"></i>'}
                </div>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${size}</span>
                </div>
                <button type="button" class="file-remove" aria-label="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Remove Logic
            preview.querySelector('.file-remove').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening file dialog
                preview.remove();
                // Note: We can't programmatically remove single files from FileList easily
                // For a real app, you'd maintain a separate array of file objects
                if (uploadArea.querySelectorAll('.file-preview').length === 0) {
                    this.fileInput.value = ''; // Clear input
                    placeholder.style.display = 'block';
                }
            });

            uploadArea.appendChild(preview);
        });
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            this.showNotification(`File type not supported: ${file.name}`, 'error');
            return false;
        }
        if (file.size > this.maxFileSize) {
            this.showNotification(`File too large (Max 10MB): ${file.name}`, 'error');
            return false;
        }
        return true;
    }

    /* ===========================
       Validation Logic
       =========================== */
    setupRealTimeValidation() {
        if (!this.form) return;
        
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                input.classList.remove('invalid');
                const error = input.parentElement.querySelector('.field-error');
                if (error) error.remove();
            });
        });
    }

    validateField(field) {
        let isValid = true;
        let message = '';

        // Clear previous error
        field.classList.remove('invalid');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Check required
        if (!field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        } 
        // Check Email
        else if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        if (!isValid) {
            field.classList.add('invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);
        }

        return isValid;
    }

    /* ===========================
       Form Submission
       =========================== */
    async handleFormSubmit(e) {
        e.preventDefault();

        // 1. Validate all fields
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) isFormValid = false;
        });

        if (!isFormValid) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }

        // 2. Loading State
        const btn = this.form.querySelector('.submit-btn');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';

        try {
            // 3. Simulate API Request
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 4. Success handling
            this.showModal();
            this.form.reset();
            // Clear files
            document.querySelectorAll('.file-preview').forEach(el => el.remove());
            document.querySelector('.upload-placeholder').style.display = 'block';

        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // 5. Restore Button
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }

    /* ===========================
       UI Utilities
       =========================== */
    showModal() {
        if (this.modal) this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notif.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notif);

        // Animate in
        requestAnimationFrame(() => notif.classList.add('show'));

        // Remove after 3s
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 4000);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.contactApp = new ContactManager();
});
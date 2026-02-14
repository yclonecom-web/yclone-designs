// Admin Dashboard Functionality
class AdminCMS {
    constructor() {
        this.contentData = this.loadContent();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadStats();
        this.initEditor();
    }

    loadContent() {
        const saved = localStorage.getItem('yclone_content');
        return saved ? JSON.parse(saved) : {
            about: {},
            portfolio: [],
            blog: [],
            services: []
        };
    }

    saveContent() {
        localStorage.setItem('yclone_content', JSON.stringify(this.contentData));
        this.showNotification('Content saved successfully!', 'success');
    }

    loadStats() {
        document.getElementById('project-count').textContent = 
            this.contentData.portfolio.length;
        document.getElementById('blog-count').textContent = 
            this.contentData.blog.length;
    }

    initEditor() {
        const editor = document.getElementById('editor-content');
        if (!editor) return;

        // Toolbar functionality
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.execEditorCommand(command, btn.dataset.value);
            });
        });

        // Save content on blur
        editor.addEventListener('blur', () => {
            this.saveEditorContent(editor.innerHTML);
        });
    }

    execEditorCommand(command, value = null) {
        document.execCommand(command, false, value);
        
        // Update toolbar button states
        if (command === 'formatBlock') {
            document.querySelectorAll('.toolbar-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === value) {
                    btn.classList.add('active');
                }
            });
        }
    }

    saveEditorContent(content) {
        const page = this.getCurrentPage();
        if (page) {
            this.contentData[page] = content;
            this.saveContent();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('edit-about')) return 'about';
        if (path.includes('edit-portfolio')) return 'portfolio';
        if (path.includes('edit-blog')) return 'blog';
        return null;
    }

    // Media Upload Functionality
    handleMediaUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const mediaItem = {
                    id: Date.now(),
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    url: e.target.result,
                    name: file.name,
                    size: file.size,
                    uploaded: new Date().toISOString()
                };

                // Store in localStorage (for demo)
                const media = JSON.parse(localStorage.getItem('yclone_media') || '[]');
                media.push(mediaItem);
                localStorage.setItem('yclone_media', JSON.stringify(media));

                resolve(mediaItem);
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // External URL upload
    async uploadFromURL(url, type) {
        try {
            const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
            const blob = await response.blob();
            const file = new File([blob], 'external-content', { type: blob.type });
            return await this.handleMediaUpload(file);
        } catch (error) {
            console.error('Error uploading from URL:', error);
            throw error;
        }
    }

    // Blog post management
    async saveBlogPost(postData) {
        const post = {
            id: Date.now(),
            ...postData,
            createdAt: new Date().toISOString(),
            slug: this.generateSlug(postData.title)
        };

        this.contentData.blog.unshift(post);
        this.saveContent();
        return post;
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-');
    }

    // Project management
    async saveProject(projectData) {
        const project = {
            id: Date.now(),
            ...projectData,
            featured: projectData.featured || false
        };

        this.contentData.portfolio.push(project);
        this.saveContent();
        return project;
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initEventListeners() {
        // Save buttons
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => this.saveContent());
        });

        // File upload
        const fileUpload = document.getElementById('file-upload');
        if (fileUpload) {
            fileUpload.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                    try {
                        await this.handleMediaUpload(file);
                        this.showNotification(`${file.name} uploaded successfully`, 'success');
                    } catch (error) {
                        this.showNotification(`Error uploading ${file.name}`, 'error');
                    }
                }
                fileUpload.value = '';
            });
        }

        // URL upload form
        const urlForm = document.getElementById('url-upload-form');
        if (urlForm) {
            urlForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const url = document.getElementById('media-url').value;
                const type = document.getElementById('media-type').value;
                
                try {
                    await this.uploadFromURL(url, type);
                    this.showNotification('Content uploaded from URL', 'success');
                    urlForm.reset();
                } catch (error) {
                    this.showNotification('Error uploading from URL', 'error');
                }
            });
        }

        // Modal handling
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                this.openModal(modalId);
            });
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminCMS = new AdminCMS();
});

// Rich Text Editor Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Format selection on toolbar click
    document.querySelectorAll('.format-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const format = this.dataset.format;
            document.execCommand(format, false, null);
        });
    });

    // Capitalize text
    document.querySelector('.capitalize-text')?.addEventListener('click', function() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            const capitalized = selectedText.charAt(0).toUpperCase() + selectedText.slice(1).toLowerCase();
            range.deleteContents();
            range.insertNode(document.createTextNode(capitalized));
        }
    });

    // Highlight with brand color
    document.querySelector('.highlight-text')?.addEventListener('click', function() {
        document.execCommand('backColor', false, '#003366');
        document.execCommand('foreColor', false, '#ffffff');
    });
});
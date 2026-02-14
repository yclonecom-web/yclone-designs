// Clean Minimal Sidebar Manager
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        
        // Toggles
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.desktopToggle = document.getElementById('desktop-toggle');
        this.closeBtn = document.getElementById('sidebar-close');
        
        this.isOpen = false;
    }

    init() {
        this.addEvents();
        this.highlightCurrentPage();
    }

    addEvents() {
        const toggleFn = () => this.toggle();
        const closeFn = () => this.close();

        if(this.mobileToggle) this.mobileToggle.addEventListener('click', toggleFn);
        if(this.desktopToggle) this.desktopToggle.addEventListener('click', toggleFn);
        if(this.closeBtn) this.closeBtn.addEventListener('click', closeFn);
        if(this.overlay) this.overlay.addEventListener('click', closeFn);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) closeFn();
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && this.isOpen) closeFn();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        this.isOpen = true;
    }

    close() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            // Reset active class
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SidebarManager();
    sidebar.init();
});
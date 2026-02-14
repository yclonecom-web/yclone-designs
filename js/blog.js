import { db, collection, getDocs, query, orderBy, where } from './firebase.js';

/**
 * Blog Page Functionality
 * Handles post rendering, filtering, search, and interactions
 */
class BlogManager {
    constructor() {
        this.container = document.getElementById('posts-container');
        this.paginationContainer = document.querySelector('.pagination');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');

        // State
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.posts = [];
        this.filteredPosts = [];

        this.init();
    }

    async init() {
        // 1. Setup Mobile Menu (UI only, no data needed)
        this.setupMobileMenu();
        this.setupEventListeners();

        // 2. Load Data from Firebase
        await this.loadBlogData();
    }

    /* ===========================
       Data Source (Firebase)
       =========================== */
    async loadBlogData() {
        if (!this.container) return;

        // Show loading state
        this.container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading articles...</p></div>';

        try {
            // Fetch published posts
            const q = query(
                collection(db, 'blog'),
                where("published", "==", true)
                // orderBy("createdAt", "desc") 
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                this.container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No articles found.</div>';
                return;
            }

            // Map Firestore docs to our app structure
            this.posts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                this.posts.push({
                    id: doc.id,
                    title: data.title,
                    category: data.category ? data.category.toLowerCase() : 'uncategorized',
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Recent',
                    image: data.imageImageUrl || '', // Uses the URL field
                    readTime: '5 min read', // Static or calc based on word count
                    comments: 0 // Placeholder or separate collection
                });
            });

            // Sort manually if index is missing/failed (Newest first)
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Initial Filter & Render
            this.filterPosts();

        } catch (error) {
            console.error("Error loading blog:", error);
            this.container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading content.</div>';
        }
    }

    /* ===========================
       Event Listeners
       =========================== */
    setupEventListeners() {
        // Category Buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI Toggle
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Logic
                this.currentCategory = btn.dataset.category;
                this.currentPage = 1; // Reset to page 1
                this.filterPosts();
            });
        });

        // Search Input
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn'); // Handle button click too

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.filterPosts();
            });
        }
        
        // Newsletter
        const newsletterForm = document.getElementById('sidebar-newsletter');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletter(newsletterForm);
            });
        }
    }

    setupMobileMenu() {
        // Matches logic in portfolio.js
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.hamburger.classList.toggle('active');
                this.navMenu.classList.toggle('active');
                // Removed body overflow locking to match portfolio behavior
            });
            
            // Close on link click
            this.navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                });
            });
        }
    }

    /* ===========================
       Logic
       =========================== */
    filterPosts() {
        this.filteredPosts = this.posts.filter(post => {
            // Category Match
            const categoryMatch = this.currentCategory === 'all' || post.category.includes(this.currentCategory);

            // Search Match
            const searchMatch = post.title.toLowerCase().includes(this.searchQuery) ||
                                post.excerpt.toLowerCase().includes(this.searchQuery);

            return categoryMatch && searchMatch;
        });

        this.renderPosts();
        this.renderPagination();
    }

    /* ===========================
       Rendering
       =========================== */
    renderPosts() {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (this.filteredPosts.length === 0) {
            this.container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 style="color: #64748b;">No articles found</h3>
                    <p style="color: #94a3b8;">Try adjusting your search or category.</p>
                </div>
            `;
            return;
        }

        // Pagination Logic
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const displayPosts = this.filteredPosts.slice(startIndex, endIndex);

        displayPosts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            
            // Image Fallback
            const imgUrl = post.image || 'assets/images/placeholder.jpg';
            const placeholder = `https://via.placeholder.com/600x400/f1f5f9/94a3b8?text=${encodeURIComponent(post.title)}`;

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imgUrl}" alt="${post.title}" onerror="this.src='${placeholder}'">
                </div>
                <div class="card-content">
                    <div class="post-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        <span><i class="far fa-folder"></i> ${this.capitalize(post.category)}</span>
                    </div>
                    <h3><a href="blog-post.html?id=${post.id}">${post.title}</a></h3>
                    <p>${post.excerpt}</p>
                    <div class="card-footer">
                        <a href="blog-post.html?id=${post.id}" class="read-more">Read Article</a>
                    </div>
                </div>
            `;
            this.container.appendChild(card);
        });
    }

    renderPagination() {
        if (!this.paginationContainer) return;
        this.paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                this.currentPage = i;
                this.renderPosts();
                this.renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            this.paginationContainer.appendChild(btn);
        }
    }

    /* ===========================
       Utilities
       =========================== */
    handleNewsletter(form) {
        const btn = form.querySelector('button');
        const originalText = btn.textContent;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showNotification('Subscribed successfully!', 'success');
            form.reset();
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    }

    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: ${type === 'success' ? '#10B981' : '#3B82F6'}; 
            color: white; padding: 10px 20px; border-radius: 5px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;
            transform: translateY(100px); transition: transform 0.3s ease;
        `;
        notif.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        document.body.appendChild(notif);

        requestAnimationFrame(() => notif.style.transform = 'translateY(0)');
        setTimeout(() => {
            notif.style.transform = 'translateY(100px)';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    capitalize(str) {
        if(!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
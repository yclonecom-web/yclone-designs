import { db, collection, getDocs, query, orderBy, where } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Navigation immediately
    setupMobileNav();
    
    // Load Data from Firebase
    loadPortfolio();
});

// --- 1. Mobile Navigation ---
function setupMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// --- 2. Load Portfolio Data ---
async function loadPortfolio() {
    const container = document.getElementById('portfolio-container');
    const countSpan = document.getElementById('count');
    
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading projects...</p></div>';

    try {
        // Query: Published projects, ordered by 'order' (or createdAt if order missing)
        // Note: If you get a "Missing Index" error in console, click the link provided in the error.
        // For now, we can try simple fetching and sorting in memory to be safe if index is missing.
        const q = query(collection(db, 'portfolio'), where("published", "==", true));
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No projects found.</div>';
            if(countSpan) countSpan.textContent = '0';
            return;
        }

        // Convert to array and sort by order manually (safer without composite index)
        const projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        
        projects.sort((a, b) => (a.order || 99) - (b.order || 99));

        // Update Count
        if(countSpan) countSpan.textContent = projects.length;

        // Render HTML
        container.innerHTML = projects.map(project => {
            // Handle categories (ensure it matches filter data-ids)
            // Admin saves: 'social', 'quote', etc.
            const categoryClass = project.category ? project.category.toLowerCase() : 'other';
            
            return `
                <div class="portfolio-item" data-category="${categoryClass}">
                    <div class="portfolio-image">
                        <img src="${project.imageImageUrl || 'assets/images/placeholder.jpg'}" alt="${project.ProjectName}" loading="lazy">
                        <div class="portfolio-overlay">
                            <div class="overlay-content">
                                <a href="#" class="view-btn" data-id="${project.id}">
                                    <i class="fas fa-expand"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="portfolio-info">
                        <div class="project-meta">
                            <span class="project-category">${project.category || 'Project'}</span>
                            <span class="project-year">${project.createdAt ? new Date(project.createdAt.seconds * 1000).getFullYear() : '2024'}</span>
                        </div>
                        <h3 class="project-title">${project.ProjectName}</h3>
                        <p class="project-desc">${project.excerpt || project.description || ''}</p>
                        
                        <!-- Hidden data for modal population -->
                        <div class="project-data" style="display:none;">
                            <span class="data-desc">${project.description || ''}</span>
                            <span class="data-link">${project.projectLink || '#'}</span>
                            <span class="data-cta">${project.cta || 'View Project'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize Interactions after DOM is ready
        setupFilters();
        setupModal();

    } catch (error) {
        console.error("Error loading portfolio:", error);
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading projects. Please try again later.</div>`;
    }
}

// --- 3. Filter Functionality ---
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const countSpan = document.getElementById('count');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            let visibleCount = 0;

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    // Optional: Add fade-in animation
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if(countSpan) countSpan.textContent = visibleCount;
        });
    });
}

// --- 4. Modal Functionality ---
function setupModal() {
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelectorAll('.modal-close, .modal-overlay');
    const viewBtns = document.querySelectorAll('.view-btn');

    // Modal Elements
    const modalImg = document.getElementById('modal-main-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalYear = document.getElementById('modal-year');
    const modalDesc = document.getElementById('modal-description');
    const modalLink = document.getElementById('project-link');

    // Open Modal
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const item = btn.closest('.portfolio-item');
            
            // Extract visual data
            const imgSrc = item.querySelector('img').src;
            const title = item.querySelector('.project-title').textContent;
            const category = item.querySelector('.project-category').textContent;
            const year = item.querySelector('.project-year').textContent;
            
            // Extract hidden data
            const desc = item.querySelector('.data-desc').textContent;
            const link = item.querySelector('.data-link').textContent;
            const cta = item.querySelector('.data-cta').textContent;

            // Populate Modal
            if(modalImg) modalImg.src = imgSrc;
            if(modalTitle) modalTitle.textContent = title;
            if(modalCategory) modalCategory.textContent = category;
            if(modalYear) modalYear.textContent = year;
            if(modalDesc) modalDesc.textContent = desc;
            
            if(modalLink) {
                modalLink.href = link;
                modalLink.textContent = cta;
                // Hide button if no link provided
                modalLink.style.display = (link === '#' || link === '') ? 'none' : 'inline-flex';
            }

            // Show Modal
            modal.classList.add('active');
        });
    });

    // Close Modal
    modalClose.forEach(el => {
        el.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}
/**
 * Services Page Functionality
 * Handles filtering, animations, and mobile navigation
 */
class ServiceManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupFiltering();
        this.setupScrollAnimations();
    }

    /* ===========================
       Mobile Navigation
       =========================== */
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {  
             hamburger.addEventListener('click', () => {  
                 hamburger.classList.toggle('active');  
                 navMenu.classList.toggle('active');  
                 
                 // Note: Body scroll locking removed to match portfolio dropdown behavior
             });  

             // Close menu when clicking links  
             navMenu.querySelectorAll('a').forEach(link => {  
                 link.addEventListener('click', () => {  
                     hamburger.classList.remove('active');  
                     navMenu.classList.remove('active');  
                 });  
             });  
         }
    }

    /* ===========================
       Filtering System
       =========================== */
    setupFiltering() {
        const buttons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.service-card');

        buttons.forEach(btn => {  
             btn.addEventListener('click', () => {  
                 // 1. Visual state for buttons  
                 buttons.forEach(b => b.classList.remove('active'));  
                 btn.classList.add('active');  

                 // 2. Get category  
                 const filterValue = btn.getAttribute('data-filter');  

                 // 3. Filter logic with animation  
                 this.filterCards(cards, filterValue);  
             });  
         });
    }

    filterCards(cards, filterValue) {
        cards.forEach(card => {
            // Reset animation
            card.classList.remove('fade-in');

            // Logic  
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {  
                card.style.display = 'flex';  
                // Small delay to allow display:flex to apply before opacity transition  
                setTimeout(() => card.classList.add('fade-in'), 10);  
            } else {  
                card.style.display = 'none';  
            }  
        });
    }

    /* ===========================
       Scroll Animations (Entrance)
       =========================== */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {  
             entries.forEach(entry => {  
                 if (entry.isIntersecting) {  
                     entry.target.classList.add('fade-in');  
                     observer.unobserve(entry.target);  
                 }  
             });  
         }, observerOptions);  

         // Observe title and cards  
         document.querySelectorAll('.service-card, .hero-title, .section-title').forEach(el => {  
             el.style.opacity = '0'; // Initial state  
             el.style.transform = 'translateY(20px)';  
             el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';  
             observer.observe(el);  
         });  

         // Add specific class for the Observer to toggle  
         const styleSheet = document.createElement("style");  
         styleSheet.innerText = `  
             .scroll-visible {  
                 opacity: 1 !important;  
                 transform: translateY(0) !important;  
             }  
         `;  
         document.head.appendChild(styleSheet);  

         const scrollObserver = new IntersectionObserver((entries) => {  
             entries.forEach(entry => {  
                 if (entry.isIntersecting) {  
                     entry.target.classList.add('scroll-visible');  
                     scrollObserver.unobserve(entry.target);  
                 }  
             });  
         }, observerOptions);  

         document.querySelectorAll('.service-card, .hero-title').forEach(el => {  
             scrollObserver.observe(el);  
         });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ServiceManager();
});
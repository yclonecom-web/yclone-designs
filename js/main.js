// Main Website Functionality
class PortfolioWebsite {
    constructor() {
        this.init();
    }

    async init() {
        // We load featured projects if they exist, otherwise we let the static HTML handle it
        this.loadFeaturedProjects();
        this.setupSmoothScroll();
        this.setupHoverEffects();
        this.initAnimations();
    }

    // Static Data for Featured Projects (Fallback since we don't have the JSON file in this view)
    getStaticProjects() {
        return [
            {
                title: "Brand Identity",
                category: "Branding",
                image: "https://via.placeholder.com/600x450/e0e0e0/888888?text=Brand+Identity" // Placeholder
            },
            {
                title: "Social Media Pack",
                category: "Social Media",
                image: "https://via.placeholder.com/600x450/e0e0e0/888888?text=Social+Media" // Placeholder
            },
            {
                title: "App Interface",
                category: "UI Design",
                image: "https://via.placeholder.com/600x450/e0e0e0/888888?text=App+UI" // Placeholder
            }
        ];
    }

    async loadFeaturedProjects() {
        const container = document.getElementById('featured-projects');
        if (!container) return;

        // Try to fetch, fall back to static data if file missing
        let projects = [];
        try {
            const response = await fetch('data/content.json');
            if(response.ok) {
                const data = await response.json();
                projects = data.portfolio.filter(p => p.featured).slice(0, 3);
            } else {
                throw new Error("File not found");
            }
        } catch (error) {
            // Use static fallback for preview purposes
            projects = this.getStaticProjects();
        }

        container.innerHTML = ''; // Clear loading state
        
        projects.forEach((project, index) => {
            const projectElement = document.createElement('div');
            projectElement.className = 'portfolio-item fade-in-up';
            projectElement.style.animationDelay = `${index * 0.1}s`;
            projectElement.innerHTML = `
                <img src="${project.image}" alt="${project.title}" loading="lazy">
                <div class="portfolio-overlay">
                    <h3>${project.title}</h3>
                    <p>${project.category}</p>
                </div>
            `;
            container.appendChild(projectElement);
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || !href.startsWith('#')) return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    setupHoverEffects() {
        // Minimal hover lift for cards
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.service-card, .process-step, .stat-item').forEach(el => {
            el.style.opacity = '0'; // Hide initially
            observer.observe(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new PortfolioWebsite();
});
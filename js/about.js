document.addEventListener('DOMContentLoaded', () => {
            // Hamburger Menu
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger) {
                hamburger.addEventListener('click', () => {
                    hamburger.classList.toggle('active');
                    navMenu.classList.toggle('active');
                });
            }

            // Close menu when clicking a link
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });

            // Animate Skills on Scroll
            const skillsSection = document.querySelector('.skills-section');
            const progressBars = document.querySelectorAll('.skill-level');
            
            if (skillsSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            progressBars.forEach(bar => {
                                const width = bar.style.width;
                                bar.style.width = '0'; // Reset
                                setTimeout(() => {
                                    bar.style.width = width; // Animate to value
                                }, 100);
                            });
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.2 });
                
                observer.observe(skillsSection);
            }
        });
    
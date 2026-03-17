// Main JavaScript for Interactions

document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth scrolling for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple Intersection Observer for scroll animations (fade in)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const flexObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animations slightly based on their sequence
                setTimeout(() => {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }, 100 * (index % 3)); // Add small delay (0, 100, or 200ms)
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Grab elements to animate
    const animElements = document.querySelectorAll('.section-title, .about-text, .skill-category, .project-card, .credentials-grid > div, .footer-title, .footer-links');
    
    animElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        flexObserver.observe(el);
    });

    console.log("Core functionality loaded. Background rendering will be handled separately.");
});

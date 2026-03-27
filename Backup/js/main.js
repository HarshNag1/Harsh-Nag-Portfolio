// Main Interaction, Scroll Logic & Custom Cursor
// Awwwards-Tier — Portfolio 2026

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 0. LENIS SMOOTH SCROLL — Industry-standard momentum scrolling
    // ============================================================
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,         // How long momentum lasts (higher = smoother)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
            smoothWheel: true,
            wheelMultiplier: 0.9,  // Slightly reduced scroll speed for elegance
            touchMultiplier: 1.5,
        });

        // Sync Lenis with GSAP ticker for ScrollTrigger compatibility
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0); // Prevent double-smoothing jitter
        } else {
            // Fallback RAF loop if GSAP isn't loaded yet
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        }
    }


    // ============================================================
    // 0. PAGE LOADER DISMISS
    // ============================================================
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('done');
                setTimeout(() => loader.remove(), 800);
            }, 600);
        });
    }

    // ============================================================
    // 0b. SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            progressBar.style.width = (scrolled / scrollable * 100) + '%';
        }, { passive: true });
    }

    // ============================================================
    // 0c. SECTION & CARD REVEAL OBSERVERS
    // ============================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.section-reveal, .text-reveal, .card-stagger, .section-divider')
        .forEach(el => revealObserver.observe(el));


    // ============================================================
    // 0d. ANIMATED NUMBER COUNTERS
    // ============================================================
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1600;
        const step = 16;
        const steps = Math.ceil(duration / step);
        let current = 0;
        const increment = target / steps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number, .caf-stat-num.counter')
        .forEach(el => counterObserver.observe(el));


    // ============================================================
    // 1. CUSTOM MAGNETIC CURSOR
    // ============================================================
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

    if (dot && ring && !isTouchDevice()) {
        let ringX = 0, ringY = 0;
        let mouseX = 0, mouseY = 0;
        const SMOOTHING = 0.12; // Lower = more lag

        // Update dot position immediately
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        // Animate ring with smooth lag via rAF
        function animateRing() {
            ringX += (mouseX - ringX) * SMOOTHING;
            ringY += (mouseY - ringY) * SMOOTHING;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state on interactive elements
        const interactables = document.querySelectorAll('a, button, [role="button"], input, textarea, .tech-card, .venture-card, .project-card, .cert-card, .founder-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        // Hide cursor if it leaves the window
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    }

    // ============================================================
    // 2. INTERSECTION OBSERVER — Bidirectional Fade-Up Animations
    //    Toggles .in-view on BOTH scroll-down enter AND scroll-up exit
    // ============================================================
    const fadeObserverOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element entered viewport — animate in
                entry.target.classList.add('in-view');
            } else {
                // Element left viewport — reset so it re-animates next time
                entry.target.classList.remove('in-view');
            }
        });
        // NOTE: No unobserve — keeps watching for re-entry
    }, fadeObserverOptions);

    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


    // ============================================================
    // 3. SCROLL SPY — Active Nav Links
    // ============================================================
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-item");

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navItems.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: "-10% 0px -40% 0px"
    });

    sections.forEach(sec => scrollSpyObserver.observe(sec));


    // ============================================================
    // 4. SMOOTH SCROLL for anchor links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                if (typeof lenis !== 'undefined' && lenis) {
                    // Offset for mobile top navbar (110px) to prevent covering headers
                    const offsetAmount = window.innerWidth <= 900 ? -110 : 0;
                    lenis.scrollTo(target, { offset: offsetAmount, duration: 1.2 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });


    // ============================================================
    // 5. GSAP Horizontal Scroll — Journey Section
    // ============================================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);


        // ── Journey Section ───────────────────────────────────────
        const journeyWrapper = document.querySelector(".journey-wrapper");
        const journeyContainer = document.querySelector(".journey-container");

        if (journeyWrapper && journeyContainer && window.innerWidth > 900) {
            const getScrollAmount = () => -(journeyContainer.scrollWidth - window.innerWidth);

            gsap.to(journeyContainer, {
                x: getScrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: journeyWrapper,
                    pin: true,
                    start: "top top",
                    end: () => `+=${journeyContainer.scrollWidth}`,
                    scrub: 1.2,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        journeyWrapper.style.setProperty('--journey-progress', self.progress);
                        const sparkle = document.getElementById('journeySparkle');
                        if (sparkle) {
                            sparkle.style.left = (self.progress * 100) + 'vw';
                        }
                    }
                }
            });
        }
    }

    console.log("✦ Portfolio JS Loaded — Awwwards Tier 2026");
});

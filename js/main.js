// Main Interaction, Scroll Logic & Custom Cursor
// Awwwards-Tier — Portfolio 2026

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // PRELOADER ENGINE & STARTUP SEQUENCE
    // ============================================================
    const loader = document.getElementById('site-loader');
    const loaderFill = document.getElementById('loader-fill');
    const loaderText = document.getElementById('loader-text');

    if (loader) {
        document.body.style.overflow = 'hidden';

        // 1. Gather heavy media (Images + Videos)
        const videos = Array.from(document.querySelectorAll('video'));
        const images = Array.from(document.querySelectorAll('img'));
        const mediaPromises = [];
        videos.forEach(vid => {
            // Absolute guarantee for looping, bypassing iOS/Safari HTML tag stripping and power-saving pauses
            vid.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play().catch(() => { });
            });

            if (vid.readyState >= 3) {
                mediaPromises.push(Promise.resolve());
            } else {
                mediaPromises.push(new Promise(resolve => {
                    vid.addEventListener('canplaythrough', resolve, { once: true });
                    vid.addEventListener('error', resolve, { once: true });
                }));
            }
        });

        images.forEach(img => {
            if (img.complete) {
                mediaPromises.push(Promise.resolve());
            } else {
                mediaPromises.push(new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                }));
            }
        });

        // 2. Fallback timeout to guarantee site loads even on bad connections (max 6.5s)
        const networkTimeout = new Promise(resolve => setTimeout(resolve, 6500));

        // 3. Fake visually pleasing incremental progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += (Math.random() * 4);
            if (progress > 94) progress = 94; // Hold at 94% until perfectly loaded

            if (loaderFill) loaderFill.style.width = progress + '%';
            if (loaderText) loaderText.innerText = 'INITIALIZING... ' + Math.floor(progress) + '%';
        }, 120);

        // 4. Resolve when all media is capable of smooth playback OR the timeout hits
        Promise.race([
            Promise.all(mediaPromises),
            networkTimeout
        ]).then(() => {
            clearInterval(progressInterval);

            if (loaderFill) loaderFill.style.width = '100%';
            if (loaderText) loaderText.innerText = 'WELCOME HARSH  100%';

            // Dramatic pause before revealing the site
            setTimeout(() => {
                loader.classList.add('hide');
                document.body.style.overflow = ''; // Restore native scrolling for Lenis

                // CRITICAL: Refresh ScrollTrigger once the page is visible and layout is stable
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                    // Secondary refresh for any delayed layout shifts (images, etc)
                    setTimeout(() => ScrollTrigger.refresh(), 1500);
                }

                setTimeout(() => loader.remove(), 850);
            }, 600);
        });
    }

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

                const media = entry.target.querySelectorAll('video');
                media.forEach(v => v.play().catch(() => { }));
            }
            // Removed classList.remove('in-view') to prevent accidental disappearances
        });
        // NOTE: No unobserve — keeps watching for re-entry (if needed)
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
                    pinType: "fixed",
                    anticipatePin: 1,
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

    // ============================================================
    // PATENTS MODAL — Open / Close
    // ============================================================
    const patentsModal = document.getElementById('patentsModal');
    const openPatentsBtn = document.getElementById('openPatentsModal');
    const closePatentsBtn = document.getElementById('closePatentsModal');

    function openPatents() {
        if (!patentsModal) return;
        patentsModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        if (typeof lenis !== 'undefined' && lenis) lenis.stop(); // Stop Lenis Momentum Scroll
    }
    function closePatents() {
        if (!patentsModal) return;
        patentsModal.classList.remove('open');
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined' && lenis) lenis.start(); // Restore Lenis Momentum Scroll
    }

    if (openPatentsBtn) openPatentsBtn.addEventListener('click', openPatents);
    if (closePatentsBtn) closePatentsBtn.addEventListener('click', closePatents);

    // Close when clicking backdrop (outside the box)
    if (patentsModal) {
        patentsModal.addEventListener('click', (e) => {
            if (e.target === patentsModal) closePatents();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePatents();
    });

    console.log("✦ Portfolio JS Loaded — Awwwards Tier 2026");

    // ============================================================
    // UNITY MODAL - Open / Close
    // ============================================================
    const unityModal = document.getElementById('unityModal');
    const openUnityBtns = document.querySelectorAll('.openUnityModalBtn');
    const closeUnityBtn = document.getElementById('closeUnityModal');

    function openUnity(e) {
        if (e) e.preventDefault();
        if (!unityModal) return;
        unityModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined' && lenis) lenis.stop();
    }
    function closeUnity() {
        if (!unityModal) return;
        unityModal.classList.remove('open');
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined' && lenis) lenis.start();
    }

    openUnityBtns.forEach(btn => btn.addEventListener('click', openUnity));
    if (closeUnityBtn) closeUnityBtn.addEventListener('click', closeUnity);

    if (unityModal) {
        unityModal.addEventListener('click', (e) => {
            if (e.target === unityModal) closeUnity();
        });
    }

});

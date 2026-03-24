// ============================================================
// BACKGROUND CANVAS ANIMATION — Floating Dot Grid
// Subtle, professional, premium feel
// ============================================================

(function initBackground() {
    // 1. MIDDLE LAYER: Soft Gradient Glow
    const glowLayer = document.createElement('div');
    glowLayer.id = 'bg-glow';
    glowLayer.style.cssText = `
        position: fixed;
        top: -20%; left: -20%;
        width: 140%; height: 140%;
        z-index: 0;
        pointer-events: none;
        background: radial-gradient(circle at 50% 50%, rgba(255, 94, 0, 0.045) 0%, rgba(255, 184, 0, 0.015) 35%, transparent 60%);
        opacity: 0.8;
        will-change: transform;
    `;
    document.body.insertBefore(glowLayer, document.body.firstChild);

    // 2. BACK LAYER: Neural Network Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: -10%; left: -10%;
        width: 120%; height: 120%;
        z-index: -1;
        pointer-events: none;
        opacity: 0.4;
        will-change: transform;
    `;
    document.body.insertBefore(canvas, glowLayer);

    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];
    let mouse = { x: null, y: null };
    const PARTICLE_COUNT = 50;   // Reduced from 80 for smooth 60fps
    const MAX_DIST = 110;         // Reduced connection threshold

    // Colour palette — subtle brand accent
    const COLOURS = [
        'rgba(255, 94, 0,',     // orange
        'rgba(255, 184, 0,',    // yellow
        'rgba(255, 255, 255,',  // white
    ];

    function resize() {
        // Expand canvas rendering dimensions to prevent edge clipping during parallax
        W = canvas.width  = window.innerWidth * 1.2;
        H = canvas.height = window.innerHeight * 1.2;
    }

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x  = Math.random() * W;
            this.y  = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.r  = Math.random() * 1.5 + 0.5;
            this.col = COLOURS[Math.floor(Math.random() * COLOURS.length)];
            this.alpha = Math.random() * 0.3 + 0.05;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            // Wrap edges
            if (this.x < 0) this.x = W;
            if (this.x > W) this.x = 0;
            if (this.y < 0) this.y = H;
            if (this.y > H) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.col + this.alpha + ')';
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    let frame = 0;
    function drawConnections() {
        frame++;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                // Early exit before expensive sqrt
                if (Math.abs(dx) > MAX_DIST || Math.abs(dy) > MAX_DIST) continue;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 94, 0, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
            // Mouse connections — every other frame to halve cost
            if (frame % 2 === 0 && mouse.x !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                if (Math.abs(dx) > MAX_DIST * 1.5 || Math.abs(dy) > MAX_DIST * 1.5) continue;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST * 1.5) {
                    const alpha = (1 - dist / (MAX_DIST * 1.5)) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(255, 184, 0, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    // Mouse tracking for interactive lines
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => { init(); });

    // PARALLAX LAYER SCROLL TRACKER
    // Offloads movement from the main thread using native CSS transforms on fixed layers
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Back Layer moves very slow (-0.1y)
        canvas.style.transform = `translateY(${scrolled * -0.1}px)`;
        
        // Middle Layer (Glow) moves slightly faster (-0.25y)
        glowLayer.style.transform = `translateY(${scrolled * -0.25}px)`;
    }, { passive: true });

    init();
    animate();
})();

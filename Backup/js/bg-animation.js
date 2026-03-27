// ============================================================
// BACKGROUND CANVAS ANIMATION — Floating Dot Grid
// Subtle, professional, premium feel
// ============================================================

(function initBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 0;
        pointer-events: none;
        opacity: 0.5;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

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
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
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

    init();
    animate();
})();

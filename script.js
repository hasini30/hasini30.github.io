document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            });
        });
    }


    // Standard Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Initialize Horse Gallop Lottie Animation
    const horseContainer = document.getElementById('horse-lottie-container');
    let horseAnim = null;
    if (horseContainer && typeof lottie !== 'undefined' && window.HORSE_LOTTIE_DATA) {
        horseAnim = lottie.loadAnimation({
            container: horseContainer,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            animationData: window.HORSE_LOTTIE_DATA,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid meet'
            }
        });
        horseAnim.setSpeed(1.8);
    }

    // Dedicated About Section Horse & Follow Animation Trigger
    const aboutSection = document.querySelector('.reveal-custom');
    if (aboutSection) {
        const aboutObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (horseAnim) {
                        horseAnim.play();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -40px 0px"
        });
        aboutObserver.observe(aboutSection);
    }

    // Smooth Scrolling for anchor links (fallback for browsers not supporting CSS scroll-behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});


// --- Gravity Garden Background Animation ---
class GravityGarden {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.seeds = [];
        this.trees = [];
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('click', (e) => {
            // Ignore clicks on buttons/links so we don't interfere, wait actually pointer-events:none makes it so 
            // clicks fall through canvas to document. We still want seeds when clicking empty space.
            this.seeds.push(new Seed(e.clientX, e.clientY, this.canvas.height));
            
            // Limit trees to prevent lag
            if (this.trees.length + this.seeds.length > 25) {
                if (this.trees.length > 0) {
                    this.trees.shift();
                }
            }
        });
    }
    
    init() {
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw trees
        for (let tree of this.trees) {
            tree.update();
            tree.draw(this.ctx);
        }
        
        // Update and draw seeds
        for (let i = this.seeds.length - 1; i >= 0; i--) {
            let seed = this.seeds[i];
            seed.update();
            seed.draw(this.ctx);
            if (seed.dead) {
                this.trees.push(new Tree(seed.x, seed.y));
                this.seeds.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Seed {
    constructor(x, y, groundY) {
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.gravity = 0.6;
        this.groundY = groundY;
        this.dead = false;
        this.radius = 4;
    }
    update() {
        this.vy += this.gravity;
        this.y += this.vy;
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.dead = true;
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#88c999';
        ctx.fill();
    }
}

class Tree {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.branches = [];
        this.leaves = [];
        // Root branch
        this.branches.push(new Branch(x, y, -Math.PI / 2, 0, this));
    }
    update() {
        for (let b of this.branches) b.update();
        for (let l of this.leaves) l.update();
    }
    draw(ctx) {
        for (let b of this.branches) b.draw(ctx);
        for (let l of this.leaves) l.draw(ctx);
    }
}

class Branch {
    constructor(startX, startY, angle, depth, tree) {
        this.startX = startX;
        this.startY = startY;
        this.endX = startX;
        this.endY = startY;
        this.angle = angle;
        this.depth = depth;
        this.tree = tree;
        
        this.maxDepth = 4 + Math.floor(Math.random() * 3); // 4 to 6
        this.maxLength = (Math.random() * 40 + 30) * Math.pow(0.85, depth);
        this.currentLength = 0;
        this.speed = 2.5 + Math.random();
        this.thickness = Math.max(1, (this.maxDepth - depth) * 1.5);
        
        this.grown = false;
    }
    update() {
        if (this.grown) return;
        
        this.currentLength += this.speed;
        if (this.currentLength >= this.maxLength) {
            this.currentLength = this.maxLength;
            this.grown = true;
            this.spawnChildren();
        }
        
        this.endX = this.startX + Math.cos(this.angle) * this.currentLength;
        this.endY = this.startY + Math.sin(this.angle) * this.currentLength;
    }
    spawnChildren() {
        if (this.depth < this.maxDepth) {
            // 1 to 3 branches
            let numBranches = Math.random() < 0.4 ? 1 : (Math.random() < 0.85 ? 2 : 3);
            for (let i = 0; i < numBranches; i++) {
                // Keep branches generally pointing upwards
                let newAngle = this.angle + (Math.random() - 0.5) * 1.2;
                // Prevent going fully downwards
                if (newAngle > -0.2) newAngle = -0.2;
                if (newAngle < -Math.PI + 0.2) newAngle = -Math.PI + 0.2;
                
                this.tree.branches.push(new Branch(this.endX, this.endY, newAngle, this.depth + 1, this.tree));
            }
        } else {
            this.tree.leaves.push(new Leaf(this.endX, this.endY));
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.strokeStyle = '#2d5a45';
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

class Leaf {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxRadius = Math.random() * 5 + 4;
        this.radius = 0;
        this.speed = 0.3 + Math.random() * 0.2;
        
        const colors = [
            'rgba(152, 222, 179, 0.95)', 
            'rgba(115, 186, 145, 0.95)',
            'rgba(196, 240, 214, 0.95)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        if (this.radius < this.maxRadius) {
            this.radius += this.speed;
        }
    }
    draw(ctx) {
        if (this.radius > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Highlight for orb effect
            ctx.beginPath();
            ctx.arc(this.x - this.radius*0.25, this.y - this.radius*0.25, this.radius*0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            
            // Subtle dark rim
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(45, 90, 69, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GravityGarden('gravity-garden');
});

/* ==========================================
   THREE.JS SETUP & ANIMATION
   ========================================== */

let scene, camera, renderer, particles = [];
const canvas = document.getElementById('threejs-canvas');

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera setup
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1);
    pointLight1.position.set(20, 20, 20);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.8);
    pointLight2.position.set(-20, -10, 20);
    scene.add(pointLight2);

    // Create particles
    createParticles();

    // Create animated geometries
    createAnimatedObjects();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;

        velocities[i] = (Math.random() - 0.5) * 0.5;
        velocities[i + 1] = (Math.random() - 0.5) * 0.5;
        velocities[i + 2] = (Math.random() - 0.5) * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    particles.push({
        mesh: particleSystem,
        velocities: velocities,
        positions: positions
    });
}

function createAnimatedObjects() {
    // Create rotating torus
    const torusGeometry = new THREE.TorusGeometry(15, 5, 16, 100);
    const torus1Material = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        emissive: 0x4f46e5,
        shininess: 100,
        wireframe: false
    });
    const torus1 = new THREE.Mesh(torusGeometry, torus1Material);
    torus1.position.set(-30, 0, 0);
    torus1.rotation.x = Math.PI / 4;
    scene.add(torus1);

    // Create rotating icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(12, 4);
    const icosahedronMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        shininess: 100
    });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(30, 0, -10);
    scene.add(icosahedron);

    // Create rotating octahedron
    const octahedronGeometry = new THREE.OctahedronGeometry(10, 3);
    const octahedronMaterial = new THREE.MeshPhongMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        shininess: 100
    });
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.set(0, 20, -5);
    scene.add(octahedron);

    // Store for animation
    scene.userData.torus1 = torus1;
    scene.userData.icosahedron = icosahedron;
    scene.userData.octahedron = octahedron;
}

function animate() {
    requestAnimationFrame(animate);

    // Update particles
    particles.forEach(particleGroup => {
        const positions = particleGroup.positions;
        const velocities = particleGroup.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Bounce particles
            if (Math.abs(positions[i]) > 100) velocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 100) velocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 100) velocities[i + 2] *= -1;
        }

        particleGroup.mesh.geometry.attributes.position.needsUpdate = true;
    });

    // Rotate geometries
    if (scene.userData.torus1) {
        scene.userData.torus1.rotation.x += 0.005;
        scene.userData.torus1.rotation.y += 0.008;
    }

    if (scene.userData.icosahedron) {
        scene.userData.icosahedron.rotation.y += 0.004;
        scene.userData.icosahedron.rotation.z += 0.006;
    }

    if (scene.userData.octahedron) {
        scene.userData.octahedron.rotation.x += 0.006;
        scene.userData.octahedron.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Initialize Three.js when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}

/* ==========================================
   SCROLL ANIMATIONS & INTERACTIONS
   ========================================== */

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in-card, .skill-category, .resource-card, .career-path-card, .timeline-item').forEach(el => {
    observer.observe(el);
});

/* ==========================================
   SMOOTH SCROLL & INTERACTIONS
   ========================================== */

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Button interactions
const buttons = document.querySelectorAll('.cta-button, .cta-button-large');
buttons.forEach(button => {
    button.addEventListener('click', function () {
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);

        // Show alert or navigate
        alert('Welcome to your GenAI journey! Start learning today.');
    });
});

/* ==========================================
   SKILL PROGRESS ANIMATION
   ========================================== */

const progressObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target.querySelector('.skill-progress');
            if (progressBar && !progressBar.classList.contains('animated')) {
                progressBar.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-item').forEach(item => {
    progressObserver.observe(item);
});

/* ==========================================
   DYNAMIC HEADER EFFECTS
   ========================================== */

let scrollTimeout;
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', function () {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navbar.style.transform = 'translateY(0)';
    }, 2000);
});

navbar.style.transition = 'transform 0.3s ease';

/* ==========================================
   KEYBOARD SHORTCUTS
   ========================================== */

document.addEventListener('keydown', function (e) {
    // Scroll to top with Home key
    if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Scroll to bottom with End key
    if (e.key === 'End') {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }

    // Toggle sections with number keys
    if (e.key === '1') {
        document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === '2') {
        document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === '3') {
        document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === '4') {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
});

/* ==========================================
   PERFORMANCE OPTIMIZATIONS
   ========================================== */

// Throttle scroll events
let ticking = false;
window.addEventListener('scroll', function () {
    if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});

function updateOnScroll() {
    // Perform any scroll-based calculations here
    ticking = false;
}

// Lazy load images (if any)
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ==========================================
   ANALYTICS & TRACKING (Optional)
   ========================================== */

function trackEvent(eventName, eventData = {}) {
    console.log(`Event: ${eventName}`, eventData);
    // Add your analytics code here (Google Analytics, Mixpanel, etc.)
}

// Track page load
window.addEventListener('load', function () {
    trackEvent('page_loaded', { timestamp: new Date() });
});

// Track user interactions
document.addEventListener('click', function (e) {
    if (e.target.matches('.cta-button, .cta-button-large')) {
        trackEvent('cta_clicked', { buttonText: e.target.textContent });
    }

    if (e.target.matches('a')) {
        trackEvent('link_clicked', { href: e.target.href });
    }
});

/* ==========================================
   ACCESSIBILITY ENHANCEMENTS
   ========================================== */

// Add focus states for keyboard navigation
document.querySelectorAll('button, a').forEach(element => {
    element.addEventListener('focus', function () {
        this.style.outline = '2px solid #3b82f6';
        this.style.outlineOffset = '2px';
    });

    element.addEventListener('blur', function () {
        this.style.outline = 'none';
    });
});

// Add skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#roadmap';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #6366f1;
    color: white;
    padding: 8px;
    z-index: 100;
    text-decoration: none;
`;

skipLink.addEventListener('focus', function () {
    this.style.top = '0';
});

skipLink.addEventListener('blur', function () {
    this.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

// Get viewport dimensions
function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ==========================================
   FORM INTERACTIONS (Future enhancement)
   ========================================== */

// Add form validation if forms are added
function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#6366f1';
        }
    });

    return isValid;
}

console.log('GenAI Roadmap website loaded successfully! 🚀');

// ═══════════ VETERINARIO A DOMICILIO — Desktop FX (Three.js + GSAP) ═══════════
// ES Module — loaded conditionally on desktop (>768px) via: import('./fx.js').then(m => m.init())

import * as THREE from 'three';

// ═══════════ THREE.JS PARTICLE HERO ═══════════
function initParticleHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  // Clinical blue monochromatic palette
  const palette = [
    new THREE.Color(0x1A56DB), // Primary blue
    new THREE.Color(0x3B82F6), // Primary light
    new THREE.Color(0x0EA5E9), // Accent cyan-blue
    new THREE.Color(0x1E40AF), // Deep blue
    new THREE.Color(0x60A5FA), // Soft blue
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;

    velocities[i3]     = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

    sizes[i] = Math.random() * 1.5 + 0.3;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Archetype color update — called from script.js via window.updateParticleColors(hex)
  window.updateParticleColors = function(hexColor) {
    const base   = new THREE.Color(hexColor);
    const light  = base.clone().lerp(new THREE.Color(0xffffff), 0.3);
    const accent = base.clone().lerp(new THREE.Color(0xffffff), 0.5);
    const dark   = base.clone().lerp(new THREE.Color(0x000000), 0.2);
    const soft   = base.clone().lerp(new THREE.Color(0xffffff), 0.15);
    const newPalette = [base, light, accent, dark, soft];

    const clrs = geometry.attributes.color.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const c = newPalette[Math.floor(Math.random() * newPalette.length)];
      clrs[i3]     += (c.r - clrs[i3])     * 0.3;
      clrs[i3 + 1] += (c.g - clrs[i3 + 1]) * 0.3;
      clrs[i3 + 2] += (c.b - clrs[i3 + 2]) * 0.3;
    }
    geometry.attributes.color.needsUpdate = true;
  };

  // ShaderMaterial — max alpha 22%, NormalBlending
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha *= 0.22;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    vertexColors: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Mouse interaction — throttled
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let lastMouseMove = 0;
  function onMouseMove(e) {
    const now = performance.now();
    if (now - lastMouseMove < 16) return; // ~60fps throttle
    lastMouseMove = now;
    mouse.targetX =  (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }
  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // Scroll fade — throttled
  let scrollY = 0;
  let lastScrollTime = 0;
  function onScroll() {
    const now = performance.now();
    if (now - lastScrollTime < 16) return;
    lastScrollTime = now;
    scrollY = window.scrollY;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Animation loop
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Update particle positions + mouse repulsion
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      // Gentle repulsion from cursor (mapped to world coords)
      const dx = pos[i3]     - mouse.x * 5;
      const dy = pos[i3 + 1] - mouse.y * 3.5;
      const distSq = dx * dx + dy * dy;
      if (distSq < 4) {
        const force = 0.002 / (distSq + 0.1);
        pos[i3]     += dx * force;
        pos[i3 + 1] += dy * force;
      }

      // Wrap boundaries
      if (pos[i3]     >  10) pos[i3]     = -10;
      if (pos[i3]     < -10) pos[i3]     =  10;
      if (pos[i3 + 1] >   7) pos[i3 + 1] = -7;
      if (pos[i3 + 1] <  -7) pos[i3 + 1] =  7;
    }
    geometry.attributes.position.needsUpdate = true;

    // Camera follows mouse gently
    camera.position.x = mouse.x * 0.5;
    camera.position.y = mouse.y * 0.3;
    camera.lookAt(scene.position);

    // Scroll fade — particles dim past hero
    const heroHeight = window.innerHeight;
    const opacity = Math.max(0, 1 - scrollY / heroHeight);
    canvas.style.opacity = opacity;

    // Subtle rotation
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animId);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  });
}


// ═══════════ GSAP SCROLL ANIMATIONS ═══════════
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ─── Scroll progress bar ───
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    }
  });

  // ─── Hero text entrance ───
  const heroContent = document.querySelector('.hero-inner');
  if (heroContent) {
    gsap.from(heroContent.querySelectorAll('h1, .hero-badge, .hero-desc, .hero-ctas, .hero-social-proof'), {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.3,
    });
  }

  // ─── Hero visual (vet image) ───
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    gsap.from(heroVisual, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.6,
    });
  }

  // ─── Hero floating badges parallax ───
  gsap.utils.toArray('.hero-float').forEach((el, i) => {
    gsap.to(el, {
      y: -50 - i * 20,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });

  // ─── Section headers ───
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      }
    });
  });

  // ─── Trust bar numbers — trigger counter animation ───
  gsap.utils.toArray('.trust-item').forEach((el, i) => {
    el.style.willChange = 'transform, opacity';
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.trust-bar',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const numEl = el.querySelector('.trust-number');
          if (numEl) animateCounter(numEl);
        }
      }
    });
  });

  // ─── Product cards — y + opacity stagger only (NEVER x) ───
  ScrollTrigger.batch('.product-card', {
    onEnter: (elements) => {
      gsap.from(elements, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      });
    },
    start: 'top 90%',
    once: true,
  });

  // ─── Why-us cards — y + opacity only ───
  gsap.utils.toArray('.why-card').forEach((el, i) => {
    el.style.willChange = 'transform, opacity';
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      }
    });
  });

  // ─── Step cards — y + opacity only ───
  gsap.utils.toArray('.step-card').forEach((el, i) => {
    el.style.willChange = 'transform, opacity';
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      delay: i * 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.steps-grid',
        start: 'top 80%',
        once: true,
      }
    });
  });

  // ─── Testimonial cards — y + opacity only ───
  gsap.utils.toArray('.testimonial-card').forEach((el, i) => {
    el.style.willChange = 'transform, opacity';
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.testimonials-grid',
        start: 'top 85%',
        once: true,
      }
    });
  });

  // ─── Urgency CTA section ───
  const urgencyCta = document.querySelector('.urgency-cta');
  if (urgencyCta) {
    gsap.from('.urgency-cta h2', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.urgency-cta',
        start: 'top 80%',
      }
    });
    gsap.from('.countdown', {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      delay: 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.urgency-cta',
        start: 'top 80%',
      }
    });
  }

  // ─── FAQ items ───
  gsap.utils.toArray('.faq-item').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: i * 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.faq-list',
        start: 'top 85%',
        once: true,
      }
    });
  });

  // ─── Magnetic buttons — mouse-follow with elastic.out ───
  document.querySelectorAll('.btn-primary, .btn-urgency').forEach(btn => {
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}


// ─── Counter animation utility ───
function animateCounter(el) {
  const text = el.textContent.trim();
  const match = text.match(/^([+]?)(\d[\d.,]*)(.*)$/);
  if (!match) return;

  const prefix  = match[1];
  const raw     = match[2].replace(/\./g, '').replace(',', '.');
  const target  = parseFloat(raw);
  const suffix  = match[3];
  const hasComma = match[2].includes(',');
  const hasDot   = match[2].includes('.');

  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(target * eased);

    let formatted = current.toString();
    if (hasDot && !hasComma) {
      formatted = current.toLocaleString('es-CO');
    }

    el.textContent = prefix + formatted + suffix;

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


// ═══════════ EXPORTED INIT ═══════════
export function init() {
  initParticleHero();

  if (document.readyState === 'complete') {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }
}

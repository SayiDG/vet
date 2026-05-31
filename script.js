/* ============================================
   VETERINARIO A DOMICILIO — script.js
   Core Landing Page Logic
   ============================================ */

const WA_NUMBER = '573127983674';
const CITIES = ['Cali', 'Jamundí', 'Palmira'];
const WA_BASE = `https://wa.me/${WA_NUMBER}?text=`;

const formatCOP = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

let allProducts = [];

/* ──────────────────────────────────────────────
   ARCHETYPES
   ────────────────────────────────────────────── */

const ARCHETYPES = {
  gato_primerizo: {
    emoji: '🐱',
    color: '#8B5CF6',
    colorRGB: '139, 92, 246',
    headline: '¿Acabas de adoptar un gato?',
    headlineSpan: 'Nosotros lo cuidamos desde el día 1',
    desc: 'Tu nuevo compañero necesita vacunación, desparasitación y un chequeo completo. Nos encargamos de todo en tu casa, sin estrés para él.',
    heroImage: 'assets/img/service-gatos.png',  // gato primerizo
    planTag: '🐱 Plan Gato Primerizo',
    planTitle: 'Todo Lo Que Tu Gato Necesita',
    planSubtitle: 'El pack completo para empezar con el pie derecho.',
    products: ['Consulta General a Domicilio', 'Plan Vacunación Gatos', 'Desparasitación'],
    productRoles: ['⭐ Examen completo', '💉 Protección total', '🛡️ Prevención'],
    testimonial: {
      quote: 'Adopté a Michi hace 2 meses y la doctora vino a casa para todo. Él ni se estresó, fue increíble.',
      name: 'Laura M.',
      loc: '📍 Cali · Cliente desde Ene 2026',
      initials: 'LM',
    },
    waMessage:
      'Hola! Acabo de adoptar un gato y necesito el Plan Gato Primerizo (consulta + vacunas + desparasitación). ¿Me pueden ayudar?',
    filterCategory: 'vacunacion',
  },
  perro_activo: {
    emoji: '🐕',
    color: '#F59E0B',
    colorRGB: '245, 158, 11',
    headline: '¿Tu perro necesita atención?',
    headlineSpan: 'Vamos a tu casa para cuidarlo',
    desc: 'Vacunación al día, desparasitación y control preventivo. Todo en la comodidad de tu hogar para que tu perro esté siempre saludable.',
    heroImage: 'assets/img/service-perros.png',  // perro activo
    planTag: '🐕 Plan Perro Activo',
    planTitle: 'Mantén a Tu Perro Saludable',
    planSubtitle: 'Protección completa para tu mejor amigo.',
    products: ['Consulta General a Domicilio', 'Plan Vacunación Perros', 'Control Preventivo'],
    productRoles: ['⭐ Chequeo completo', '💉 Vacunas al día', '🩺 Salud preventiva'],
    testimonial: {
      quote: 'Rocky le tiene pánico al veterinario. Desde que vienen a casa, todo es más fácil. Súper puntuales.',
      name: 'Carlos A.',
      loc: '📍 Jamundí · Cliente desde Mar 2026',
      initials: 'CA',
    },
    waMessage:
      'Hola! Tengo un perro y me interesa el Plan Perro Activo (consulta + vacunación + control). ¿Cuándo pueden venir?',
    filterCategory: 'vacunacion',
  },
  preventivo: {
    emoji: '🛡️',
    color: '#10B981',
    colorRGB: '16, 185, 129',
    headline: '¿Quieres prevenir problemas?',
    headlineSpan: 'La prevención es la mejor medicina',
    desc: 'Un chequeo anual completo con exámenes de laboratorio. Detectamos cualquier problema a tiempo, en tu casa.',
    heroImage: 'assets/img/service-consulta.png',  // preventivo
    planTag: '🛡️ Plan Preventivo',
    planTitle: 'Chequeo Anual Completo',
    planSubtitle: 'Tranquilidad para ti, salud para tu mascota.',
    products: ['Control Preventivo', 'Desparasitación', 'Toma de Muestras'],
    productRoles: ['🩺 Examen completo', '🛡️ Desparasitación', '🔬 Laboratorio'],
    testimonial: {
      quote: 'Llevo 2 años con el plan preventivo para Luna. Le detectaron un problema renal a tiempo gracias al chequeo.',
      name: 'Andrea P.',
      loc: '📍 Palmira · Cliente desde 2024',
      initials: 'AP',
    },
    waMessage:
      'Hola! Quiero agendar un Plan Preventivo completo (control + desparasitación + laboratorio) para mi mascota.',
    filterCategory: 'preventivo',
  },
  senior: {
    emoji: '🤍',
    color: '#EC4899',
    colorRGB: '236, 72, 153',
    headline: '¿Tu mascota ya es adulta mayor?',
    headlineSpan: 'Merece cuidados especiales en casa',
    desc: 'Las mascotas senior necesitan atención más frecuente y delicada. Evítale el estrés del traslado — vamos nosotros.',
    heroImage: 'assets/img/service-laboratorio.png',  // senior
    planTag: '🤍 Plan Senior',
    planTitle: 'Cuidado Especial Para Tu Viejito',
    planSubtitle: 'Porque los años dorados merecen la mejor atención.',
    products: ['Consulta General a Domicilio', 'Toma de Muestras', 'Control Preventivo'],
    productRoles: ['⭐ Evaluación geriátrica', '🔬 Lab completo', '🩺 Seguimiento'],
    testimonial: {
      quote: 'Mi gata tiene 14 años y ya no la puedo llevar a clínica. La doctora viene cada 3 meses y Pelusa está feliz.',
      name: 'María L.',
      loc: '📍 Cali · Cliente desde 2025',
      initials: 'ML',
    },
    waMessage:
      'Hola! Tengo una mascota adulta mayor y necesito el Plan Senior (consulta geriátrica + laboratorio + control). ¿Me pueden asesorar?',
    filterCategory: 'laboratorio',
  },
};

/* ──────────────────────────────────────────────
   UTILITY: lightenColor
   ────────────────────────────────────────────── */

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * (percent / 100)));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * (percent / 100)));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * (percent / 100)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/* ──────────────────────────────────────────────
   UTILITY: getScarcityText  <!-- GATILLO: Escasez -->
   ────────────────────────────────────────────── */

function getScarcityText(product) {
  const n = Math.floor(Math.random() * 4) + 2;
  return Math.random() > 0.5
    ? `Solo ${n} cupos disponibles`
    : `Últimas ${n} unidades`;
}

/* ──────────────────────────────────────────────
   1. PRODUCT LOADING & RENDERING
   ────────────────────────────────────────────── */

async function loadProducts() {
  try {
    const res = await fetch('products.json');
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (_) {
    /* silent — grid stays empty */
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="product-card" data-id="${p.id}" data-category="${p.category || ''}" data-name="${p.name}" role="button" tabindex="0" aria-label="Ver detalles de ${p.name}">
      <div class="product-card__image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.tag ? `<span class="product-card__badge">${p.tag}</span>` : ''}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title">${p.name}</h3>
        <p class="product-card__desc">${p.description || ''}</p>
        <div class="product-card__footer">
          <span class="product-card__price">${formatCOP(p.price)}</span>
          <!-- GATILLO: Escasez -->
          <span class="product-card__scarcity">${getScarcityText(p)}</span>
          <span class="product-card__hint" style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">👆 Ver detalles</span>
        </div>
      </div>
    </div>`
    )
    .join('');

  /* Wire click → modal */
  grid.querySelectorAll('.product-card').forEach((card) => {
    const openModal = () => {
      const id = parseInt(card.dataset.id, 10);
      const product = allProducts.find((p) => p.id === id);
      if (product) openProductModal(product);
    };
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openModal(); });
  });
}

/* ──────────────────────────────────────────────
   3. PRODUCT MODAL
   ────────────────────────────────────────────── */

const PRODUCT_INCLUDES = {
  'consulta-general':   ['Examen físico completo', 'Evaluación de temperatura y peso', 'Plan de tratamiento personalizado', 'Asesoría nutricional GRATIS'],
  'vacunacion-gatos':   ['Vacuna Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)', 'Registro en carnet de vacunación', 'Verificación estado de salud previo'],
  'vacunacion-perros':  ['Polivalente canina 7 en 1', 'Registro en carnet de vacunación', 'Revisión clínica previa a la vacuna'],
  'antirrabica':        ['Vacuna antirrábica oficial', 'Certificado veterinario incluido', 'Válida para trámites y viajes'],
  'desparasitacion':    ['Desparasitación interna adaptada al peso', 'Desparasitación externa si aplica', 'Recomendaciones de frecuencia'],
  'control-preventivo': ['Revisión completa: peso, temperatura, auscultación', 'Revisión dental y articular', 'Detección temprana de problemas'],
  'toma-muestras':      ['Hemograma completo', 'Química sanguínea', 'Resultados en 24-48 horas'],
  'certificado-salud':  ['Examen clínico completo', 'Certificado oficial firmado', 'Válido para viajes y adopciones'],
};

function openProductModal(product) {
  const overlay = document.getElementById('productModalOverlay');
  if (!overlay) return;

  document.getElementById('modalImg').src = product.image;
  document.getElementById('modalImg').alt = product.name;
  document.getElementById('modalBadge').textContent = product.tag || '';
  document.getElementById('modalBadge').style.display = product.tag ? '' : 'none';
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalDesc').textContent = product.description || '';
  document.getElementById('modalPrice').textContent = formatCOP(product.price);
  document.getElementById('modalCTA').href =
    WA_BASE + encodeURIComponent(`Hola! Me interesa agendar el servicio de ${product.name}. ¿Cuándo tienen disponibilidad?`);

  const includes = PRODUCT_INCLUDES[product.slug] || [];
  const includesEl = document.getElementById('modalIncludes');
  if (includes.length) {
    includesEl.innerHTML = `<h4>Incluye</h4><ul>${includes.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    includesEl.style.display = '';
  } else {
    includesEl.style.display = 'none';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const overlay = document.getElementById('productModalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────
   4. CATEGORY FILTERS
   ────────────────────────────────────────────── */

function initCategoryFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      filterProductsByCategory(cat);
    });
  });
}

function filterProductsByCategory(category) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    const match = category === 'todos' || card.dataset.category === category;
    card.style.opacity = match ? '1' : '0';
    card.style.transform = match ? 'translateY(0)' : 'translateY(20px)';
    setTimeout(() => {
      card.style.display = match ? '' : 'none';
    }, match ? 0 : 300);
    if (match) card.style.display = '';
  });

  /* Update active filter button */
  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
}

/* ──────────────────────────────────────────────
   4. selectArchetype
   ────────────────────────────────────────────── */

function selectArchetype(key) {
  const arch = ARCHETYPES[key];
  if (!arch) return;

  /* --- Hero headline & description --- */
  const heroHeadline = document.getElementById('heroHeadline');
  const heroDesc = document.getElementById('heroDesc');
  const heroSpan = document.getElementById('heroSpan');
  const heroImg = document.getElementById('heroImage');

  if (heroHeadline && heroSpan) {
    heroHeadline.innerHTML = arch.headline + ' <span id="heroSpan">' + arch.headlineSpan + '</span>';
    const newSpan = document.getElementById('heroSpan');
    if (newSpan) {
      newSpan.style.background = `linear-gradient(135deg, ${arch.color}, ${lightenColor(arch.color, 25)})`;
      newSpan.style.webkitBackgroundClip = 'text';
      newSpan.style.webkitTextFillColor = 'transparent';
      newSpan.style.backgroundClip = 'text';
    }
  }
  if (heroDesc) heroDesc.textContent = arch.desc;

  /* --- Fade transition hero image --- */
  if (heroImg) {
    heroImg.style.opacity = '0';
    heroImg.style.transform = 'translateY(10px)';
    setTimeout(() => {
      heroImg.src = arch.heroImage;
      heroImg.alt = arch.planTitle;
      heroImg.style.opacity = '1';
      heroImg.style.transform = 'translateY(0)';
    }, 300);
  }

  /* --- CSS custom properties --- */
  document.documentElement.style.setProperty('--archetype-color', arch.color);
  document.documentElement.style.setProperty('--archetype-rgb', arch.colorRGB);

  /* --- Active card styling --- */
  document.querySelectorAll('.archetype-card').forEach((card) => {
    const isActive = card.dataset.archetype === key;
    card.classList.toggle('active', isActive);
    card.style.opacity = isActive ? '1' : '0.5';
  });

  /* --- Build & show plan --- */
  buildPlanSection(arch);

  const planSection = document.getElementById('planSection');
  if (planSection) {
    planSection.style.display = 'block';
    planSection.classList.add('visible');
    setTimeout(() => {
      planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /* --- Hide quiz --- */
  const quizSection = document.getElementById('quizSection');
  if (quizSection) quizSection.style.display = 'none';

  /* --- Filter products to archetype category --- */
  filterProductsByCategory(arch.filterCategory);

  /* --- Three.js particle color sync --- */
  if (typeof window.updateParticleColors === 'function') {
    window.updateParticleColors(arch.color, lightenColor(arch.color, 30));
  }

  /* --- Hide archetype prompt --- */
  const prompt = document.getElementById('archetypePrompt');
  if (prompt) prompt.style.display = 'none';
}

/* ──────────────────────────────────────────────
   5. buildPlanSection
   ────────────────────────────────────────────── */

function buildPlanSection(arch) {
  const container = document.getElementById('planSection');
  if (!container) return;

  const matchedProducts = arch.products.map((name) =>
    allProducts.find((p) => p.name === name)
  );

  const totalPrice = matchedProducts.reduce(
    (sum, p) => sum + (p ? p.price : 0),
    0
  );

  const cardsHTML = matchedProducts
    .map((p, i) => {
      if (!p) return '';
      return `
      <div class="plan-card">
        <div class="plan-card__image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <span class="plan-card__role">${arch.productRoles[i]}</span>
        <h4 class="plan-card__name">${p.name}</h4>
        <span class="plan-card__price">${formatCOP(p.price)}</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="plan-section__inner">
      <span class="plan-section__tag">${arch.planTag}</span>
      <h2 class="plan-section__title">${arch.planTitle}</h2>
      <p class="plan-section__subtitle">${arch.planSubtitle}</p>

      <div class="plan-section__grid">
        ${cardsHTML}
      </div>

      <!-- GATILLO: Anclaje de Precio -->
      <div class="plan-section__total">
        <span class="plan-section__total-label">Inversión total estimada:</span>
        <span class="plan-section__total-price">${formatCOP(totalPrice)}</span>
      </div>

      <!-- GATILLO: CTA Directo -->
      <a href="${WA_BASE}${encodeURIComponent(arch.waMessage)}"
         target="_blank" rel="noopener" class="btn btn--primary plan-section__cta">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.608-.85-6.332-2.264l-.442-.37-3.233 1.084 1.084-3.233-.37-.442A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
        Quiero Este Plan por WhatsApp
      </a>

      <!-- GATILLO: Prueba Social -->
      <div class="plan-section__testimonial">
        <blockquote>"${arch.testimonial.quote}"</blockquote>
        <div class="plan-section__testimonial-author">
          <div class="plan-section__testimonial-avatar">${arch.testimonial.initials}</div>
          <div>
            <strong>${arch.testimonial.name}</strong>
            <small>${arch.testimonial.loc}</small>
          </div>
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────
   6. QUIZ
   ────────────────────────────────────────────── */

let quizAnswers = {};

function quizAnswer(step, value) {
  quizAnswers[step] = value;

  if (step === 1) {
    const step1 = document.getElementById('quizStep1');
    const step2 = document.getElementById('quizStep2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    return;
  }

  if (step === 2) {
    const pet = quizAnswers[1];
    const need = value;

    const mapping = {
      gato: {
        nuevo: 'gato_primerizo',
        control: 'preventivo',
        sintomas: 'gato_primerizo',
        mayor: 'senior',
      },
      perro: {
        nuevo: 'perro_activo',
        control: 'preventivo',
        sintomas: 'perro_activo',
        mayor: 'senior',
      },
    };

    const archKey = mapping[pet] && mapping[pet][need] ? mapping[pet][need] : 'preventivo';
    selectArchetype(archKey);
  }
}

/* ──────────────────────────────────────────────
   7. FAQ ACCORDION
   ────────────────────────────────────────────── */

function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      /* Close all others */
      items.forEach((other) => {
        other.classList.remove('active');
        const ans = other.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
        const icon = other.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
        const qBtn = other.querySelector('.faq-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });

      /* Toggle clicked */
      if (!isOpen) {
        item.classList.add('active');
        const ans = item.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.textContent = '−';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ──────────────────────────────────────────────
   8. PROMO BAR  <!-- GATILLO: Urgencia -->
   ────────────────────────────────────────────── */

function initPromoBar() {
  /* Promo bar close is handled inline in HTML onclick */
  /* Stock decrement every 2 minutes */
  const stockEl = document.getElementById('promoStock');
  if (stockEl) {
    setInterval(() => {
      let current = parseInt(stockEl.textContent, 10);
      if (current > 1) {
        stockEl.textContent = current - 1;
      }
    }, 120000);
  }
}

/* ──────────────────────────────────────────────
   9. COUNTDOWN EVERGREEN  <!-- GATILLO: Urgencia -->
   ────────────────────────────────────────────── */

function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  const KEY = 'vetCountdownEnd';
  let endTime = parseInt(localStorage.getItem(KEY), 10);

  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + 5 * 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, endTime);
  }

  function update() {
    const diff = Math.max(0, endTime - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');

    if (diff <= 0) {
      /* Reset for evergreen */
      const newEnd = Date.now() + 5 * 24 * 60 * 60 * 1000;
      localStorage.setItem(KEY, newEnd);
      endTime = newEnd;
    }
  }

  update();
  setInterval(update, 1000);
}

/* ──────────────────────────────────────────────
   10. FOMO NOTIFICATIONS  <!-- GATILLO: Prueba Social -->
   ────────────────────────────────────────────── */

function initFOMO() {
  const names = [
    'María', 'Carlos', 'Andrea', 'Juan', 'Sofía',
    'Diego', 'Valentina', 'Santiago', 'Camila', 'Andrés',
  ];

  const productNames =
    allProducts.length > 0
      ? allProducts.map((p) => p.name)
      : [
          'Consulta General a Domicilio',
          'Plan Vacunación Perros',
          'Plan Vacunación Gatos',
          'Control Preventivo',
          'Desparasitación',
          'Toma de Muestras',
        ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showNotification() {
    const name = pick(names);
    const city = pick(CITIES);
    const product = pick(productNames);
    const minutes = Math.floor(Math.random() * 15) + 2;

    /* Use the existing #liveNotification from HTML */
    const toast = document.getElementById('liveNotification');
    if (!toast) return;

    const notifName = document.getElementById('notifName');
    const notifAction = document.getElementById('notifAction');
    const notifTime = document.getElementById('notifTime');

    if (notifName) notifName.textContent = name + ' en ' + city;
    if (notifAction) notifAction.textContent = 'agendó ' + product;
    if (notifTime) notifTime.textContent = 'hace ' + minutes + ' min';

    /* Slide in */
    toast.classList.add('visible');

    /* Slide out after 5s */
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 5000);

    /* Schedule next */
    const next = (Math.floor(Math.random() * 16) + 25) * 1000;
    setTimeout(showNotification, next);
  }

  /* First notification at 8s */
  setTimeout(showNotification, 8000);
}

/* ──────────────────────────────────────────────
   11. NAV
   ────────────────────────────────────────────── */

function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const links = navLinks ? navLinks.querySelectorAll('a') : [];

  /* Scroll effect */
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 100);
    });
  }

  /* Hamburger toggle */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    });
  }

  /* Smooth scroll + close mobile menu */
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  });
}

/* ──────────────────────────────────────────────
   12. SCROLL PROGRESS BAR
   ────────────────────────────────────────────── */

function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
    bar.style.transform = `scaleX(${progress})`;
  });
}

/* ──────────────────────────────────────────────
   13. TRUST BAR COUNTER ANIMATION
   ────────────────────────────────────────────── */

function initTrustCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const trustBar = document.getElementById('trustBar');
  if (trustBar) observer.observe(trustBar);

  function animateCounters() {
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    });
  }
}

/* ──────────────────────────────────────────────
   15. HOVER PREVIEWS (archetype cards)
   ────────────────────────────────────────────── */

function initArchetypeHovers() {
  const cards = document.querySelectorAll('.archetype-card');
  cards.forEach((card) => {
    const key = card.dataset.archetype;
    const arch = ARCHETYPES[key];
    if (!arch) return;

    let preview = card.querySelector('.archetype-card__preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'archetype-card__preview';
      preview.textContent = arch.desc;
      card.appendChild(preview);
    }

    card.addEventListener('mouseenter', () => {
      preview.style.opacity = '1';
      preview.style.transform = 'translateY(0)';
    });

    card.addEventListener('mouseleave', () => {
      preview.style.opacity = '0';
      preview.style.transform = 'translateY(8px)';
    });
  });
}

/* ──────────────────────────────────────────────
   CSS REVEAL ANIMATION (IntersectionObserver)
   ────────────────────────────────────────────── */

function initRevealAnimations() {
  /* Handled by IntersectionObserver in inline module script in HTML */
}

/* ──────────────────────────────────────────────
   16. DOMContentLoaded — INIT
   ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  /* Load products then init dependent features */
  loadProducts().then(() => {
    initFOMO();
  });

  /* Independent inits */
  initCategoryFilters();
  initFAQ();
  initPromoBar();
  initCountdown();
  initNav();
  initScrollProgress();
  initTrustCounters();
  initArchetypeHovers();
  initRevealAnimations();

  /* Archetype card click handlers */
  document.querySelectorAll('.archetype-card').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.archetype;
      if (key) selectArchetype(key);
    });
  });

  /* Modal close handlers */
  const modalClose = document.getElementById('productModalClose');
  const modalOverlay = document.getElementById('productModalOverlay');
  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });
});

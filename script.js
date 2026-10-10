/* =====================================================
   SIDEBAR + TABS + EFECTOS
===================================================== */
(function() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function isDesktop() { return window.innerWidth >= 1024; }

  /* ===== SIDEBAR ===== */
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      if (isDesktop()) {
        document.body.classList.toggle('sidebar-hidden');
      } else {
        sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
      }
    });
  }

  if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }

  /* ===== TABS ===== */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  const indicator = document.getElementById('tabIndicator');
  const tabsContainer = document.getElementById('tabs');

  function updateIndicator(activeTab) {
  if (!indicator || !tabsContainer || !activeTab) return;

  requestAnimationFrame(() => {
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    const isMobile = window.innerWidth <= 700;
    const padding = isMobile ? 0.4 : 0.35;
    const paddingPx = padding * 16;

    const offsetX = tabRect.left - containerRect.left - paddingPx;
    const offsetY = tabRect.top - containerRect.top - paddingPx;

    indicator.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    indicator.style.width = `${tabRect.width}px`;
    indicator.style.height = `${tabRect.height}px`;
  });
}

  function activateTab(tabName, scroll = false) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabName;
      t.classList.toggle('active', isActive);
    });

    panels.forEach(p => {
      p.classList.toggle('active', p.dataset.panel === tabName);
    });

    const activeTab = Array.from(tabs).find(t => t.dataset.tab === tabName);
    if (activeTab) updateIndicator(activeTab);

    history.replaceState(null, '', `#${tabName}`);

    if (scroll) {
      const wrapper = document.querySelector('.tabs-wrapper');
      if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    attachCardGlow();
    updateActiveNavItem(tabName);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  /* ===== NAV ITEMS QUE CAMBIAN TABS ===== */
  function updateActiveNavItem(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.tabLink === tabName) item.classList.add('active');
      // Para Inicio
      if (tabName === 'unidades' && item.dataset.nav === 'inicio' && window.location.pathname.endsWith('index.html')) {
        item.classList.add('active');
      }
    });
  }

  document.querySelectorAll('.nav-item[data-tab-link]').forEach(link => {
    link.addEventListener('click', function(e) {
      // Si estamos en el index, cambiar tab sin recargar
      if (document.getElementById('tabs')) {
        e.preventDefault();
        const tabName = link.dataset.tabLink;
        activateTab(tabName, true);
        if (!isDesktop()) {
          sidebar.classList.remove('open');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
      }
      // Si no estamos en el index, el href (#practicas) llevará al index.html
    });
  });

  /* ===== EFECTO GLOW ===== */
  function attachCardGlow() {
    document.querySelectorAll('.menu-card').forEach(card => {
      if (card.dataset.glowAttached) return;
      card.dataset.glowAttached = '1';
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--x', x + '%');
        card.style.setProperty('--y', y + '%');
      });
    });
  }

  /* ===== RESIZE ===== */
  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) updateIndicator(activeTab);
  });

  /* ===== CARGA INICIAL ===== */
  const initialTab = window.location.hash.replace('#', '') || 'unidades';
  const validTabs = ['unidades', 'practicas', 'tareas', 'presentaciones'];
  const finalTab = validTabs.includes(initialTab) ? initialTab : 'unidades';

  // Si existe el sistema de tabs, activarlo
  if (tabs.length > 0) {
    activateTab(finalTab);
  }

  // Esperar al load para reposicionar el indicador
  window.addEventListener('load', () => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) updateIndicator(activeTab);
    attachCardGlow();
  });

 // Marcar como activo el ítem del sidebar según la URL
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === path) item.classList.add('active');
  });

  document.querySelectorAll('.nav-main-link').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.closest('.nav-item-header')?.classList.add('active');
    }
  });

    /* =====================================================
     ACORDEÓN DE UNIDADES
  ===================================================== */
  const ACCORDION_STORAGE_KEY = 'sidebar-accordion-state';

  function getAccordionState() {
    try {
      return JSON.parse(localStorage.getItem(ACCORDION_STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveAccordionState(state) {
    try {
      localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function toggleAccordion(groupId, forceOpen) {
    const submenu = document.querySelector(`[data-submenu="${groupId}"]`);
    const chevron = document.querySelector(`[data-toggle="${groupId}"]`);
    if (!submenu || !chevron) return;

    const willOpen = (typeof forceOpen === 'boolean') ? forceOpen : !submenu.classList.contains('open');
    submenu.classList.toggle('open', willOpen);
    chevron.classList.toggle('open', willOpen);
    chevron.setAttribute('aria-expanded', String(willOpen));

    const state = getAccordionState();
    state[groupId] = willOpen;
    saveAccordionState(state);
  }

  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleAccordion(this.dataset.toggle);
    });
  });

  // Restaurar el estado al cargar
  const savedState = getAccordionState();
  Object.keys(savedState).forEach(groupId => {
    if (savedState[groupId]) toggleAccordion(groupId, true);
  });

  // Auto-abrir la unidad de la página actual (si estamos en unidad1.html)
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage && currentPage.startsWith('unidad')) {
    const unitId = currentPage.replace('.html', '');
    if (document.querySelector(`[data-submenu="${unitId}"]`)) {
      toggleAccordion(unitId, true);
    }
  }
})();
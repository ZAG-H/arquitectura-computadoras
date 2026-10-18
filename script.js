(function() {
  /* =====================================================
     1. SIDEBAR (Menú lateral)
  ===================================================== */
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function isDesktop() { return window.innerWidth >= 1024; }

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

  /* =====================================================
     2. ACORDEÓN (Unidades en el Sidebar)
  ===================================================== */
  const ACCORDION_STORAGE_KEY = 'sidebar-accordion-state';
  
  function getAccordionState() {
    try { return JSON.parse(localStorage.getItem(ACCORDION_STORAGE_KEY)) || {}; } catch { return {}; }
  }
  
  function saveAccordionState(state) {
    try { localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(state)); } catch {}
  }
  
  function toggleAccordion(groupId, forceOpen) {
    const submenu = document.querySelector(`[data-submenu="${groupId}"]`);
    const chevron = document.querySelector(`[data-toggle="${groupId}"]`);
    if (!submenu || !chevron) return;
    
    const willOpen = (typeof forceOpen === 'boolean') ? forceOpen : !submenu.classList.contains('open');
    submenu.classList.toggle('open', willOpen);
    chevron.classList.toggle('open', willOpen);
    
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

  const savedState = getAccordionState();
  Object.keys(savedState).forEach(groupId => {
    if (savedState[groupId]) toggleAccordion(groupId, true);
  });

  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage && currentPage.startsWith('unidad')) {
    const unitId = currentPage.replace('.html', '');
    if (document.querySelector(`[data-submenu="${unitId}"]`)) {
      toggleAccordion(unitId, true);
    }
  }

  /* =====================================================
     3. PESTAÑAS (Tabs)
  ===================================================== */
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
    if (activeTab) {
      updateIndicator(activeTab);
      setTimeout(() => updateIndicator(activeTab), 50);
    }

    history.replaceState(null, '', `#${tabName}`);

    if (scroll) {
      const wrapper = document.querySelector('.tabs-wrapper');
      if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    attachCardGlow();
    updateActiveNavItem(tabName);
  }

    if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });

    const initialTab = window.location.hash.replace('#', '') || 'unidades';
    const validTabs = ['unidades', 'practicas', 'tareas', 'presentaciones'];
    const finalTab = validTabs.includes(initialTab) ? initialTab : 'unidades';
    activateTab(finalTab);
    
    // --- EL ARREGLO DEL FAMOSO BUG ---
    window.addEventListener('load', () => {
      const activeTab = document.querySelector('.tab.active');
      if (activeTab) updateIndicator(activeTab);
    });

    // En lugar de solo escuchar el 'resize' de la ventana, 
    // observamos directamente si el contenedor de las pestañas cambia.
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) updateIndicator(activeTab);
      });
      if (tabsContainer) resizeObserver.observe(tabsContainer);
    } else {
      // Fallback para navegadores viejitos
      window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) updateIndicator(activeTab);
      });
    }
  }

  /* =====================================================
     4. NAV ITEMS (Sidebar y Tabs)
  ===================================================== */
  function updateActiveNavItem(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.tabLink === tabName) item.classList.add('active');
      if (tabName === 'unidades' && item.dataset.nav === 'inicio' && window.location.pathname.endsWith('index.html')) {
        item.classList.add('active');
      }
    });
  }

  document.querySelectorAll('.nav-item[data-tab-link]').forEach(link => {
    link.addEventListener('click', function(e) {
      if (document.getElementById('tabs')) {
        e.preventDefault();
        const tabName = link.dataset.tabLink;
        activateTab(tabName, true);
        if (!isDesktop()) {
          sidebar.classList.remove('open');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
      }
    });
  });

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === path) item.classList.add('active');
  });

  /* =====================================================
     5. EFECTO BRILLO EN TARJETAS
  ===================================================== */
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
  attachCardGlow();

  /* =====================================================
     6. VISOR DE PDFs (MODAL)
  ===================================================== */
  const pdfModal = document.getElementById('pdfModal');
  const pdfIframe = document.getElementById('pdfIframe');
  const btnCerrarPdf = document.getElementById('btnCerrarPdf');

  if (pdfModal && pdfIframe) {
    const pdfLinks = document.querySelectorAll('a[href$=".pdf"]');

    pdfLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault(); 
        const pdfUrl = this.getAttribute('href');
        pdfIframe.src = pdfUrl;
        pdfModal.classList.add('active');
      });
    });

    function cerrarModalPdf() {
      pdfModal.classList.remove('active');
      setTimeout(() => { pdfIframe.src = ''; }, 300);
    }

    if (btnCerrarPdf) btnCerrarPdf.addEventListener('click', cerrarModalPdf);
    
    pdfModal.addEventListener('click', function(e) {
      if (e.target === pdfModal) cerrarModalPdf();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
        cerrarModalPdf();
      }
    });
  }
/* =====================================================
   BOTÓN PARA COMPARTIR E INSTALAR LA APP (PWA)
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  
  // --- Lógica para Compartir ---
  const btnShare = document.getElementById('btnShare');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const shareData = {
        title: 'Arquitectura de Computadoras - ITS',
        text: '¡Checa la página web que hice para la materia!',
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert('¡Enlace copiado al portapapeles!');
        }
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    });
  }

  // --- Lógica para Instalar App (PWA) ---
  let deferredPrompt;
  const btnInstall = document.getElementById('btnInstall');

  // El navegador avisa cuando la app es "instalable"
  window.addEventListener('beforeinstallprompt', (e) => {
    // Evitamos que el navegador muestre su propio banner automático
    e.preventDefault();
    // Guardamos el evento para dispararlo cuando el usuario haga clic
    deferredPrompt = e;
    // Mostramos nuestro botón personalizado
    if (btnInstall) btnInstall.style.display = 'inline-flex';
  });

  // Cuando el usuario hace clic en nuestro botón
  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Mostramos el cuadro de diálogo nativo de instalación
        deferredPrompt.prompt();
        // Esperamos a que el usuario acepte o cancele
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`El usuario ${outcome === 'accepted' ? 'aceptó' : 'canceló'} la instalación`);
        // Limpiamos la variable
        deferredPrompt = null;
        // Ocultamos el botón
        btnInstall.style.display = 'none';
      }
    });
  }

  // Si la app ya está instalada, ocultamos el botón
  window.addEventListener('appinstalled', () => {
    if (btnInstall) btnInstall.style.display = 'none';
    console.log('¡App instalada con éxito!');
  });
});
})();
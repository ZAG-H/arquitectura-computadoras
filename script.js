/* =====================================================
   SCRIPT SIMPLE
   - Solo se encarga del toggle del sidebar
   - Los enlaces funcionan de forma NATIVA (sin JS)
===================================================== */
(function() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  // Si no existe el botón, no hacemos nada
  if (!sidebarToggle || !sidebar) return;

  function isDesktop() {
    return window.innerWidth >= 1024;
  }

  // Toggle del sidebar
  sidebarToggle.addEventListener('click', function() {
    if (isDesktop()) {
      document.body.classList.toggle('sidebar-hidden');
    } else {
      sidebar.classList.toggle('open');
      if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    }
  });

  // Cerrar con overlay (móvil)
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Cerrar sidebar en móvil al hacer clic en un enlace del índice
  sidebar.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function() {
      if (!isDesktop()) {
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
      }
    });
  });

  // Efecto de brillo en las tarjetas (solo si existen)
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', x + '%');
      card.style.setProperty('--y', y + '%');
    });
  });

})();
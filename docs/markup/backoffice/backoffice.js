(function () {
  'use strict';

  var toggle = document.getElementById('boSidebarToggle');
  var sidebar = document.getElementById('boSidebar');
  var overlay = document.getElementById('boOverlay');
  var body = document.body;

  function openNav() {
    body.classList.add('bo-nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
    }
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    body.classList.remove('bo-nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    }
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
  }

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      if (body.classList.contains('bo-nav-open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeNav);
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      closeNav();
    }
  });
})();

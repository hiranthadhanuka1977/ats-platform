(function () {
  'use strict';

  // ─── DOM References ───
  var filterPanel    = document.getElementById('filterPanel');
  var filterOverlay  = document.getElementById('filterOverlay');
  var filterToggle   = document.getElementById('filterToggle');
  var filterClose    = document.getElementById('filterClose');
  var remoteToggle   = document.getElementById('remoteToggle');
  var heroSearchForm = document.querySelector('.hero-search');
  var heroSearchInput = document.getElementById('hero-search-input');
  var filterSearchInput = document.getElementById('filter-search');

  // ─── A11y Status Live Region ───
  var statusRegion = document.createElement('div');
  statusRegion.setAttribute('role', 'status');
  statusRegion.setAttribute('aria-live', 'polite');
  statusRegion.className = 'sr-only';
  document.body.appendChild(statusRegion);

  function announceStatus(message) {
    statusRegion.textContent = '';
    requestAnimationFrame(function () {
      statusRegion.textContent = message;
    });
  }

  // ─── Text Resizer ───
  var TEXT_SIZES = [87.5, 100, 112.5, 125, 137.5];
  var DEFAULT_INDEX = 1;
  var currentSizeIndex = DEFAULT_INDEX;

  var savedSize = sessionStorage.getItem('textSizeIndex');
  if (savedSize !== null) {
    currentSizeIndex = parseInt(savedSize, 10);
    if (isNaN(currentSizeIndex) || currentSizeIndex < 0 || currentSizeIndex >= TEXT_SIZES.length) {
      currentSizeIndex = DEFAULT_INDEX;
    }
  }

  function applyTextSize() {
    document.documentElement.style.fontSize = TEXT_SIZES[currentSizeIndex] + '%';
    sessionStorage.setItem('textSizeIndex', currentSizeIndex);

    var allBtns = document.querySelectorAll('.text-resizer-btn');
    allBtns.forEach(function (b) { b.classList.remove('is-active'); });
    var resetBtns = document.querySelectorAll('.text-resizer-btn[data-resize="reset"]');
    if (currentSizeIndex === DEFAULT_INDEX) {
      resetBtns.forEach(function (b) { b.classList.add('is-active'); });
    }
  }

  applyTextSize();

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.text-resizer-btn');
    if (!btn) return;
    var action = btn.getAttribute('data-resize');
    if (action === 'increase' && currentSizeIndex < TEXT_SIZES.length - 1) {
      currentSizeIndex++;
    } else if (action === 'decrease' && currentSizeIndex > 0) {
      currentSizeIndex--;
    } else if (action === 'reset') {
      currentSizeIndex = DEFAULT_INDEX;
    }
    applyTextSize();
  });

  // ─── Mobile Navigation Toggle ───
  var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  var mainNav       = document.querySelector('.main-nav');

  function openMobileNav() {
    if (!mainNav || !mobileMenuBtn) return;
    mainNav.classList.add('is-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.setAttribute('aria-label', 'Close menu');
  }

  function closeMobileNav() {
    if (!mainNav || !mobileMenuBtn) return;
    mainNav.classList.remove('is-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Open menu');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      var isOpen = mainNav && mainNav.classList.contains('is-open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (!mainNav || !mainNav.classList.contains('is-open')) return;
    if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('is-open')) {
      closeMobileNav();
      mobileMenuBtn.focus();
    }
  });

  // ─── Hero Search → Filter Search Sync ───
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = heroSearchInput ? heroSearchInput.value.trim() : '';
      if (filterSearchInput) {
        filterSearchInput.value = query;
        filterSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      var listingsSection = document.querySelector('.job-listings');
      if (listingsSection) {
        listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ─── Clickable Job Cards ───
  document.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, select, textarea')) return;
    var card = e.target.closest('.job-card');
    if (!card) return;
    var link = card.querySelector('.job-card-title a');
    if (link) link.click();
  });

  // ─── Focus Trap State ───
  var activeTrapHandler = null;

  // ─── Filter Drawer (Mobile) ───
  function openFilterDrawer() {
    if (!filterPanel || !filterOverlay) return;
    filterPanel.classList.add('is-open');
    filterOverlay.classList.add('is-visible');
    filterOverlay.setAttribute('aria-hidden', 'false');
    if (filterToggle) filterToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    trapFocusInPanel(filterPanel);
  }

  function closeFilterDrawer() {
    if (!filterPanel || !filterOverlay) return;
    filterPanel.classList.remove('is-open');
    filterOverlay.classList.remove('is-visible');
    filterOverlay.setAttribute('aria-hidden', 'true');
    if (filterToggle) {
      filterToggle.setAttribute('aria-expanded', 'false');
      filterToggle.focus();
    }
    document.body.style.overflow = '';
    releaseFocusTrap();
  }

  if (filterToggle)  filterToggle.addEventListener('click', openFilterDrawer);
  if (filterClose)   filterClose.addEventListener('click', closeFilterDrawer);
  if (filterOverlay) filterOverlay.addEventListener('click', closeFilterDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && filterPanel && filterPanel.classList.contains('is-open')) {
      closeFilterDrawer();
    }
  });

  // ─── Remote Toggle ───
  if (remoteToggle) {
    remoteToggle.addEventListener('click', function () {
      var checked = this.getAttribute('aria-checked') === 'true';
      this.setAttribute('aria-checked', String(!checked));
    });

    remoteToggle.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.click();
      }
    });
  }

  // ─── Pagination ───
  var paginationBtns = document.querySelectorAll('.pagination-btn[aria-label^="Page"]');
  paginationBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      paginationBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.removeAttribute('aria-current');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-current', 'page');
    });
  });

  // ─── Focus Trap Utility ───
  function trapFocusInPanel(panel) {
    releaseFocusTrap();

    var focusable = panel.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    focusable[0].focus();

    activeTrapHandler = function (e) {
      if (e.key !== 'Tab') return;

      var first = focusable[0];
      var last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener('keydown', activeTrapHandler);
  }

  function releaseFocusTrap() {
    if (activeTrapHandler && filterPanel) {
      filterPanel.removeEventListener('keydown', activeTrapHandler);
      activeTrapHandler = null;
    }
  }

  // ─── Clear Filters ───
  var clearBtn = document.querySelector('.filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!filterPanel) return;
      var inputs  = filterPanel.querySelectorAll('.form-input');
      var selects = filterPanel.querySelectorAll('.form-select');

      inputs.forEach(function (input) { input.value = ''; });
      selects.forEach(function (select) { select.selectedIndex = 0; });

      if (remoteToggle) {
        remoteToggle.setAttribute('aria-checked', 'false');
      }
    });
  }

  // ─── Bookmark Toggle ───
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.icon-btn--bookmark');
    if (!btn) return;
    var pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
    var label = btn.getAttribute('aria-label') || '';
    var jobName = label.replace(/^Bookmark\s*/i, '').trim();
    if (!pressed) {
      announceStatus(jobName ? jobName + ' bookmarked' : 'Job bookmarked');
    } else {
      announceStatus(jobName ? jobName + ' bookmark removed' : 'Bookmark removed');
    }
  });

  // ─── Share Button ───
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.icon-btn--share');
    if (!btn) return;
    var jobTitle = '';
    var card = btn.closest('.job-card');
    if (card) {
      var titleEl = card.querySelector('.job-card-title a');
      if (titleEl) jobTitle = titleEl.textContent.trim();
    } else {
      var heading = document.getElementById('detail-heading');
      if (heading) jobTitle = heading.textContent.trim();
    }
    var shareData = {
      title: jobTitle || 'Job Opening',
      text: jobTitle ? 'Check out this job: ' + jobTitle : 'Check out this job opening',
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(function () {
        btn.setAttribute('data-tooltip', 'Link copied!');
        announceStatus('Link copied to clipboard');
        setTimeout(function () { btn.removeAttribute('data-tooltip'); }, 2000);
      }).catch(function () {});
    }
  });

  // ─── Hero Department Pills ───
  var heroPills = document.querySelector('.hero-pills');
  if (heroPills) {
    heroPills.addEventListener('click', function (e) {
      var pill = e.target.closest('.hero-pill');
      if (!pill) return;

      heroPills.querySelectorAll('.hero-pill').forEach(function (p) {
        p.classList.remove('is-active');
      });
      pill.classList.add('is-active');

      var dept = pill.getAttribute('data-department');
      var deptSelect = document.getElementById('filter-department');
      if (deptSelect) {
        deptSelect.value = dept;
        deptSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      var listingsSection = document.querySelector('.job-listings');
      if (listingsSection) {
        listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ─── Empty State Clear Filters Button ───
  var emptyStateClear = document.querySelector('.empty-state .btn');
  if (emptyStateClear && clearBtn) {
    emptyStateClear.addEventListener('click', function () {
      clearBtn.click();
    });
  }

  // ─── Password Visibility Toggle ───
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.password-toggle');
    if (!toggle) return;

    var wrap = toggle.closest('.form-input-icon-wrap');
    if (!wrap) return;

    var input = wrap.querySelector('input');
    if (!input) return;

    var isVisible = toggle.getAttribute('data-visible') === 'true';
    var eyeOpen = toggle.querySelector('.eye-open');
    var eyeClosed = toggle.querySelector('.eye-closed');

    if (isVisible) {
      input.type = 'password';
      toggle.setAttribute('data-visible', 'false');
      toggle.setAttribute('aria-label', 'Show password');
      if (eyeOpen) eyeOpen.style.display = '';
      if (eyeClosed) eyeClosed.style.display = 'none';
    } else {
      input.type = 'text';
      toggle.setAttribute('data-visible', 'true');
      toggle.setAttribute('aria-label', 'Hide password');
      if (eyeOpen) eyeOpen.style.display = 'none';
      if (eyeClosed) eyeClosed.style.display = '';
    }
  });

  // ─── Auth Form Validation ───
  var authForm = document.querySelector('.auth-form');
  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = authForm.querySelector('#login-email');
      var password = authForm.querySelector('#login-password');
      var firstErrorField = null;

      clearFormErrors(authForm);

      if (email && !email.value.trim()) {
        showFieldError(email, 'Please enter your email address');
        if (!firstErrorField) firstErrorField = email;
      } else if (email && !isValidEmail(email.value.trim())) {
        showFieldError(email, 'Please enter a valid email address');
        if (!firstErrorField) firstErrorField = email;
      }

      if (password && !password.value) {
        showFieldError(password, 'Please enter your password');
        if (!firstErrorField) firstErrorField = password;
      }

      if (firstErrorField) {
        firstErrorField.focus();
        var errorCount = authForm.querySelectorAll('.form-error').length;
        var msg = errorCount === 1
          ? '1 error found. Please correct the highlighted field.'
          : errorCount + ' errors found. Please correct the highlighted fields.';
        announceStatus(msg);
      } else {
        announceStatus('Logging in…');
      }
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showFieldError(input, message) {
    input.classList.add('form-input--error');
    var group = input.closest('.form-group') || input.closest('.form-input-icon-wrap');
    if (!group) return;

    var errId = input.id + '-error';
    var err = document.createElement('p');
    err.className = 'form-error';
    err.id = errId;
    err.setAttribute('role', 'alert');
    err.textContent = message;

    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errId);

    var wrap = input.closest('.form-input-icon-wrap');
    if (wrap && wrap.parentNode) {
      wrap.parentNode.appendChild(err);
    } else {
      group.appendChild(err);
    }
  }

  function clearFormErrors(form) {
    var errors = form.querySelectorAll('.form-error');
    errors.forEach(function (el) { el.remove(); });

    var invalids = form.querySelectorAll('.form-input--error');
    invalids.forEach(function (el) {
      el.classList.remove('form-input--error');
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

})();

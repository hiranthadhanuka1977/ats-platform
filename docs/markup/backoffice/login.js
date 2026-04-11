(function () {
  'use strict';

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
})();

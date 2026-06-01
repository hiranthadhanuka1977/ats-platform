(function () {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".header-nav");

  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML =
    '<svg class="back-to-top-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg><span>Top</span>';
  document.body.appendChild(backToTop);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollThreshold = 320;

  const updateBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > scrollThreshold);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
})();

(() => {
  const galleryData = [
    {
      src: "./assets/stock_images/gallery_1.jpg",
      thumb: "./assets/stock_images/gallery_1.jpg",
    },
    {
      src: "./assets/stock_images/gallery_2.jpg",
      thumb: "./assets/stock_images/gallery_2.jpg",
    },
  ];

  const dom = {
    nav: document.querySelector("[data-nav]"),
    navMenu: document.querySelector("[data-nav-menu]"),
    navToggle: document.querySelector("[data-nav-toggle]"),
    navBackdrop: document.querySelector("[data-nav-backdrop]"),
    scrollLinks: document.querySelectorAll("[data-scroll]"),
    heroStats: document.querySelectorAll("[data-stat]"),
    joinButton: document.getElementById("joinButton"),
    year: document.getElementById("year"),
    inlineGallery: document.getElementById("inline-gallery"),
    toastStack: document.getElementById("toastStack"),
  };

  const state = {
    galleryInstance: null,
  };

  const smoothScroll = (target) => {
    const node = document.querySelector(target);
    if (!node) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    closeMenu();
  };

  const closeMenu = () => {
    dom.navMenu?.classList.remove("is-open");
    dom.navBackdrop?.classList.remove("is-open");
  };

  const toggleMenu = () => {
    const isOpen = dom.navMenu?.classList.toggle("is-open");
    dom.navBackdrop?.classList.toggle("is-open", isOpen);
  };

  const handleNavState = () => {
    if (!dom.nav) return;
    const scrolled = window.scrollY > 10;
    dom.nav.classList.toggle("nav--scrolled", scrolled);
  };

  const randomId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `pay_${Math.random().toString(16).slice(2, 10)}`;
  };

  const showToast = (title, desc, isError = false) => {
    if (!dom.toastStack) return;
    const toast = document.createElement("div");
    toast.className = `toast${isError ? " toast--error" : ""}`;

    const t = document.createElement("p");
    t.className = "toast__title";
    t.textContent = title;

    const d = document.createElement("p");
    d.className = "toast__desc";
    d.textContent = desc;

    toast.appendChild(t);
    toast.appendChild(d);
    dom.toastStack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(6px)";
      setTimeout(() => toast.remove(), 180);
    }, 3400);
  };

  const initInlineGallery = () => {
    if (!dom.inlineGallery || typeof lightGallery === "undefined") return;
    if (state.galleryInstance && typeof state.galleryInstance.destroy === "function") {
      state.galleryInstance.destroy(true);
    }

    state.galleryInstance = lightGallery(dom.inlineGallery, {
      container: dom.inlineGallery,
      addClass: "lg-inline",
      closable: false,
      dynamic: true,
      dynamicEl: galleryData,
      licenseKey: "0000-0000-000-0000",
      plugins: [lgThumbnail, lgZoom],
      thumbnail: true,
      showMaximizeIcon: true,
      hideBarsDelay: 0,
      download: false,
      mode: "lg-fade",
      speed: 420,
      swipeThreshold: 30,
    });

    // Inline mode needs an explicit open to render the first slide
    if (typeof state.galleryInstance.openGallery === "function") {
      state.galleryInstance.openGallery(0);
    }
  };

  const bindEvents = () => {
    dom.scrollLinks.forEach((link) => {
      const target = link.getAttribute("data-scroll");
      if (!target) return;
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        smoothScroll(target);
      });
    });

    dom.navToggle?.addEventListener("click", toggleMenu);
    dom.navBackdrop?.addEventListener("click", closeMenu);
    window.addEventListener("scroll", handleNavState, { passive: true });

    dom.joinButton?.addEventListener("click", () => {
      const id = randomId();
      showToast("Payment initiated", `Payment ID: ${id}. No backend needed for this demo.`);
    });
  };

  const animateStats = () => {
    const stats = dom.heroStats;
    if (!("IntersectionObserver" in window) || stats.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute("data-stat") || "0");
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));

        const tick = () => {
          current += step;
          if (current >= target) {
            el.textContent = `${target}${target > 200 ? "+" : ""}`;
            return;
          }
          el.textContent = `${current}`;
          requestAnimationFrame(tick);
        };

        tick();
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach((el) => observer.observe(el));
  };

  const init = () => {
    handleNavState();
    bindEvents();
    initInlineGallery();
    animateStats();
    if (dom.year) dom.year.textContent = new Date().getFullYear();
  };

  document.addEventListener("DOMContentLoaded", init);
})();

(() => {
  const galleryData = [
    {
      src: "./assets/stock_images/gallery_1.jpg",
    },
    {
      src: "./assets/stock_images/gallery_2.jpg",
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
    galleryFrame: document.querySelector("[data-gallery-frame]"),
    galleryImg: document.getElementById("galleryImage"),
    galleryTitle: document.getElementById("galleryTitle"),
    galleryCaption: document.getElementById("galleryCaption"),
    galleryDots: document.getElementById("galleryDots"),
    galleryPrev: document.querySelector("[data-gallery-prev]"),
    galleryNext: document.querySelector("[data-gallery-next]"),
    toastStack: document.getElementById("toastStack"),
  };

  const state = {
    galleryIndex: 0,
    galleryTimer: null,
  };

  const clampIndex = (index) => {
    const total = galleryData.length;
    return (index + total) % total;
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

  const updateGalleryVisuals = () => {
    const item = galleryData[state.galleryIndex];
    if (!item || !dom.galleryImg || !dom.galleryTitle || !dom.galleryCaption) return;
    dom.galleryImg.src = item.src;
    dom.galleryImg.alt = item.caption;
    dom.galleryTitle.textContent = item.title;
    dom.galleryCaption.textContent = item.caption;

    if (dom.galleryDots) {
      dom.galleryDots.querySelectorAll("button").forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === state.galleryIndex);
      });
    }
  };

  const setGalleryIndex = (index) => {
    state.galleryIndex = clampIndex(index);
    updateGalleryVisuals();
    restartGalleryTimer();
  };

  const restartGalleryTimer = () => {
    if (state.galleryTimer) clearInterval(state.galleryTimer);
    state.galleryTimer = window.setInterval(() => {
      setGalleryIndex(state.galleryIndex + 1);
    }, 5200);
  };

  const buildGalleryUI = () => {
    if (!dom.galleryDots) return;
    dom.galleryDots.innerHTML = "";

    galleryData.forEach((item, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show image ${idx + 1}`);
      dot.addEventListener("click", () => setGalleryIndex(idx));
      dom.galleryDots.appendChild(dot);
    });
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

    if (dom.galleryPrev) dom.galleryPrev.addEventListener("click", () => setGalleryIndex(state.galleryIndex - 1));
    if (dom.galleryNext) dom.galleryNext.addEventListener("click", () => setGalleryIndex(state.galleryIndex + 1));

    dom.galleryFrame?.addEventListener("mouseenter", () => {
      if (state.galleryTimer) clearInterval(state.galleryTimer);
    });
    dom.galleryFrame?.addEventListener("mouseleave", restartGalleryTimer);

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
    buildGalleryUI();
    setGalleryIndex(0);
    animateStats();
    if (dom.year) dom.year.textContent = new Date().getFullYear();
  };

  document.addEventListener("DOMContentLoaded", init);
})();

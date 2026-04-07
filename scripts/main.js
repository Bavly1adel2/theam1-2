import Alpine from "alpinejs";

function setupNavbarOnScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 50) header.classList.add("nav-scroll");
    else header.classList.remove("nav-scroll");
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function enhanceGlobalMotionHooks() {
  const sections = Array.from(document.querySelectorAll("main section"));
  sections.forEach((section, sectionIndex) => {
    const cards = Array.from(section.querySelectorAll(".glass, .feature-card, .demo-card"));
    const cardCap = sectionIndex < 2 ? 10 : 6;
    cards.slice(0, cardCap).forEach((card) => {
      if (!card.classList.contains("premium-hover")) card.classList.add("premium-hover");
      if (!card.hasAttribute("data-tilt")) card.setAttribute("data-tilt", "");
      if (!card.hasAttribute("data-magnetic")) card.setAttribute("data-magnetic", "");
      if (!card.classList.contains("reveal")) card.classList.add("reveal");
    });

    const directGridItems = Array.from(section.querySelectorAll(".grid > *"));
    directGridItems.slice(0, 16).forEach((item) => {
      if (item.classList.contains("reveal")) return;
      if (!(item instanceof HTMLElement)) return;
      item.classList.add("reveal");
    });
  });

  const buttons = Array.from(document.querySelectorAll(".btn-primary, .btn-secondary, .btn-ghost"));
  buttons.forEach((btn) => {
    if (!btn.hasAttribute("data-magnetic")) btn.setAttribute("data-magnetic", "");
    if (!btn.hasAttribute("data-magnetic-strength")) {
      const value = btn.classList.contains("btn-primary") ? "5" : "3";
      btn.setAttribute("data-magnetic-strength", value);
    }
  });
}

function setupSignatureMotion() {
  const root = document.querySelector("[data-signature-root]");
  if (!root) return;
  let rafId = 0;
  let tx = 0.5;
  let ty = 0.3;
  let cx = 0.5;
  let cy = 0.3;

  const tick = () => {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    document.body.style.setProperty("--sig-x", `${cx * 100}%`);
    document.body.style.setProperty("--sig-y", `${cy * 100}%`);
    rafId = requestAnimationFrame(tick);
  };

  const onPointerMove = (event) => {
    tx = clamp(event.clientX / window.innerWidth, 0, 1);
    ty = clamp(event.clientY / window.innerHeight, 0, 1);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  rafId = requestAnimationFrame(tick);

  window.addEventListener(
    "beforeunload",
    () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
    },
    { once: true }
  );
}

function setupLoadingButtons() {
  const buttons = Array.from(document.querySelectorAll("[data-loading-btn]"));
  if (buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("is-loading")) return;
      button.classList.add("is-loading");
      const labelHtml = button.innerHTML;
      button.setAttribute("aria-busy", "true");
      button.textContent = "Processing";

      window.setTimeout(() => {
        button.classList.remove("is-loading");
        button.removeAttribute("aria-busy");
        button.innerHTML = labelHtml;
      }, 1200);
    });
  });
}

function setupTypingText() {
  const targets = Array.from(document.querySelectorAll("[data-typing]"));
  if (targets.length === 0) return;

  targets.forEach((el) => {
    const fullText = el.getAttribute("data-typing-text") || "";
    if (!fullText) return;
    const speed = Number(el.getAttribute("data-typing-speed") || 52);
    let index = 0;
    let deleting = false;

    const tick = () => {
      if (!deleting) {
        index += 1;
        el.textContent = fullText.slice(0, index);
        if (index >= fullText.length) {
          deleting = true;
          window.setTimeout(tick, 1200);
          return;
        }
      } else {
        index -= 1;
        el.textContent = fullText.slice(0, index);
        if (index <= 8) deleting = false;
      }

      const variance = Math.floor(Math.random() * 20);
      window.setTimeout(tick, speed + variance);
    };

    tick();
  });
}

function setupPageEnter() {
  document.body.classList.add("page-enter");
  requestAnimationFrame(() => {
    document.body.classList.add("page-enter-active");
  });
}

function setupRevealAnimations() {
  const items = Array.from(document.querySelectorAll("[data-reveal], .reveal"));
  if (items.length === 0) return;

  const groups = new Map();
  items.forEach((el) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
    const parent = el.closest("[data-stagger]") || el.parentElement;
    if (!parent) return;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((groupEls) => {
    groupEls.forEach((el, index) => {
      if (el.style.getPropertyValue("--reveal-delay")) return;
      el.style.setProperty("--reveal-delay", `${index * 70}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => io.observe(el));
}

function setupTiltAndMagnetic() {
  const targets = Array.from(document.querySelectorAll("[data-tilt], [data-magnetic]"));
  if (targets.length === 0) return;

  targets.forEach((el) => {
    /** @type {number | null} */
    let rafId = null;

    const onMove = (event) => {
      if (!(event instanceof PointerEvent)) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const mx = clamp((px - 0.5) * 2, -1, 1);
      const my = clamp((py - 0.5) * 2, -1, 1);

      const tiltStrength = Number(el.getAttribute("data-tilt-strength") || 8);
      const magneticStrength = Number(el.getAttribute("data-magnetic-strength") || 10);
      const hasTilt = el.hasAttribute("data-tilt");
      const hasMagnetic = el.hasAttribute("data-magnetic");

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (hasTilt) {
          el.style.setProperty("--ry", `${mx * tiltStrength}deg`);
          el.style.setProperty("--rx", `${-my * tiltStrength}deg`);
        }
        if (hasMagnetic) {
          el.style.setProperty("--mx", `${mx * magneticStrength}px`);
          el.style.setProperty("--my", `${my * magneticStrength}px`);
        }
      });
    };

    const reset = () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", reset, { passive: true });
  });
}

function setupParallax() {
  const sections = Array.from(document.querySelectorAll("[data-parallax-root]"));
  if (sections.length === 0) return;

  sections.forEach((section) => {
    const layers = Array.from(section.querySelectorAll("[data-speed]"));
    if (layers.length === 0) return;
    let rafId = 0;

    const onMove = (event) => {
      if (!(event instanceof PointerEvent)) return;
      const rect = section.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        layers.forEach((layer) => {
          const speed = Number(layer.getAttribute("data-speed") || "1");
          layer.style.setProperty("--px", `${x * speed * 18}px`);
          layer.style.setProperty("--py", `${y * speed * 18}px`);
        });
      });
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener(
      "pointerleave",
      () => {
        layers.forEach((layer) => {
          layer.style.setProperty("--px", "0px");
          layer.style.setProperty("--py", "0px");
        });
      },
      { passive: true }
    );
  });
}

function setupCounters() {
  const counters = Array.from(document.querySelectorAll(".counter"));
  if (counters.length === 0) return;

  const animate = (el) => {
    const target = Number(el.dataset.target || "0");
    if (!Number.isFinite(target)) return;
    let count = 0;

    const step = () => {
      count += target / 60;
      if (count < target) {
        el.textContent = String(Math.floor(count));
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    step();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = /** @type {HTMLElement} */ (e.target);
        if (el.dataset.done === "1") continue;
        el.dataset.done = "1";
        animate(el);
      }
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => io.observe(c));
}

function getStoredTheme() {
  try {
    return localStorage.getItem("neuroai-theme") || "system";
  } catch {
    return "system";
  }
}

function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode) {
  const theme = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

document.addEventListener("alpine:init", () => {
  Alpine.store("theme", {
    mode: getStoredTheme(),
    init() {
      applyTheme(this.mode);
      if (window.matchMedia) {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", () => {
            if (this.mode === "system") applyTheme(this.mode);
          });
      }
    },
    set(mode) {
      this.mode = mode;
      try {
        localStorage.setItem("neuroai-theme", mode);
      } catch {
        // ignore
      }
      applyTheme(mode);
    }
  });

  Alpine.store("toast", {
    items: [],
    push(message, variant = "info") {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      this.items.push({ id, message, variant });
      setTimeout(() => this.remove(id), 3800);
    },
    remove(id) {
      this.items = this.items.filter((t) => t.id !== id);
    }
  });
});

window.Alpine = Alpine;
Alpine.start();

enhanceGlobalMotionHooks();
setupPageEnter();
setupNavbarOnScroll();
setupCounters();
setupRevealAnimations();
setupTiltAndMagnetic();
setupParallax();
setupSignatureMotion();
setupLoadingButtons();
setupTypingText();


/* ==========================================================================
   comienzIA — Interacciones y animaciones (GSAP + mejoras progresivas)
   ========================================================================== */
(() => {
  "use strict";

  /* ----------------------------------------------------------------------
     Utilidades base
  ---------------------------------------------------------------------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = () => typeof window.gsap !== "undefined";
  const hasScrollTrigger = () => hasGsap() && typeof window.ScrollTrigger !== "undefined";

  const yearEl = $("#current-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     Navegación móvil
  ---------------------------------------------------------------------- */
  const menuToggle = $(".menu-toggle");
  const mainNav = $("#main-nav");

  if (menuToggle && mainNav) {
    const setMenu = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      mainNav.classList.toggle("is-open", open);
    };
    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mainNav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  /* ----------------------------------------------------------------------
     Barra de progreso de lectura
  ---------------------------------------------------------------------- */
  const progressBar = $("#scroll-progress-bar");
  if (progressBar) {
    let frame = 0;
    const render = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(render); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render();
  }

  /* ----------------------------------------------------------------------
     Selector de sectores (tabs accesibles)
  ---------------------------------------------------------------------- */
  const sectorContent = {
    comercio: {
      kicker: "COMERCIO Y SERVICIOS",
      title: "Atiende mejor.\nRecupera tiempo.",
      description: "Un agente puede ayudar a resolver consultas habituales, organizar peticiones y dar continuidad a cada conversación, sin perder el trato personal.",
      workflows: [
        "Preguntas sobre servicios, horarios y condiciones",
        "Clasificación de solicitudes y consultas",
        "Seguimiento de clientes y presupuestos",
      ],
    },
    inmobiliaria: {
      kicker: "INMOBILIARIAS",
      title: "Cada consulta,\nmejor encaminada.",
      description: "Facilita la primera atención a compradores, inquilinos y propietarios, y ayuda al equipo a ordenar las solicitudes para darles seguimiento.",
      workflows: [
        "Recogida inicial de preferencias y necesidades",
        "Respuestas a preguntas frecuentes sobre inmuebles",
        "Organización de solicitudes de visita",
      ],
    },
    despacho: {
      kicker: "DESPACHOS PROFESIONALES",
      title: "Más claridad\nen cada gestión.",
      description: "Un asesor puede ayudar a recopilar información, orientar consultas habituales y hacer más accesible el conocimiento interno del despacho.",
      workflows: [
        "Recopilación inicial de datos del cliente",
        "Clasificación y derivación de consultas",
        "Búsqueda en documentación y procedimientos internos",
      ],
    },
    clinica: {
      kicker: "CLÍNICAS Y CENTROS",
      title: "Una atención más\nágil y cercana.",
      description: "Agiliza tareas administrativas y la atención informativa, manteniendo las consultas clínicas y las decisiones sensibles bajo supervisión profesional.",
      workflows: [
        "Información general sobre servicios y horarios",
        "Apoyo administrativo para solicitudes de cita",
        "Recordatorios y preguntas frecuentes",
      ],
    },
    hosteleria: {
      kicker: "HOSTELERÍA",
      title: "Más tiempo para\ncuidar la experiencia.",
      description: "Resuelve consultas frecuentes y organiza peticiones para que el equipo pueda dedicar más atención al servicio y a las personas.",
      workflows: [
        "Consultas sobre horarios, ubicación y servicios",
        "Gestión inicial de peticiones y reservas",
        "Información útil antes y después de la visita",
      ],
    },
  };

  const tabs = $$(".sector-tab");
  const sectorPanel = $("#sector-panel");
  const sectorKicker = $("#sector-kicker");
  const sectorTitle = $("#sector-title");
  const sectorDescription = $("#sector-description");
  const sectorWorkflows = $("#sector-workflows");

  const selectSector = (tab, moveFocus = false) => {
    const sector = sectorContent[tab.dataset.sector];
    if (!sector || !sectorPanel) return;

    tabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });

    sectorPanel.setAttribute("aria-labelledby", tab.id);
    sectorKicker.textContent = sector.kicker;
    sectorTitle.textContent = sector.title;
    sectorDescription.textContent = sector.description;
    sectorWorkflows.replaceChildren(
      ...sector.workflows.map((workflow, index) => {
        const row = document.createElement("div");
        row.className = "workflow";
        const number = document.createElement("span");
        number.textContent = `0${index + 1}`;
        const label = document.createElement("span");
        label.textContent = workflow;
        const arrow = document.createElement("span");
        arrow.className = "workflow-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        row.append(number, label, arrow);
        return row;
      }),
    );

    if (hasGsap() && !prefersReducedMotion.matches) {
      window.gsap.fromTo(
        sectorPanel,
        { opacity: 0.35, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", overwrite: true },
      );
    }

    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectSector(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (nextIndex !== index) {
        event.preventDefault();
        selectSector(tabs[nextIndex], true);
      }
    });
  });

  /* ----------------------------------------------------------------------
     Animación del fondo del hero (canvas de nodos)
  ---------------------------------------------------------------------- */
  const initParticles = () => {
    const canvas = $("#hero-particles");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const hero = $("#inicio");
    const DOTS = 46;
    const LINK_DISTANCE = 150;
    const ACCENT = "120, 186, 255";
    let dots = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let visible = true;

    const resize = () => {
      const rect = hero ? hero.getBoundingClientRect() : canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.round((DOTS * width) / 1200));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.6 + 0.7,
      }));
    };

    const draw = () => {
      rafId = 0;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
      }

      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const alpha = (1 - dist / LINK_DISTANCE) * 0.16;
            ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      for (const dot of dots) {
        ctx.fillStyle = `rgba(${ACCENT}, 0.55)`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (visible && !prefersReducedMotion.matches) rafId = requestAnimationFrame(draw);
    };

    const start = () => { if (!rafId) rafId = requestAnimationFrame(draw); };
    const stop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } };

    resize();
    if (prefersReducedMotion.matches) {
      draw();
    } else {
      start();
    }

    let resizeFrame = 0;
    window.addEventListener("resize", () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resize();
        if (prefersReducedMotion.matches || visible) start();
      });
    });

    if (hero && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !prefersReducedMotion.matches) start();
        else stop();
      }, { threshold: 0 });
      observer.observe(hero);
    }

    prefersReducedMotion.addEventListener("change", (event) => {
      if (event.matches) { stop(); draw(); }
      else start();
    });
  };

  initParticles();
/* ----------------------------------------------------------------------
     Aparición de elementos al hacer scroll (base fiable con IntersectionObserver)
  ---------------------------------------------------------------------- */
  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealElements.forEach((element) => revealObserver.observe(element));
    // Red de seguridad: si algo no se observa (p. ej. ya visible), aseguramos visibilidad.
    window.setTimeout(() => {
      revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight) element.classList.add("is-visible");
      });
    }, 1500);
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }


  /* ----------------------------------------------------------------------
     Vídeos de fondo: reproducir solo cuando están a la vista
  ---------------------------------------------------------------------- */
  const backgroundVideos = $$("video");
  if (backgroundVideos.length) {
    const playSafe = (video) => {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    };

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting && !prefersReducedMotion.matches) playSafe(video);
            else video.pause();
          });
        },
        { threshold: 0.15 },
      );
      backgroundVideos.forEach((video) => videoObserver.observe(video));
    }

    if (prefersReducedMotion.matches) {
      backgroundVideos.forEach((video) => video.pause());
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) backgroundVideos.forEach((video) => video.pause());
    });
  }

  /* ----------------------------------------------------------------------
     Control de pausa de las escenas SVG animadas
  ---------------------------------------------------------------------- */
  const motionToggles = $$(".motion-toggle");

  const setMotionPaused = (card, paused) => {
    const svg = $(".motion-art svg", card);
    const button = $(".motion-toggle", card);
    if (!svg || !button) return;
    const icon = $("span:first-child", button);
    const label = $(".motion-toggle-label", button);

    card.classList.toggle("is-paused", paused);
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute("aria-label", `${paused ? "Reanudar" : "Pausar"} animación de ${card.dataset.motionName}`);
    if (icon) icon.textContent = paused ? "▶" : "Ⅱ";
    if (label) label.textContent = paused ? "Reproducir" : "Pausar";

    if (typeof svg.pauseAnimations === "function") {
      if (paused) svg.pauseAnimations();
      else svg.unpauseAnimations();
    }
  };

  const applyMotionPreference = (reduceMotion) => {
    motionToggles.forEach((button) => {
      const card = button.closest(".motion-card");
      if (!card) return;
      button.disabled = reduceMotion;
      if (reduceMotion) setMotionPaused(card, true);
      else if (button.getAttribute("aria-pressed") === "true") setMotionPaused(card, false);
    });
  };

  motionToggles.forEach((button) => {
    const card = button.closest(".motion-card");
    if (!card) return;
    const label = button.getAttribute("aria-label") || "";
    card.dataset.motionName = label.replace(/^(Pausar|Reanudar) animación de /, "");
    button.addEventListener("click", () => {
      setMotionPaused(card, button.getAttribute("aria-pressed") !== "true");
    });
  });

  applyMotionPreference(prefersReducedMotion.matches);
  prefersReducedMotion.addEventListener("change", (event) => applyMotionPreference(event.matches));
/* ----------------------------------------------------------------------
     Formulario de contacto (validación + apertura de correo)
  ---------------------------------------------------------------------- */
  const CONTACT_EMAIL = "comienzia@gmail.com";
  const contactForm = $("#contact-form");
  const formNote = $("#form-note");

  if (contactForm) {
    const serviceCheckboxes = $$('input[name="services"]', contactForm);

    const validateServices = () => {
      const hasSelection = serviceCheckboxes.some((checkbox) => checkbox.checked);
      if (serviceCheckboxes.length) {
        serviceCheckboxes[0].setCustomValidity(
          hasSelection ? "" : "Selecciona al menos un servicio que te interese.",
        );
      }
    };

    serviceCheckboxes.forEach((checkbox) => checkbox.addEventListener("change", validateServices));

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      validateServices();
      if (!contactForm.reportValidity()) return;

      const data = new FormData(contactForm);
      const selectedServices = data.getAll("services");
      const subject = encodeURIComponent(`Consulta desde la web: ${data.get("businessType") || "Nueva empresa"}`);
      const body = encodeURIComponent(
        `Nombre: ${data.get("name")}\nEmpresa: ${data.get("business")}\nSector: ${data.get("businessType")}\nServicios de interés:\n- ${selectedServices.join("\n- ")}\nCorreo: ${data.get("email")}\n\nReto o proceso a mejorar:\n${data.get("message")}`,
      );

      if (formNote) formNote.textContent = "Abriendo tu gestor de correo…";
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  /* ----------------------------------------------------------------------
     GSAP: entrada del hero y efectos ligados al scroll
  ---------------------------------------------------------------------- */
  const initGsap = () => {
    if (!hasGsap() || prefersReducedMotion.matches) return;
    const gsap = window.gsap;
    if (hasScrollTrigger()) gsap.registerPlugin(window.ScrollTrigger);

    const hero = $("#inicio");

    if (hero) {
      gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
        .from(".site-header", { yPercent: -100, opacity: 0, duration: 0.7 })
        .from(".hero .eyebrow", { y: 20, opacity: 0 }, "-=0.35")
        .from(".hero h1", { y: 36, opacity: 0 }, "-=0.65")
        .from(".hero-description", { y: 24, opacity: 0 }, "-=0.65")
        .from(".hero-actions", { y: 20, opacity: 0 }, "-=0.6")
        .from(".hero-note", { y: 18, opacity: 0 }, "-=0.6")
        .from(".hero-visual", { scale: 0.92, opacity: 0, duration: 1.1 }, "-=0.9")
        .from(".hero-bottom", { opacity: 0, y: 14, duration: 0.7 }, "-=0.6");
    }

    if (!hasScrollTrigger()) return;
    const ScrollTrigger = window.ScrollTrigger;

    const isDesktop = window.matchMedia("(min-width: 921px)").matches;
    if (hero && isDesktop) {
      gsap.to(".hero-visual", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }

    const demoInner = $(".demo-inner");
    if (demoInner) {
      gsap.from($$(".demo-inner > *"), {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: "#demo", start: "top 72%" },
      });
    }
  };

  initGsap();
})();

(() => {
  "use strict";

  const body = document.body;
  const page = body.dataset.page || "home";
  const root = body.dataset.root || ".";
  const storageKey = "signal-and-self-preferences";
  const savedKey = "signal-and-self-saved-items";
  const pageRoutes = {
    home: ["Overview", "index.html"],
    initiatives: ["Work", "pages/initiatives.html"],
    notes: ["Field notes", "pages/field-notes.html"],
    profile: ["About", "pages/profile.html"]
  };

  let data = null;
  let preferences = loadJSON(storageKey, {
    name: "",
    audience: "curious",
    goal: "",
    theme: "signal"
  });
  let savedItems = new Set(loadJSON(savedKey, []));

  function pathFromRoot(path) {
    if (/^(https?:|mailto:|#)/.test(path)) return path;
    return root === "." ? path : `${root}/${path}`;
  }

  function normalizeLegacyLink(link = "") {
    const replacements = {
      "about.html": "pages/profile.html",
      "dashboard.html": "pages/insights.html",
      "reflections.html": "pages/field-notes.html",
      "projects.html": "pages/initiatives.html",
      "timeline.html": "pages/journey.html"
    };
    const [file, hash] = link.split("#");
    const next = replacements[file] || file;
    return pathFromRoot(hash ? `${next}#${hash}` : next);
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function loadJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function savePreferences() {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }

  function query(selector, context = document) {
    return context.querySelector(selector);
  }

  function queryAll(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  }

  function setText(selector, value) {
    const element = query(selector);
    if (element) element.textContent = value;
  }

  function formatDate(dateString, options = {}) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options
    }).format(date);
  }

  function injectShell() {
    const headerHost = query("#site-header");
    const footerHost = query("#site-footer");
    if (headerHost) {
      const nav = Object.entries(pageRoutes)
        .map(([id, [label, href]]) => `
          <a href="${pathFromRoot(href)}" ${id === page ? 'aria-current="page"' : ""}>${label}</a>
        `)
        .join("");

      headerHost.className = "site-header-wrap site-shell";
      headerHost.innerHTML = `
        <header class="site-header">
          <a class="brand" href="${pathFromRoot("index.html")}" aria-label="Signal & Self home">
            <span class="brand-mark">S/S</span>
            <span class="brand-copy">
              <strong>Signal & Self</strong>
              <small>Digital fieldbook</small>
            </span>
          </a>
          <nav class="site-nav" id="site-nav" aria-label="Primary navigation">${nav}</nav>
          <div class="header-actions">
            <button class="icon-button" type="button" data-open-search aria-label="Search the fieldbook">
              <span class="icon-glyph">⌕</span><span class="header-label">Search</span>
            </button>
            <button class="icon-button" type="button" data-cycle-theme aria-label="Change color theme">
              <span class="icon-glyph">◐</span>
            </button>
            <button class="icon-button" type="button" data-open-personalize aria-label="Personalize this website">
              <span class="icon-glyph">✦</span><span class="header-label">For you</span>
            </button>
            <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">
              <span class="icon-glyph">≡</span><span class="visually-hidden">Menu</span>
            </button>
          </div>
        </header>
      `;
    }

    if (footerHost) {
      footerHost.className = "site-footer site-shell";
      footerHost.innerHTML = `
        <div class="footer-card" data-reveal>
          <p class="eyebrow">Keep the signal useful</p>
          <h2>Technology gets better when responsibility is designed in.</h2>
          <p>This fieldbook is a living record of what I am learning, building, questioning, and improving as I move toward electrical engineering.</p>
          <div class="button-row">
            <a class="button button-accent" href="${pathFromRoot("pages/initiatives.html")}">Explore initiatives</a>
            <a class="button button-quiet" href="https://github.com/Mini34">View GitHub</a>
            <button class="button" type="button" data-open-personalize>Personalize your view</button>
          </div>
        </div>
        <div class="footer-bottom">
          <span>Signal & Self · Mina Soliman · <span data-current-year></span></span>
          <span>Built with curiosity, evidence, and care</span>
          <a href="#top">Back to top ↑</a>
        </div>
      `;
    }

    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="dialog" id="personalize-dialog" aria-labelledby="personalize-title">
        <div class="dialog-inner">
          <div class="dialog-header">
            <div>
              <p class="eyebrow">Make it yours</p>
              <h2 id="personalize-title">Tune the fieldbook.</h2>
            </div>
            <button class="dialog-close" type="button" data-close-dialog aria-label="Close personalization">×</button>
          </div>
          <form class="form-grid" id="personalize-form">
            <div class="form-field">
              <label for="visitor-name">What should I call you? <span class="muted">Optional</span></label>
              <input id="visitor-name" name="name" autocomplete="given-name" maxlength="32" placeholder="Your first name">
            </div>
            <div class="form-field">
              <label for="visitor-audience">What brings you here?</label>
              <select id="visitor-audience" name="audience"></select>
            </div>
            <div class="form-field">
              <label for="visitor-goal">Your current digital goal <span class="muted">Optional</span></label>
              <input id="visitor-goal" name="goal" maxlength="80" placeholder="e.g. Build stronger privacy habits">
            </div>
            <div class="form-field">
              <span class="form-legend">Choose an atmosphere</span>
              <div class="theme-options" id="theme-options"></div>
            </div>
            <div class="button-row">
              <button class="button button-primary" type="submit">Save my view</button>
              <button class="button button-quiet no-arrow" type="button" data-reset-personalization>Reset</button>
            </div>
          </form>
        </div>
      </dialog>
      <dialog class="dialog" id="search-dialog" aria-labelledby="search-title">
        <div class="dialog-inner">
          <div class="dialog-header">
            <div>
              <p class="eyebrow">Fieldbook search</p>
              <h2 id="search-title">Find a signal.</h2>
            </div>
            <button class="dialog-close" type="button" data-close-dialog aria-label="Close search">×</button>
          </div>
          <label class="search-field" for="global-search">
            <span>⌕</span>
            <input id="global-search" autocomplete="off" placeholder="Try privacy, AI, accessibility…">
          </label>
          <div class="search-results" id="global-search-results" aria-live="polite"></div>
        </div>
      </dialog>
      <dialog class="dialog" id="reader-dialog" aria-labelledby="reader-title">
        <div class="dialog-inner" id="reader-content"></div>
      </dialog>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    `);

    setText("[data-current-year]", new Date().getFullYear());
  }

  function bindShellEvents() {
    const menuButton = query(".menu-button");
    const nav = query(".site-nav");
    menuButton?.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    queryAll(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        nav?.classList.remove("is-open");
        menuButton?.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-open-personalize]");
      if (opener) openPersonalization();

      if (event.target.closest("[data-open-search]")) openSearch();

      const closeButton = event.target.closest("[data-close-dialog]");
      if (closeButton) closeButton.closest("dialog")?.close();

      if (event.target.closest("[data-cycle-theme]")) cycleTheme();

      const saveButton = event.target.closest("[data-save-item]");
      if (saveButton) toggleSaved(saveButton.dataset.saveItem, saveButton);
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      if ((event.key === "/" && !isTyping) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        openSearch();
      }
    });

    queryAll("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener("close", () => body.classList.remove("is-locked"));
    });

    query("#personalize-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      preferences = {
        ...preferences,
        name: String(form.get("name") || "").trim(),
        audience: String(form.get("audience") || "curious"),
        goal: String(form.get("goal") || "").trim()
      };
      savePreferences();
      applyPersonalization();
      query("#personalize-dialog")?.close();
      showToast("Your view has been personalized on this device.");
    });

    query("[data-reset-personalization]")?.addEventListener("click", () => {
      preferences = { name: "", audience: "curious", goal: "", theme: "signal" };
      savePreferences();
      applyTheme("signal");
      applyPersonalization();
      populatePersonalizationForm();
      showToast("Personalization reset.");
    });

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
    updateScrollProgress();
    bindPressEffects();
  }

  function bindPressEffects() {
    const selector = [
      ".button",
      ".icon-button",
      ".menu-button",
      ".dialog-close",
      ".chip",
      ".filter-button",
      ".save-button",
      ".theme-option",
      ".search-result",
      ".resource-link",
      ".path-card",
      ".case-tab",
      ".system-node",
      ".explore-rail a",
      ".signal-evidence summary",
      ".score-method summary",
      ".site-nav a"
    ].join(",");

    const addRipple = (control, clientX, clientY) => {
      if (!control || control.matches(":disabled") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const bounds = control.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "press-ripple";
      ripple.style.setProperty("--ripple-x", `${clientX ? clientX - bounds.left : bounds.width / 2}px`);
      ripple.style.setProperty("--ripple-y", `${clientY ? clientY - bounds.top : bounds.height / 2}px`);
      control.append(ripple);
      window.setTimeout(() => ripple.remove(), 620);
    };

    document.addEventListener("pointerdown", (event) => {
      const control = event.target.closest(selector);
      if (control) addRipple(control, event.clientX, event.clientY);
    });

    document.addEventListener("click", (event) => {
      const control = event.target.closest(selector);
      if (!control || control.matches(":disabled")) return;
      if (event.detail === 0) addRipple(control);
      control.classList.remove("interaction-pop");
      void control.offsetWidth;
      control.classList.add("interaction-pop");
      window.setTimeout(() => control.classList.remove("interaction-pop"), 280);
    });
  }

  function updateScrollProgress() {
    const progress = query(".scroll-progress");
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? window.scrollY / available : 0;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;

    const cue = query(".scroll-cue");
    if (cue) {
      const isFixedCue = getComputedStyle(cue).position === "fixed";
      const fadeDistance = Math.max(260, window.innerHeight * 0.38);
      const cueProgress = isFixedCue ? Math.min(1, Math.max(0, window.scrollY / fadeDistance)) : 0;
      cue.style.setProperty("--cue-opacity", String(1 - cueProgress));
      cue.style.setProperty("--cue-shift", `${cueProgress * 14}px`);
      cue.classList.toggle("is-hidden", cueProgress >= 0.98);
      cue.tabIndex = cueProgress >= 0.98 ? -1 : 0;
    }
  }

  function initReveal() {
    const elements = queryAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });
    elements.forEach((element) => observer.observe(element));
  }

  function showToast(message) {
    const toast = query("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function applyTheme(theme = preferences.theme, animate = true) {
    preferences.theme = theme;
    const html = document.documentElement;
    if (animate) {
      html.classList.remove("is-theme-switching");
      void html.offsetWidth;
      html.classList.add("is-theme-switching");
      clearTimeout(applyTheme.timeout);
      applyTheme.timeout = window.setTimeout(() => html.classList.remove("is-theme-switching"), 440);
    }
    html.dataset.theme = theme;
    const themeColor = { signal: "#f4f0e8", midnight: "#0b1020", quiet: "#efeee9" }[theme] || "#f4f0e8";
    const themeMeta = query('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = themeColor;
    savePreferences();
    queryAll(".theme-option").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.theme === theme);
    });
  }

  function cycleTheme() {
    const themes = data?.personalization?.themes?.map((theme) => theme.id) || ["signal", "midnight", "quiet"];
    const currentIndex = Math.max(0, themes.indexOf(preferences.theme));
    const next = themes[(currentIndex + 1) % themes.length];
    applyTheme(next);
    showToast(`${next.charAt(0).toUpperCase() + next.slice(1)} atmosphere applied.`);
  }

  function populatePersonalizationForm() {
    if (!data) return;
    const nameInput = query("#visitor-name");
    const goalInput = query("#visitor-goal");
    const audienceSelect = query("#visitor-audience");
    const themeOptions = query("#theme-options");

    if (nameInput) nameInput.value = preferences.name || "";
    if (goalInput) goalInput.value = preferences.goal || "";
    if (audienceSelect) {
      audienceSelect.innerHTML = data.personalization.audiences
        .map((audience) => `<option value="${audience.id}" ${audience.id === preferences.audience ? "selected" : ""}>${escapeHTML(audience.label)}</option>`)
        .join("");
    }
    if (themeOptions) {
      const swatches = {
        signal: ["#3155e7", "#ff6b57", "#d8f95f"],
        midnight: ["#0b1020", "#7892ff", "#ff8878"],
        quiet: ["#efeee9", "#4f6758", "#9f695d"]
      };
      themeOptions.innerHTML = data.personalization.themes.map((theme) => `
        <button class="theme-option ${theme.id === preferences.theme ? "is-active" : ""}" type="button" data-theme="${theme.id}">
          <span class="theme-swatch">${swatches[theme.id].map((color) => `<i style="--swatch:${color}"></i>`).join("")}</span>
          <span><strong>${escapeHTML(theme.label)}</strong><br><small>${escapeHTML(theme.description)}</small></span>
        </button>
      `).join("");
      queryAll(".theme-option", themeOptions).forEach((button) => {
        button.addEventListener("click", () => applyTheme(button.dataset.theme));
      });
    }
  }

  function openPersonalization() {
    populatePersonalizationForm();
    const dialog = query("#personalize-dialog");
    if (!dialog) return;
    body.classList.add("is-locked");
    dialog.showModal();
    setTimeout(() => query("#visitor-name")?.focus(), 50);
  }

  function applyPersonalization() {
    if (!data) return;
    const audience = data.personalization.audiences.find((item) => item.id === preferences.audience) || data.personalization.audiences[0];
    const greeting = preferences.name ? `${audience.greeting}, ${preferences.name}.` : `${audience.greeting}.`;
    queryAll("[data-personal-greeting]").forEach((element) => { element.textContent = greeting; });
    queryAll("[data-personal-intro]").forEach((element) => { element.textContent = audience.intro; });
    queryAll("[data-personal-goal]").forEach((element) => {
      element.textContent = preferences.goal || "Choose a digital goal to make this fieldbook feel more relevant to you.";
    });
    queryAll("[data-personal-goal-wrap]").forEach((element) => {
      element.hidden = !preferences.goal;
    });
  }

  function openSearch() {
    const dialog = query("#search-dialog");
    if (!dialog) return;
    body.classList.add("is-locked");
    dialog.showModal();
    const input = query("#global-search");
    if (input) {
      input.value = "";
      renderSearchResults("");
      input.oninput = () => renderSearchResults(input.value);
      setTimeout(() => input.focus(), 50);
    }
  }

  function searchIndex() {
    if (!data) return [];
    return [
      ...data.reflections.map((item) => ({
        type: "Field note",
        title: item.title,
        detail: `${item.category} · ${formatDate(item.date)}`,
        terms: `${item.title} ${item.category} ${item.tags.join(" ")} ${item.content.join(" ")}`,
        href: pathFromRoot(`pages/field-notes.html#${item.id}`)
      })),
      ...data.projects.map((item) => ({
        type: "Initiative",
        title: item.title,
        detail: `${item.status} · ${item.skills.join(" · ")}`,
        terms: `${item.title} ${item.status} ${item.skills.join(" ")} ${item.description}`,
        href: pathFromRoot(`pages/initiatives.html#${item.id}`)
      })),
      ...data.categories.map((item) => ({
        type: "Practice area",
        title: item.title,
        detail: item.focus,
        terms: `${item.title} ${item.description} ${item.focus}`,
        href: pathFromRoot("pages/profile.html#framework")
      }))
    ];
  }

  function renderSearchResults(searchTerm) {
    const host = query("#global-search-results");
    if (!host) return;
    const term = searchTerm.trim().toLowerCase();
    const results = searchIndex()
      .filter((item) => !term || item.terms.toLowerCase().includes(term))
      .slice(0, 7);
    host.innerHTML = results.length ? results.map((item) => `
      <a class="search-result" href="${item.href}">
        <span>${escapeHTML(item.type)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.detail)}</small>
      </a>
    `).join("") : `<div class="empty-state">No signal found. Try a broader word.</div>`;
  }

  function toggleSaved(id, button) {
    if (savedItems.has(id)) {
      savedItems.delete(id);
      button.classList.remove("is-saved");
      button.setAttribute("aria-label", "Save this item");
      showToast("Removed from your saved list.");
    } else {
      savedItems.add(id);
      button.classList.add("is-saved");
      button.setAttribute("aria-label", "Remove this saved item");
      showToast("Saved on this device.");
    }
    localStorage.setItem(savedKey, JSON.stringify([...savedItems]));
  }

  function renderHome() {
    setText("[data-site-status]", `${data.site.status} · Updated ${formatDate(data.site.lastUpdated)}`);
    setText("[data-reflection-count]", data.reflections.length);
    setText("[data-project-count]", data.projects.length);
    setText("[data-update-count]", data.updates.length);
    setText("[data-score-review-date]", formatDate(data.site.lastUpdated));

    const signalHost = query("#practice-signals");
    if (signalHost) {
      signalHost.innerHTML = data.practiceAreas.map((area, index) => `
        <article class="card signal-card interactive-card">
          <div>
            <span class="card-index">0${index + 1} · ${escapeHTML(area.signal)}</span>
            <h3>${escapeHTML(area.label)}</h3>
            <p>${escapeHTML(area.description)}</p>
          </div>
          <div>
            <div class="signal-score"><strong>${area.score}</strong><span class="mono-label">self-check</span></div>
            <div class="signal-meter" aria-label="${escapeHTML(area.label)} progress ${area.score} percent"><span style="--progress:${area.score}%"></span></div>
            <details class="signal-evidence">
              <summary>See the evidence</summary>
              <p>${escapeHTML(area.evidence)}</p>
            </details>
          </div>
        </article>
      `).join("");
    }

    const featured = data.reflections.find((item) => item.featured) || data.reflections[0];
    setText("#featured-note-title", featured.title);
    setText("#featured-note-copy", featured.content[0]);
    const featuredLink = query("#featured-note-link");
    if (featuredLink) featuredLink.href = pathFromRoot(`pages/field-notes.html#${featured.id}`);

    const nowHost = query("#now-grid");
    if (nowHost) {
      nowHost.innerHTML = [
        ["Learning", data.now.learning],
        ["Building", data.now.building],
        ["Asking", data.now.question]
      ].map(([label, value]) => `<div class="now-item"><span>${label}</span><strong>${escapeHTML(value)}</strong></div>`).join("");
    }

    renderFeaturedProject();
    initExploreRail();
  }

  function renderFeaturedProject() {
    const host = query("#featured-project");
    const project = data.projects.find((item) => item.featured) || data.projects.find((item) => item.status === "Completed");
    if (!host || !project) return;
    const views = project.caseStudy || [];
    const defaultView = views[0];
    host.innerHTML = `
      <article class="case-study-shell" data-case-study>
        <div class="case-system" aria-label="Interactive architecture map for ${escapeHTML(project.title)}">
          <div class="case-system-topline">
            <span class="status-badge" data-status="${escapeHTML(project.status)}">${escapeHTML(project.status)}</span>
            <span class="mono-label">${escapeHTML(project.artifact || "Project artifact")}</span>
          </div>
          <div class="system-map">
            <button class="system-node is-active" type="button" data-case-tab="challenge"><span>01</span><strong>User need</strong></button>
            <span class="system-arrow" aria-hidden="true">→</span>
            <button class="system-node" type="button" data-case-tab="architecture"><span>02</span><strong>Bounded system</strong></button>
            <span class="system-arrow" aria-hidden="true">→</span>
            <button class="system-node" type="button" data-case-tab="evidence"><span>03</span><strong>Visible proof</strong></button>
          </div>
          <div class="guardrail-track" aria-hidden="true"><span>Policy</span><span>Tools</span><span>Tests</span><span>Escalation</span></div>
          <p class="case-system-hint">Select a node to inspect the decision behind it.</p>
        </div>
        <div class="case-story">
          <p class="mono-label">${escapeHTML(project.title)}</p>
          <div class="case-tabs" role="tablist" aria-label="Project perspectives">
            ${views.map((view, index) => `<button class="case-tab ${index === 0 ? "is-active" : ""}" id="case-tab-${escapeHTML(view.id)}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="case-panel" data-case-tab="${escapeHTML(view.id)}">${escapeHTML(view.label)}</button>`).join("")}
          </div>
          <div class="case-panel" id="case-panel" role="tabpanel" aria-live="polite" aria-labelledby="case-tab-${escapeHTML(defaultView?.id || "challenge")}"></div>
          <div class="tag-row">${project.skills.map((skill) => `<span class="tag">${escapeHTML(skill)}</span>`).join("")}</div>
          <div class="button-row">
            <a class="button button-primary" href="${project.link}" target="_blank" rel="noreferrer">View tested repository</a>
            <a class="button button-quiet" href="${pathFromRoot("pages/initiatives.html")}">Browse all work</a>
          </div>
        </div>
      </article>
    `;

    const activate = (id, moveFocus = false) => {
      const view = views.find((item) => item.id === id) || defaultView;
      const panel = query("#case-panel", host);
      if (!view || !panel) return;
      panel.setAttribute("aria-labelledby", `case-tab-${view.id}`);
      panel.innerHTML = `
        <p class="eyebrow">${escapeHTML(view.kicker)}</p>
        <h3>${escapeHTML(view.title)}</h3>
        <p>${escapeHTML(view.copy)}</p>
        <ul>${view.points.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
      `;
      queryAll("[data-case-tab]", host).forEach((control) => control.classList.toggle("is-active", control.dataset.caseTab === view.id));
      queryAll(".case-tab", host).forEach((tab) => {
        const active = tab.dataset.caseTab === view.id;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && moveFocus) tab.focus();
      });
    };

    host.addEventListener("click", (event) => {
      const control = event.target.closest("[data-case-tab]");
      if (control) activate(control.dataset.caseTab);
    });
    host.addEventListener("keydown", (event) => {
      const tab = event.target.closest(".case-tab");
      if (!tab || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const current = views.findIndex((item) => item.id === tab.dataset.caseTab);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      activate(views[(current + direction + views.length) % views.length].id, true);
    });

    const shell = query(".case-study-shell", host);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    shell?.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches || event.pointerType === "touch") return;
      const bounds = shell.getBoundingClientRect();
      shell.style.setProperty("--case-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 7}deg`);
      shell.style.setProperty("--case-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -5}deg`);
    });
    shell?.addEventListener("pointerleave", () => {
      shell.style.setProperty("--case-x", "0deg");
      shell.style.setProperty("--case-y", "0deg");
    });
    activate(defaultView?.id);
  }

  function initExploreRail() {
    const rail = query(".explore-rail");
    if (!rail) return;
    const links = queryAll("[data-rail-target]", rail);
    const sections = links.map((link) => query(`#${CSS.escape(link.dataset.railTarget)}`)).filter(Boolean);
    const setActive = (id) => {
      const index = links.findIndex((link) => link.dataset.railTarget === id);
      links.forEach((link) => {
        if (link.dataset.railTarget === id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      rail.style.setProperty("--rail-progress", `${Math.max(0, index) / Math.max(1, links.length - 1) * 100}%`);
    };
    if (!("IntersectionObserver" in window)) return setActive(links[0]?.dataset.railTarget);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -55%", threshold: [0, 0.15, 0.4] });
    sections.forEach((section) => observer.observe(section));
    setActive(links[0]?.dataset.railTarget);
  }

  function renderProfile() {
    setText("#profile-name", data.profile.fullName);
    setText("#profile-tagline", data.profile.tagline);
    const story = query("#profile-story");
    if (story) story.innerHTML = data.profile.aboutText.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");

    const focusHost = query("#focus-areas");
    if (focusHost) {
      focusHost.innerHTML = data.profile.focusAreas.map((area, index) => `
        <article class="card interactive-card">
          <span class="card-index">Focus 0${index + 1}</span>
          <h3>${escapeHTML(area.title)}</h3>
          <p>${escapeHTML(area.text)}</p>
        </article>
      `).join("");
    }

    const valuesHost = query("#values-grid");
    if (valuesHost) {
      valuesHost.innerHTML = data.principles.map((principle, index) => `
        <article class="value-card">
          <span class="mono-label">Commitment ${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHTML(principle)}</strong>
        </article>
      `).join("");
    }

    const frameworkHost = query("#framework-grid");
    if (frameworkHost) {
      frameworkHost.innerHTML = data.categories.map((category, index) => `
        <article class="card interactive-card">
          <span class="card-index">0${index + 1}</span>
          <h3>${escapeHTML(category.title)}</h3>
          <p>${escapeHTML(category.description)}</p>
          <div class="tag-row"><span class="tag">${escapeHTML(category.focus)}</span></div>
        </article>
      `).join("");
    }

    const conductHost = query("#conduct-list");
    if (conductHost) {
      conductHost.innerHTML = data.codeOfConduct.map((rule, index) => `
        <div class="resource-link"><div><span>Rule ${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(rule)}</strong></div></div>
      `).join("");
    }
  }

  function renderInsights() {
    const primaryStats = data.stats.slice(0, 4);
    const statsHost = query("#primary-stats");
    if (statsHost) {
      statsHost.innerHTML = primaryStats.map((stat) => `
        <article class="stat-tile">
          <span class="mono-label">${escapeHTML(stat.period)}</span>
          <div class="stat-value"><span data-count-to="${stat.value}">0</span><small>${escapeHTML(stat.suffix)}</small></div>
          <p>${escapeHTML(stat.label)}</p>
        </article>
      `).join("");
      animateCounters();
    }

    const secondaryHost = query("#secondary-stats");
    if (secondaryHost) {
      secondaryHost.innerHTML = data.stats.slice(4).map((stat) => {
        const progress = Math.min(100, Math.round((stat.value / stat.goal) * 100));
        return `
          <article class="card interactive-card">
            <span class="card-index">${escapeHTML(stat.period)}</span>
            <div class="signal-score"><strong>${stat.value}${escapeHTML(stat.suffix)}</strong><span class="mono-label">Goal ${stat.goal}</span></div>
            <h3>${escapeHTML(stat.label)}</h3>
            <p>${escapeHTML(stat.description)}</p>
            <div class="progress-track"><span style="--progress:${progress}%"></span></div>
          </article>
        `;
      }).join("");
    }

    const habitHost = query("#habit-list");
    if (habitHost) {
      habitHost.innerHTML = data.habits.map((habit) => `
        <div class="habit-item">
          <div class="habit-topline"><strong>${escapeHTML(habit.label)}</strong><span>${escapeHTML(habit.frequency)} · ${habit.progress}%</span></div>
          <div class="progress-track"><span style="--progress:${habit.progress}%"></span></div>
        </div>
      `).join("");
    }

    renderChart("monthly");
    queryAll("[data-period]").forEach((button) => {
      button.addEventListener("click", () => {
        queryAll("[data-period]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderChart(button.dataset.period);
      });
    });

    renderAdoptionMap();
    renderGlobalStats();
  }

  function animateCounters() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    queryAll("[data-count-to]").forEach((element) => {
      const target = Number(element.dataset.countTo);
      if (reduced) {
        element.textContent = target;
        return;
      }
      const start = performance.now();
      const duration = 800;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function renderChart(periodKey) {
    const period = data.dashboard.periods[periodKey];
    if (!period) return;
    setText("#chart-summary", period.summary);
    const host = query("#learning-chart");
    if (host) {
      const max = Math.max(...period.points.map((point) => point.value), 1);
      host.innerHTML = period.points.map((point) => `
        <div class="chart-column">
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="--bar-height:${Math.max(6, (point.value / max) * 100)}%"><strong>${point.value}h</strong></div>
          </div>
          <span title="${escapeHTML(point.label)}">${escapeHTML(point.label)}</span>
        </div>
      `).join("");
    }
    const focusHost = query("#chart-focus");
    if (focusHost) {
      focusHost.innerHTML = period.focus.map((item, index) => `
        <div class="resource-link"><div><span>Signal 0${index + 1}</span><strong>${escapeHTML(item)}</strong></div></div>
      `).join("");
    }
  }

  function renderAdoptionMap() {
    const adoption = data.dashboard.digitalAdoption;
    const input = query("#adoption-year");
    const map = query("#adoption-map");
    if (!input || !map) return;
    input.min = adoption.minYear;
    input.max = adoption.maxYear;
    input.value = adoption.maxYear;
    const positions = {
      NAC: [18, 31, "North America"],
      LCN: [28, 66, "Latin America"],
      ECS: [52, 25, "Europe & Central Asia"],
      MNA: [56, 47, "Middle East & North Africa"],
      SSF: [53, 69, "Sub-Saharan Africa"],
      SAS: [68, 55, "South Asia"],
      EAS: [80, 36, "East Asia & Pacific"]
    };
    map.innerHTML = `
      <img src="${pathFromRoot("assets/images/digital-adoption-map.webp")}" alt="Stylized world map used to compare regional internet adoption">
      <div class="map-overlay"></div>
      ${Object.entries(positions).map(([code, [left, top, label]]) => `
        <span class="map-region" data-region="${code}" style="left:${left}%;top:${top}%" title="${label}"></span>
      `).join("")}
    `;

    const update = () => {
      const year = Number(input.value);
      setText("#adoption-year-label", year);
      const summaryHost = query("#adoption-summary");
      const values = Object.entries(positions).map(([code, [, , label]]) => {
        const value = adoption.series[code]?.[String(year)] ?? null;
        const dot = query(`[data-region="${code}"]`, map);
        if (dot) {
          dot.textContent = value === null ? "—" : `${Math.round(value)}%`;
          dot.style.setProperty("--dot-size", `${value === null ? 28 : Math.max(32, value * 0.72)}px`);
          dot.style.opacity = value === null ? "0.38" : "1";
          dot.title = `${label}: ${value === null ? "series not available" : `${value}% online`}`;
        }
        return { code, label, value };
      });
      if (summaryHost) {
        summaryHost.innerHTML = values.map((item) => `
          <div class="map-summary-item"><strong>${item.value === null ? "—" : `${Math.round(item.value)}%`}</strong><span>${escapeHTML(item.label)}</span></div>
        `).join("");
      }
    };
    input.addEventListener("input", update);
    update();
    setText("#adoption-note", adoption.dotScaleLabel);
    setText("#adoption-source", adoption.sourceNote);
  }

  function renderGlobalStats() {
    const host = query("#global-context-grid");
    if (host) {
      host.innerHTML = data.dashboard.globalStats.map((stat) => `
        <article class="card interactive-card">
          <span class="card-index">${escapeHTML(stat.sourceLabel)}</span>
          <div class="stat-value">${escapeHTML(stat.value)}</div>
          <h3>${escapeHTML(stat.title)}</h3>
          <p>${escapeHTML(stat.description)}</p>
          <a class="button button-small" href="${stat.url}" target="_blank" rel="noreferrer">View source</a>
        </article>
      `).join("");
    }

    const resourceHost = query("#resource-list");
    if (resourceHost) {
      resourceHost.innerHTML = data.dashboard.learnMore.map((resource) => `
        <a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">
          <div><span>${escapeHTML(resource.tag)}</span><strong>${escapeHTML(resource.title)}</strong><small>${escapeHTML(resource.description)}</small></div>
        </a>
      `).join("");
    }
  }

  function reflectionCard(item) {
    return `
      <article class="card reflection-card" id="${item.id}">
        <div class="card-topline">
          <span class="card-date">${formatDate(item.date)} · ${escapeHTML(item.readTime || "2 min")}</span>
          <button class="save-button ${savedItems.has(item.id) ? "is-saved" : ""}" type="button" data-save-item="${item.id}" aria-label="${savedItems.has(item.id) ? "Remove this saved item" : "Save this item"}">◇</button>
        </div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.content[0])}</p>
        <div class="card-footer-row">
          <div class="tag-row">${item.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
          <button class="button button-small button-quiet" type="button" data-read-note="${item.id}">Read note</button>
        </div>
      </article>
    `;
  }

  function renderNotes() {
    let activeCategory = "All";
    let searchTerm = "";
    const categories = ["All", ...new Set(data.reflections.map((item) => item.category))];
    const filterHost = query("#note-filters");
    if (filterHost) {
      filterHost.innerHTML = categories.map((category) => `<button class="filter-button ${category === "All" ? "is-active" : ""}" type="button" data-note-category="${escapeHTML(category)}">${escapeHTML(category.replace("Reflection and self-improvement", "Self-improvement").replace("Privacy and security awareness", "Privacy & security").replace("Responsible online participation", "Participation"))}</button>`).join("");
    }

    const render = () => {
      const filtered = data.reflections.filter((item) => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const haystack = `${item.title} ${item.category} ${item.tags.join(" ")} ${item.content.join(" ")}`.toLowerCase();
        return matchesCategory && haystack.includes(searchTerm.toLowerCase());
      });
      const host = query("#reflection-grid");
      if (host) host.innerHTML = filtered.length ? filtered.map(reflectionCard).join("") : `<div class="empty-state">No field notes match that signal.</div>`;
      setText("#note-result-count", `${filtered.length} ${filtered.length === 1 ? "note" : "notes"}`);
    };

    filterHost?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-note-category]");
      if (!button) return;
      activeCategory = button.dataset.noteCategory;
      queryAll("[data-note-category]", filterHost).forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
    query("#note-search")?.addEventListener("input", (event) => {
      searchTerm = event.target.value.trim();
      render();
    });
    query("#random-note")?.addEventListener("click", () => {
      const random = data.reflections[Math.floor(Math.random() * data.reflections.length)];
      openReader(random);
    });
    query("#reflection-grid")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-read-note]");
      if (!button) return;
      openReader(data.reflections.find((item) => item.id === button.dataset.readNote));
    });
    render();

    const hashId = window.location.hash.slice(1);
    if (hashId) setTimeout(() => query(`#${CSS.escape(hashId)}`)?.scrollIntoView({ block: "center" }), 100);
  }

  function openReader(item) {
    if (!item) return;
    const host = query("#reader-content");
    const dialog = query("#reader-dialog");
    if (!host || !dialog) return;
    host.innerHTML = `
      <div class="dialog-header">
        <div><p class="eyebrow">${escapeHTML(item.category)}</p><h2 id="reader-title">${escapeHTML(item.title)}</h2></div>
        <button class="dialog-close" type="button" data-close-dialog aria-label="Close field note">×</button>
      </div>
      <p class="mono-label">${formatDate(item.date)} · ${escapeHTML(item.readTime || "2 min read")}</p>
      <div class="story-copy">${item.content.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}</div>
      <div class="tag-row">${item.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
      <div class="button-row"><button class="button button-accent no-arrow" type="button" data-save-item="${item.id}">${savedItems.has(item.id) ? "Saved" : "Save this note"}</button></div>
    `;
    body.classList.add("is-locked");
    dialog.showModal();
  }

  function projectCard(item) {
    const defaultProgress = item.status === "Completed" ? 100 : item.status === "Ongoing" ? 58 : 14;
    const progress = item.progress ?? defaultProgress;
    const externalLink = /^https?:/i.test(item.link);
    return `
      <article class="card project-card" id="${item.id}">
        <div class="card-topline">
          <span class="status-badge" data-status="${escapeHTML(item.status)}">${escapeHTML(item.status)}</span>
          <button class="save-button ${savedItems.has(item.id) ? "is-saved" : ""}" type="button" data-save-item="${item.id}" aria-label="${savedItems.has(item.id) ? "Remove this saved item" : "Save this item"}">◇</button>
        </div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
        <p class="project-impact"><span>Why it matters</span>${escapeHTML(item.impact)}</p>
        <div class="tag-row">${item.skills.map((skill) => `<span class="tag">${escapeHTML(skill)}</span>`).join("")}</div>
        <div class="card-footer-row">
          <div style="flex:1;min-width:150px"><div class="habit-topline"><span>Progress</span><span>${progress}%</span></div><div class="progress-track"><span style="--progress:${progress}%"></span></div></div>
          <div class="project-actions">
            <button class="button button-small button-quiet no-arrow" type="button" data-open-project="${item.id}">Explore details</button>
            <a class="button button-small" href="${normalizeLegacyLink(item.link)}" ${externalLink ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHTML(item.linkLabel)}</a>
          </div>
        </div>
      </article>
    `;
  }

  function openProject(item) {
    if (!item) return;
    const host = query("#reader-content");
    const dialog = query("#reader-dialog");
    if (!host || !dialog) return;
    const defaultProgress = item.status === "Completed" ? 100 : item.status === "Ongoing" ? 58 : 14;
    const progress = item.progress ?? defaultProgress;
    const externalLink = /^https?:/i.test(item.link);
    host.innerHTML = `
      <div class="dialog-header">
        <div><p class="eyebrow">Project case study</p><h2 id="reader-title">${escapeHTML(item.title)}</h2></div>
        <button class="dialog-close" type="button" data-close-dialog aria-label="Close project details">×</button>
      </div>
      <div class="project-dialog-meta">
        <span class="status-badge" data-status="${escapeHTML(item.status)}">${escapeHTML(item.status)}</span>
        <span class="mono-label">${progress}% complete</span>
        ${item.year ? `<span class="mono-label">${escapeHTML(item.year)}</span>` : ""}
      </div>
      <div class="story-copy">
        <p>${escapeHTML(item.description)}</p>
        <h3>Why it matters</h3>
        <p>${escapeHTML(item.impact)}</p>
        ${item.role ? `<h3>My contribution</h3><p>${escapeHTML(item.role)}</p>` : ""}
        ${item.proof?.length ? `<h3>Evidence</h3><ul>${item.proof.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>` : ""}
      </div>
      <div class="tag-row">${item.skills.map((skill) => `<span class="tag">${escapeHTML(skill)}</span>`).join("")}</div>
      <div class="button-row"><a class="button button-primary" href="${normalizeLegacyLink(item.link)}" ${externalLink ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHTML(item.linkLabel)}</a></div>
    `;
    body.classList.add("is-locked");
    dialog.showModal();
  }

  function renderInitiatives() {
    let activeStatus = "All";
    let searchTerm = "";
    const statuses = ["All", "Completed", "Ongoing", "Planned"];
    const filterHost = query("#project-filters");
    if (filterHost) {
      filterHost.innerHTML = statuses.map((status) => `<button class="filter-button ${status === "All" ? "is-active" : ""}" type="button" data-project-status="${status}">${status}</button>`).join("");
    }
    const render = () => {
      const items = data.projects.filter((item) => {
        const matchesStatus = activeStatus === "All" || item.status === activeStatus;
        const haystack = `${item.title} ${item.description} ${item.skills.join(" ")} ${item.impact}`.toLowerCase();
        return matchesStatus && haystack.includes(searchTerm.toLowerCase());
      });
      const host = query("#project-grid");
      if (host) host.innerHTML = items.length ? items.map(projectCard).join("") : `<div class="empty-state">No initiatives match those filters.</div>`;
      setText("#project-result-count", `${items.length} ${items.length === 1 ? "initiative" : "initiatives"}`);
    };
    filterHost?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-project-status]");
      if (!button) return;
      activeStatus = button.dataset.projectStatus;
      queryAll("[data-project-status]", filterHost).forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
    query("#project-search")?.addEventListener("input", (event) => {
      searchTerm = event.target.value.trim();
      render();
    });
    query("#project-grid")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-project]");
      if (button) openProject(data.projects.find((item) => item.id === button.dataset.openProject));
    });
    render();
  }

  function renderJourney() {
    let activeCategory = "All";
    const categories = ["All", ...new Set(data.updates.map((item) => item.category))];
    const filterHost = query("#journey-filters");
    if (filterHost) filterHost.innerHTML = categories.map((category) => `<button class="filter-button ${category === "All" ? "is-active" : ""}" type="button" data-journey-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");

    const render = () => {
      const items = data.updates.filter((item) => activeCategory === "All" || item.category === activeCategory);
      const host = query("#timeline");
      if (host) {
        host.innerHTML = items.map((item) => `
          <article class="timeline-item" id="${item.id}">
            <time class="timeline-date" datetime="${item.date}">${formatDate(item.date, { month: "short", day: "2-digit", year: "numeric" })}</time>
            <div class="timeline-content">
              <span class="mono-label">${escapeHTML(item.category)}</span>
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.why)}</p>
            </div>
          </article>
        `).join("");
      }
      setText("#journey-count", `${items.length} records`);
    };

    filterHost?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-journey-category]");
      if (!button) return;
      activeCategory = button.dataset.journeyCategory;
      queryAll("[data-journey-category]", filterHost).forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
    query("#download-journey")?.addEventListener("click", downloadJourney);
    query("#print-journey")?.addEventListener("click", () => window.print());
    render();
  }

  function downloadJourney() {
    const lines = [
      "SIGNAL & SELF — JOURNEY LOG",
      `Exported ${new Date().toLocaleDateString("en-CA")}`,
      "",
      ...data.updates.flatMap((item) => [
        `${formatDate(item.date)} · ${item.category}`,
        item.title,
        item.why,
        ""
      ])
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "signal-and-self-journey.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Journey log downloaded.");
  }

  async function init() {
    injectShell();
    bindShellEvents();
    applyTheme(preferences.theme, false);
    try {
      const response = await fetch(pathFromRoot("assets/data/citizenship-records.json?v=interactive-20260812b"));
      if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
      data = await response.json();
      populatePersonalizationForm();
      applyPersonalization();
      ({
        home: renderHome,
        profile: renderProfile,
        insights: renderInsights,
        notes: renderNotes,
        initiatives: renderInitiatives,
        journey: renderJourney
      }[page] || (() => {}))();
      initReveal();
    } catch (error) {
      console.error(error);
      const main = query("main");
      if (main) main.insertAdjacentHTML("afterbegin", `<div class="site-shell"><div class="empty-state">The fieldbook records could not load. Please refresh or run the local preview server.</div></div>`);
      initReveal();
    }
  }

  init();
})();

const state = {
  data: null,
  dashboardPeriod: "monthly",
  reflectionFilter: "All",
  projectFilter: "All"
};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error(error);
    showError(error);
  });
});

async function init() {
  state.data = await loadData();
  setActiveNav();
  renderPage();
  setRevealOrder();
  window.requestAnimationFrame(() => document.body.classList.add("ready"));
}

async function loadData() {
  const response = await fetch("data/site-data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load site data (${response.status}).`);
  }
  return response.json();
}

function setActiveNav() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const isActive = link.dataset.nav === currentPage;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function renderPage() {
  const page = document.body.dataset.page;
  const renderers = {
    home: renderHome,
    about: renderAbout,
    dashboard: renderDashboard,
    reflections: renderReflections,
    projects: renderProjects,
    timeline: renderTimeline
  };

  renderers[page]?.(state.data);
  scrollToHashTarget();
}

function renderHome(data) {
  setText("hero-kicker", data.home.heroKicker);
  setText("hero-name", data.profile.name);
  setText("hero-tagline", data.profile.tagline);
  setText("hero-definition", data.profile.definition);
  setText("hero-mission", data.profile.mission);
  setText("project-summary", data.home.projectSummary);

  setHtml(
    "why-it-matters",
    data.home.whyItMattersPoints
      .map(
        (point) => `
          <article class="stack-item">
            <h3>${point.title}</h3>
            <p>${point.text}</p>
          </article>
        `
      )
      .join("")
  );

  const previewStats = data.home.statsPreview
    .map((statId) => data.stats.find((stat) => stat.id === statId))
    .filter(Boolean);

  setHtml(
    "stats-preview",
    previewStats.map((stat) => statCardMarkup(stat, true)).join("")
  );

  const featuredReflection = getFeaturedReflection(data.reflections);
  if (featuredReflection) {
    setHtml("featured-reflection", reflectionCardMarkup(featuredReflection, true));
  }

  const latestUpdate = sortByDateDesc(data.updates)[0];
  if (latestUpdate) {
    setHtml("recent-update", updateCardMarkup(latestUpdate));
  }

  setHtml(
    "home-values",
    data.principles.slice(0, 4).map((principle) => valuePillMarkup(principle)).join("")
  );
}

function renderAbout(data) {
  setText("about-definition", data.profile.definition);
  setText(
    "about-purpose",
    `${data.home.projectSummary} ${data.profile.mission}`
  );

  setHtml(
    "category-grid",
    data.categories
      .map(
        (category) => `
          <article class="content-card category-card" id="${category.id}">
            <p class="eyebrow">${category.title}</p>
            <p>${category.description}</p>
            <div class="inline-note">
              <strong>Tracked focus:</strong>
              <span>${category.focus}</span>
            </div>
          </article>
        `
      )
      .join("")
  );

  setHtml(
    "personal-goals",
    data.personalGoals
      .map(
        (goal) => `
          <article class="stack-item">
            <p>${goal}</p>
          </article>
        `
      )
      .join("")
  );

  setHtml(
    "code-of-conduct",
    data.codeOfConduct
      .map(
        (rule) => `
          <article class="stack-item">
            <p>${rule}</p>
          </article>
        `
      )
      .join("")
  );

  setHtml("values-grid", data.principles.map(valuePillMarkup).join(""));
}

function renderDashboard(data) {
  setText(
    "dashboard-intro",
    `${data.dashboard.chartDescription} Each metric includes a goal, a short explanation, and enough context to stay useful.`
  );
  setText("chart-title", data.dashboard.chartTitle);
  setText("chart-description", data.dashboard.chartDescription);
  setHtml("stats-grid", data.stats.map((stat) => statCardMarkup(stat, false)).join(""));
  renderPeriodToggle(data);
  renderDashboardPeriod(data);
}

function renderPeriodToggle(data) {
  const options = Object.entries(data.dashboard.periods).map(([key, period]) => ({
    value: key,
    label: period.label
  }));

  renderToggleButtons("period-toggle", options, state.dashboardPeriod, (value) => {
    state.dashboardPeriod = value;
    renderPeriodToggle(data);
    renderDashboardPeriod(data);
  });
}

function renderDashboardPeriod(data) {
  const period = data.dashboard.periods[state.dashboardPeriod];
  setText("progress-summary", `${period.label} update view`);
  setHtml("progress-chart", lineChartMarkup(period.points, state.dashboardPeriod));
  setHtml(
    "progress-breakdown",
    period.points
      .map(
        (point) => `
          <article class="breakdown-card">
            <span>${point.label}</span>
            <strong>${point.value}h</strong>
          </article>
        `
      )
      .join("")
  );

  const focusItems = [
    `
      <article class="stack-item">
        <h3>${period.summary}</h3>
        <p>This view highlights the most recent rhythm of study and improvement work.</p>
      </article>
    `,
    ...period.focus.map(
      (item) => `
        <article class="stack-item">
          <p>${item}</p>
        </article>
      `
    )
  ];

  setHtml("progress-focus", focusItems.join(""));
}

function renderReflections(data) {
  const reflections = sortByDateDesc(data.reflections);
  const featured = getFeaturedReflection(reflections);

  if (featured) {
    setHtml("reflection-featured", reflectionCardMarkup(featured, true));
  }

  const categories = ["All", ...new Set(reflections.map((reflection) => reflection.category))];
  renderToggleButtons(
    "reflection-filters",
    categories.map((category) => ({ value: category, label: category })),
    state.reflectionFilter,
    (value) => {
      state.reflectionFilter = value;
      renderReflections(data);
    }
  );

  const filtered = reflections.filter((reflection) => {
    return state.reflectionFilter === "All" || reflection.category === state.reflectionFilter;
  });

  setHtml(
    "reflection-grid",
    filtered.length
      ? filtered.map((reflection) => reflectionCardMarkup(reflection, false)).join("")
      : emptyStateMarkup("No reflections match that category yet.")
  );
}

function renderProjects(data) {
  const statuses = ["All", ...new Set(data.projects.map((project) => project.status))];
  renderToggleButtons(
    "project-filters",
    statuses.map((status) => ({ value: status, label: status })),
    state.projectFilter,
    (value) => {
      state.projectFilter = value;
      renderProjects(data);
    }
  );

  const filtered = data.projects.filter((project) => {
    return state.projectFilter === "All" || project.status === state.projectFilter;
  });

  setHtml(
    "project-grid",
    filtered.length
      ? filtered.map(projectCardMarkup).join("")
      : emptyStateMarkup("No projects match that status yet.")
  );
}

function renderTimeline(data) {
  const updates = sortByDateDesc(data.updates);
  const latest = updates[0];

  const summary = [
    {
      label: "Logged updates",
      value: updates.length,
      note: "Changes recorded in the changelog"
    },
    {
      label: "Reflection entries",
      value: data.reflections.length,
      note: "Written check-ins across tracked categories"
    },
    {
      label: "Active projects",
      value: data.projects.filter((project) => project.status !== "Planned").length,
      note: "Completed or ongoing contribution work"
    },
    {
      label: "Latest change",
      value: latest ? formatDate(latest.date) : "N/A",
      note: latest ? latest.category : "No updates yet"
    }
  ];

  setHtml(
    "timeline-summary",
    summary.map((item) => summaryCardMarkup(item)).join("")
  );

  setHtml(
    "timeline-list",
    updates.map((update) => timelineItemMarkup(update)).join("")
  );
}

function renderToggleButtons(containerId, options, activeValue, onChange) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = options
    .map(
      (option) => `
        <button
          type="button"
          class="toggle-chip ${option.value === activeValue ? "is-active" : ""}"
          data-value="${option.value}"
          aria-pressed="${String(option.value === activeValue)}"
        >
          ${option.label}
        </button>
      `
    )
    .join("");

  container.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => onChange(button.dataset.value));
  });
}

function statCardMarkup(stat, compact) {
  const progress = Math.min(Math.round((stat.value / stat.goal) * 100), 100);
  return `
    <article class="content-card metric-card ${compact ? "metric-card-compact" : ""}">
      <div class="metric-top">
        <p>${stat.label}</p>
        <span>${stat.period}</span>
      </div>
      <strong class="metric-value">${stat.value}${stat.suffix}</strong>
      <div class="meter" aria-hidden="true">
        <span class="meter-fill" style="width: ${progress}%"></span>
      </div>
      <div class="metric-meta">
        <span>Goal: ${stat.goal}${formatGoalSuffix(stat)}</span>
        <span>${stat.trend}</span>
      </div>
      <p class="metric-copy">${stat.description}</p>
    </article>
  `;
}

function formatGoalSuffix(stat) {
  if (stat.id === "learning_hours") {
    return "h";
  }
  if (stat.id === "improvement_streak") {
    return " days";
  }
  return "";
}

function reflectionCardMarkup(reflection, featured) {
  return `
    <article class="content-card reflection-card ${featured ? "reflection-card-featured" : ""}" id="${reflection.id}">
      <div class="card-meta">
        <span class="category-chip">${reflection.category}</span>
        <time datetime="${reflection.date}">${formatDate(reflection.date)}</time>
        ${reflection.featured ? '<span class="feature-chip">Featured</span>' : ""}
      </div>
      <h3>${reflection.title}</h3>
      <div class="copy-stack">
        ${reflection.content.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
      <div class="tag-list">
        ${reflection.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </article>
  `;
}

function updateCardMarkup(update) {
  return `
    <article class="content-card update-card" id="${update.id}">
      <div class="card-meta">
        <span class="category-chip">${update.category}</span>
        <time datetime="${update.date}">${formatDate(update.date)}</time>
      </div>
      <h3>${update.title}</h3>
      <p>${update.why}</p>
      <a class="inline-link" href="timeline.html#${update.id}">Open timeline entry</a>
    </article>
  `;
}

function projectCardMarkup(project) {
  const statusSlug = project.status.toLowerCase();
  return `
    <article class="content-card project-card" id="${project.id}">
      <div class="card-meta">
        <span class="status-badge" data-status="${statusSlug}">${project.status}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="inline-note">
        <strong>Why it matters:</strong>
        <span>${project.impact}</span>
      </div>
      <div class="tag-list">
        ${project.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
      </div>
      <a class="inline-link" href="${project.link}">${project.linkLabel}</a>
    </article>
  `;
}

function timelineItemMarkup(update) {
  return `
    <article class="timeline-item" id="${update.id}">
      <div class="timeline-date">
        <span>${formatDate(update.date)}</span>
      </div>
      <div class="timeline-card">
        <div class="card-meta">
          <span class="category-chip">${update.category}</span>
        </div>
        <h3>${update.title}</h3>
        <p>${update.why}</p>
      </div>
    </article>
  `;
}

function summaryCardMarkup(item) {
  return `
    <article class="content-card summary-card">
      <p>${item.label}</p>
      <strong>${item.value}</strong>
      <span>${item.note}</span>
    </article>
  `;
}

function valuePillMarkup(principle) {
  return `
    <article class="value-pill">
      <p>${principle}</p>
    </article>
  `;
}

function lineChartMarkup(points, key) {
  const width = 620;
  const height = 260;
  const padding = 28;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const xStep = points.length > 1 ? innerWidth / (points.length - 1) : innerWidth;

  const coordinates = points.map((point, index) => {
    const x = padding + index * xStep;
    const y = height - padding - (point.value / maxValue) * innerHeight;
    return { ...point, x, y };
  });

  const linePoints = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = [
    `M ${coordinates[0].x} ${height - padding}`,
    ...coordinates.map((point) => `L ${point.x} ${point.y}`),
    `L ${coordinates[coordinates.length - 1].x} ${height - padding}`,
    "Z"
  ].join(" ");

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const y = padding + (innerHeight / 3) * index;
    return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="chart-grid-line"></line>`;
  }).join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Progress chart">
      <defs>
        <linearGradient id="chart-fill-${key}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(232, 97, 43, 0.45)"></stop>
          <stop offset="100%" stop-color="rgba(232, 97, 43, 0.04)"></stop>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#chart-fill-${key})"></path>
      <polyline points="${linePoints}" class="chart-line"></polyline>
      ${coordinates
        .map(
          (point) => `
            <circle cx="${point.x}" cy="${point.y}" r="5" class="chart-point"></circle>
            <text x="${point.x}" y="${point.y - 12}" text-anchor="middle" class="chart-value">${point.value}h</text>
            <text x="${point.x}" y="${height - 8}" text-anchor="middle" class="chart-label">${point.label}</text>
          `
        )
        .join("")}
    </svg>
  `;
}

function showError(error) {
  const main = document.querySelector("main");
  if (!main) {
    return;
  }

  const banner = document.createElement("article");
  banner.className = "content-card error-banner";
  banner.innerHTML = `
    <h2>Content unavailable</h2>
    <p>${error.message}</p>
  `;
  main.prepend(banner);
  document.body.classList.add("ready");
}

function scrollToHashTarget() {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);
  if (target) {
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });
  }
}

function setRevealOrder() {
  const revealItems = [...document.querySelectorAll(".hero, .section, .site-footer")];
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 70}ms`;
  });
}

function emptyStateMarkup(message) {
  return `
    <article class="content-card empty-state">
      <p>${message}</p>
    </article>
  `;
}

function getFeaturedReflection(reflections) {
  return sortByDateDesc(reflections).find((reflection) => reflection.featured);
}

function sortByDateDesc(items) {
  return [...items].sort((left, right) => new Date(right.date) - new Date(left.date));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setHtml(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = value;
  }
}

const state = {
  data: null,
  dashboardPeriod: "monthly",
  adoptionYear: 2026,
  reflectionFilter: "All",
  projectFilter: "All"
};

const DIGITAL_ADOPTION_LAYOUT = [
  {
    code: "NAC",
    label: "North America",
    short: "NA",
    accent: "blue",
    seed: 11,
    labelPosition: { x: 186, y: 92 },
    polygons: [
      [
        [72, 120], [108, 82], [184, 58], [258, 66], [314, 110], [318, 156], [286, 192],
        [247, 205], [210, 194], [178, 208], [144, 194], [124, 167], [94, 161]
      ]
    ]
  },
  {
    code: "LCN",
    label: "Latin America & Caribbean",
    short: "LAC",
    accent: "orange",
    seed: 27,
    labelPosition: { x: 296, y: 286 },
    polygons: [
      [
        [245, 205], [286, 215], [320, 246], [351, 311], [354, 380], [329, 455], [288, 490],
        [246, 470], [235, 402], [251, 342], [239, 286], [214, 247], [224, 223]
      ]
    ]
  },
  {
    code: "ECS",
    label: "Europe & Central Asia",
    short: "ECA",
    accent: "blue",
    seed: 39,
    labelPosition: { x: 607, y: 82 },
    polygons: [
      [
        [460, 91], [517, 72], [586, 81], [647, 71], [701, 82], [745, 106], [737, 132],
        [683, 131], [645, 122], [609, 131], [567, 117], [519, 126], [473, 118]
      ]
    ]
  },
  {
    code: "MNA",
    label: "Middle East & North Africa",
    short: "MENA",
    accent: "orange",
    seed: 53,
    labelPosition: { x: 577, y: 184 },
    polygons: [
      [
        [474, 147], [546, 146], [597, 156], [651, 164], [684, 187], [665, 222], [596, 231],
        [543, 227], [487, 216], [462, 179]
      ]
    ]
  },
  {
    code: "SSF",
    label: "Sub-Saharan Africa",
    short: "SSA",
    accent: "blue",
    seed: 67,
    labelPosition: { x: 533, y: 334 },
    polygons: [
      [
        [491, 236], [541, 247], [580, 280], [614, 334], [612, 396], [584, 454], [531, 483],
        [487, 463], [459, 408], [454, 350], [463, 293]
      ]
    ]
  },
  {
    code: "SAS",
    label: "South Asia",
    short: "SA",
    accent: "orange",
    seed: 79,
    labelPosition: { x: 726, y: 220 },
    polygons: [
      [
        [679, 190], [722, 180], [757, 192], [779, 214], [772, 246], [735, 261], [699, 254], [670, 228]
      ]
    ]
  },
  {
    code: "EAS",
    label: "East Asia & Pacific",
    short: "EAP",
    accent: "blue",
    seed: 97,
    labelPosition: { x: 858, y: 160 },
    polygons: [
      [
        [756, 114], [816, 96], [891, 111], [950, 140], [968, 188], [944, 227], [901, 240],
        [866, 224], [832, 247], [791, 239], [764, 206], [748, 161]
      ],
      [
        [835, 323], [882, 317], [916, 336], [910, 368], [870, 382], [834, 361], [819, 339]
      ]
    ]
  }
];

const DIGITAL_ADOPTION_DOT_CACHE = new Map();

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
  setText("home-about-title", data.profile.aboutTitle);
  setText("project-summary", data.home.projectSummary);
  setHtml("home-about-copy", paragraphStackMarkup(data.profile.aboutText.slice(0, 2)));

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
  setText("about-me-title", data.profile.aboutTitle);
  setText("about-definition", data.profile.definition);
  setText(
    "about-purpose",
    `${data.home.projectSummary} ${data.profile.mission}`
  );
  setHtml("about-me-copy", paragraphStackMarkup(data.profile.aboutText));
  setHtml(
    "about-me-focus",
    data.profile.focusAreas
      .map(
        (item) => `
          <article class="stack-item">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>
        `
      )
      .join("")
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
  setText("global-stats-intro", data.dashboard.globalStatsIntro);
  setHtml("stats-grid", data.stats.map((stat) => statCardMarkup(stat, false)).join(""));
  setHtml(
    "global-stats-grid",
    data.dashboard.globalStats.map((item) => globalStatCardMarkup(item)).join("")
  );
  renderDigitalAdoption(data.dashboard.digitalAdoption);
  renderPeriodToggle(data);
  renderDashboardPeriod(data);
  setHtml(
    "learn-more-grid",
    data.dashboard.learnMore.map((resource) => resourceCardMarkup(resource)).join("")
  );
}

function renderDigitalAdoption(adoptionData) {
  setText("digital-adoption-intro", adoptionData.intro);

  const slider = document.getElementById("adoption-year");
  if (!slider) {
    return;
  }

  slider.min = String(adoptionData.minYear);
  slider.max = String(adoptionData.maxYear);

  if (state.adoptionYear < adoptionData.minYear || state.adoptionYear > adoptionData.maxYear) {
    state.adoptionYear = adoptionData.maxYear;
  }

  slider.value = String(state.adoptionYear);

  if (!slider.dataset.bound) {
    slider.addEventListener("input", (event) => {
      state.adoptionYear = Number(event.target.value);
      updateDigitalAdoption(adoptionData);
    });
    slider.dataset.bound = "true";
  }

  updateDigitalAdoption(adoptionData);
}

function updateDigitalAdoption(adoptionData) {
  setText("adoption-year-label", String(state.adoptionYear));
  setText("digital-adoption-note", digitalAdoptionNote(adoptionData, state.adoptionYear));
  setHtml("digital-adoption-map", digitalAdoptionMapMarkup(adoptionData, state.adoptionYear));
  setHtml("digital-adoption-summary", digitalAdoptionSummaryMarkup(adoptionData, state.adoptionYear));
  setHtml(
    "digital-adoption-scale",
    `<strong>Scale:</strong> ${adoptionData.dotScaleLabel}`
  );
  setHtml(
    "digital-adoption-source",
    `<strong>Source:</strong> ${adoptionData.sourceNote} ${adoptionData.sourceLinks
      .map(
        (link) => `<a class="inline-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
      )
      .join(" · ")}`
  );
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

function globalStatCardMarkup(item) {
  return `
    <article class="content-card global-stat-card ${accentClass(item.accent)}">
      <div class="card-meta">
        <span class="category-chip">Youth statistic</span>
        <span>${item.sourceDate}</span>
      </div>
      <strong class="stat-figure">${item.value}</strong>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="inline-note">
        <strong>${item.sourceLabel}</strong>
        <span>${item.sourceTitle}</span>
      </div>
      <a class="inline-link" href="${item.url}" target="_blank" rel="noreferrer">View source</a>
    </article>
  `;
}

function resourceCardMarkup(resource) {
  return `
    <article class="content-card resource-card ${accentClass(resource.accent)}">
      <div class="card-meta">
        <span class="feature-chip">${resource.tag}</span>
      </div>
      <h3>${resource.title}</h3>
      <p>${resource.description}</p>
      <a class="inline-link" href="${resource.url}" target="_blank" rel="noreferrer">${resource.cta}</a>
    </article>
  `;
}

function digitalAdoptionMapMarkup(adoptionData, year) {
  const regions = DIGITAL_ADOPTION_LAYOUT.map((region) => {
    const value = adoptionValueForYear(adoptionData, region.code, year);
    const dotCount = Math.max(0, Math.min(50, Math.round(value / adoptionData.dotScalePercent)));
    const dots = getDigitalAdoptionDots(region)
      .slice(0, dotCount)
      .map(
        (point, index) => `
          <circle
            cx="${point[0]}"
            cy="${point[1]}"
            r="4.2"
            class="adoption-dot ${adoptionAccentClass(region.accent)}"
            style="animation-delay: ${index * 14}ms"
          ></circle>
        `
      )
      .join("");

    const polygons = region.polygons
      .map(
        (polygon) => `
          <polygon
            class="adoption-region ${adoptionAccentClass(region.accent)}"
            points="${polygon.map((point) => point.join(",")).join(" ")}"
          ></polygon>
        `
      )
      .join("");

    return `
      <g class="adoption-region-group">
        ${polygons}
        <g class="adoption-dots-group">${dots}</g>
        <text x="${region.labelPosition.x}" y="${region.labelPosition.y}" class="adoption-label-title">
          ${region.short}
        </text>
        <text x="${region.labelPosition.x}" y="${region.labelPosition.y + 18}" class="adoption-label-value">
          ${formatAdoptionValue(value)}
        </text>
      </g>
    `;
  });

  return `
    <svg class="adoption-map" viewBox="0 0 1000 540" role="img" aria-label="Regional internet adoption map for ${year}">
      <rect x="0" y="0" width="1000" height="540" rx="26" class="adoption-map-background"></rect>
      <path class="adoption-grid-line" d="M 80 70 H 940"></path>
      <path class="adoption-grid-line" d="M 80 170 H 940"></path>
      <path class="adoption-grid-line" d="M 80 270 H 940"></path>
      <path class="adoption-grid-line" d="M 80 370 H 940"></path>
      ${regions.join("")}
    </svg>
  `;
}

function digitalAdoptionSummaryMarkup(adoptionData, year) {
  return DIGITAL_ADOPTION_LAYOUT.map((region) => {
    const value = adoptionValueForYear(adoptionData, region.code, year);
    return `
      <article class="breakdown-card adoption-stat ${adoptionAccentClass(region.accent)}">
        <span>${region.label}</span>
        <strong>${formatAdoptionValue(value)}</strong>
      </article>
    `;
  }).join("");
}

function digitalAdoptionNote(adoptionData, year) {
  if (year < adoptionData.seriesStartYear) {
    return `Comparable regional internet-use data begins in ${adoptionData.seriesStartYear}; earlier years are shown as pre-adoption context.`;
  }
  if (year > adoptionData.latestPublishedYear) {
    return `${year} reuses the latest published regional values from ${adoptionData.latestPublishedYear}.`;
  }
  return "Dots become denser as a larger share of each region's population uses the Internet.";
}

function adoptionValueForYear(adoptionData, regionCode, year) {
  const series = adoptionData.series[regionCode];
  if (!series) {
    return 0;
  }

  if (year < adoptionData.seriesStartYear) {
    return 0;
  }

  const targetYear = Math.min(year, adoptionData.latestPublishedYear);
  const directValue = Number(series[String(targetYear)] ?? 0);
  if (directValue > 0) {
    return directValue;
  }

  const fallback = Object.entries(series)
    .map(([seriesYear, value]) => [Number(seriesYear), Number(value)])
    .filter(([seriesYear, value]) => seriesYear <= targetYear && value > 0)
    .sort((left, right) => left[0] - right[0])
    .pop();

  return fallback ? fallback[1] : 0;
}

function getDigitalAdoptionDots(region) {
  if (DIGITAL_ADOPTION_DOT_CACHE.has(region.code)) {
    return DIGITAL_ADOPTION_DOT_CACHE.get(region.code);
  }

  const totalDots = 50;
  const polygonAreas = region.polygons.map((polygon) => polygonArea(polygon));
  const totalArea = polygonAreas.reduce((sum, area) => sum + area, 0);
  const polygonDotCounts = polygonAreas.map((area) => Math.max(1, Math.floor((area / totalArea) * totalDots)));

  while (polygonDotCounts.reduce((sum, count) => sum + count, 0) > totalDots) {
    const index = polygonDotCounts.findIndex((count) => count > 1);
    polygonDotCounts[index] -= 1;
  }

  while (polygonDotCounts.reduce((sum, count) => sum + count, 0) < totalDots) {
    const index = polygonDotCounts.findIndex((_, idx) => polygonAreas[idx] === Math.max(...polygonAreas));
    polygonDotCounts[index] += 1;
  }

  const dots = [];

  region.polygons.forEach((polygon, polygonIndex) => {
    const count = polygonDotCounts[polygonIndex];
    const bounds = polygonBounds(polygon);
    const random = mulberry32(region.seed + polygonIndex * 97);
    let attempts = 0;

    while (dots.length < polygonDotCounts.slice(0, polygonIndex + 1).reduce((sum, value) => sum + value, 0) && attempts < 5000) {
      const x = bounds.minX + random() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + random() * (bounds.maxY - bounds.minY);
      attempts += 1;
      if (pointInPolygon([x, y], polygon)) {
        dots.push([Number(x.toFixed(1)), Number(y.toFixed(1))]);
      }
    }
  });

  DIGITAL_ADOPTION_DOT_CACHE.set(region.code, dots.slice(0, totalDots));
  return DIGITAL_ADOPTION_DOT_CACHE.get(region.code);
}

function polygonArea(polygon) {
  let area = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const [x1, y1] = polygon[index];
    const [x2, y2] = polygon[(index + 1) % polygon.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function polygonBounds(polygon) {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function pointInPolygon(point, polygon) {
  let inside = false;
  const [x, y] = point;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const [xi, yi] = polygon[index];
    const [xj, yj] = polygon[previous];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function mulberry32(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatAdoptionValue(value) {
  return `${value.toFixed(1)}%`;
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

function paragraphStackMarkup(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
}

function accentClass(accent) {
  if (accent === "blue") {
    return "content-card-blue";
  }
  if (accent === "orange") {
    return "content-card-orange";
  }
  return "";
}

function adoptionAccentClass(accent) {
  return accent === "orange" ? "adoption-accent-orange" : "adoption-accent-blue";
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

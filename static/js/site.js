const state = {
  data: null,
  dashboardPeriod: "monthly",
  adoptionYear: 2025,
  reflectionFilter: "All",
  projectFilter: "All"
};

const DIGITAL_ADOPTION_IMAGE = {
  href: "static/images/digital-adoption-map.png",
  width: 7001,
  height: 4001,
  overlayScaleX: 7.001,
  overlayScaleY: 4001 / 540
};

const DIGITAL_ADOPTION_MASK = {
  width: 7001,
  height: 4001,
  ready: false,
  failed: false,
  promise: null,
  context: null
};

const DIGITAL_ADOPTION_LAYOUT = [
  {
    code: "NAC",
    label: "North America",
    accent: "blue",
    seed: 11,
    labelLines: ["North", "America"],
    labelPosition: { x: 142, y: 118 },
    labelAnchor: "end",
    leaderTo: { x: 198, y: 146 },
    polygons: [
      [
        [48, 87], [73, 62], [111, 49], [139, 58], [153, 79], [132, 96], [96, 103], [67, 98]
      ],
      [
        [111, 111], [129, 92], [165, 78], [205, 68], [244, 66], [282, 74], [316, 92], [340, 117],
        [350, 146], [346, 176], [322, 196], [288, 202], [255, 195], [223, 202], [188, 198], [156, 187],
        [132, 168], [112, 140]
      ],
      [
        [286, 42], [324, 30], [358, 39], [371, 64], [349, 86], [314, 82], [293, 61]
      ]
    ]
  },
  {
    code: "LCN",
    label: "Latin America & Caribbean",
    accent: "orange",
    seed: 27,
    labelLines: ["Latin America", "& Caribbean"],
    labelPosition: { x: 294, y: 292 },
    labelAnchor: "end",
    leaderTo: { x: 303, y: 258 },
    polygons: [
      [
        [248, 214], [264, 204], [287, 205], [306, 217], [322, 234], [316, 248], [297, 254], [278, 245], [264, 230]
      ],
      [
        [307, 245], [329, 260], [351, 289], [360, 323], [358, 359], [346, 394], [327, 436], [301, 467],
        [278, 476], [261, 458], [250, 424], [252, 381], [262, 344], [257, 307], [269, 274], [288, 252]
      ]
    ]
  },
  {
    code: "ECS",
    label: "Europe & Central Asia",
    accent: "blue",
    seed: 39,
    labelLines: ["Europe &", "Central Asia"],
    labelPosition: { x: 650, y: 60 },
    labelAnchor: "middle",
    leaderTo: { x: 650, y: 100 },
    polygons: [
      [
        [441, 86], [470, 71], [501, 67], [533, 73], [549, 88], [548, 106], [522, 113], [494, 110], [470, 116], [447, 105]
      ],
      [
        [545, 86], [583, 73], [628, 70], [679, 74], [735, 78], [782, 92], [815, 108], [820, 129],
        [798, 144], [759, 145], [723, 141], [687, 149], [648, 145], [620, 138], [591, 142], [563, 131], [545, 113]
      ]
    ]
  },
  {
    code: "MNA",
    label: "Middle East & North Africa",
    accent: "orange",
    seed: 53,
    labelLines: ["Middle East", "& N. Africa"],
    labelPosition: { x: 566, y: 174 },
    labelAnchor: "end",
    leaderTo: { x: 610, y: 185 },
    polygons: [
      [
        [448, 149], [480, 146], [515, 148], [549, 152], [579, 163], [585, 182], [564, 194], [529, 193], [495, 188], [467, 180], [449, 166]
      ],
      [
        [582, 168], [615, 165], [645, 176], [662, 197], [654, 221], [623, 228], [595, 216], [581, 193]
      ],
      [
        [650, 172], [682, 174], [705, 186], [709, 209], [689, 223], [662, 214]
      ]
    ]
  },
  {
    code: "SSF",
    label: "Sub-Saharan Africa",
    accent: "blue",
    seed: 67,
    labelLines: ["Sub-Saharan", "Africa"],
    labelPosition: { x: 492, y: 312 },
    labelAnchor: "end",
    leaderTo: { x: 520, y: 312 },
    polygons: [
      [
        [469, 196], [500, 198], [530, 205], [555, 219], [572, 242], [582, 273], [587, 307], [580, 343],
        [565, 381], [544, 417], [520, 448], [493, 458], [471, 440], [458, 408], [452, 371], [450, 332], [453, 291], [459, 250]
      ],
      [
        [582, 392], [596, 406], [593, 435], [579, 447], [570, 426]
      ]
    ]
  },
  {
    code: "SAS",
    label: "South Asia",
    accent: "orange",
    seed: 79,
    labelLines: ["South", "Asia"],
    labelPosition: { x: 776, y: 214 },
    labelAnchor: "start",
    leaderTo: { x: 739, y: 226 },
    polygons: [
      [
        [679, 219], [701, 203], [727, 195], [749, 196], [768, 208], [775, 228], [766, 248], [744, 259], [719, 257], [696, 247], [682, 232]
      ]
    ]
  },
  {
    code: "EAS",
    label: "East Asia & Pacific",
    accent: "blue",
    seed: 97,
    labelLines: ["East Asia", "& Pacific"],
    labelPosition: { x: 896, y: 146 },
    labelAnchor: "start",
    leaderTo: { x: 855, y: 168 },
    polygons: [
      [
        [744, 112], [771, 101], [804, 104], [834, 116], [851, 137], [847, 158], [823, 173], [794, 171], [769, 161], [750, 141]
      ],
      [
        [803, 174], [825, 182], [845, 198], [850, 223], [836, 243], [812, 243], [796, 226], [791, 201]
      ],
      [
        [852, 131], [868, 136], [874, 152], [865, 168], [852, 163]
      ],
      [
        [833, 315], [866, 309], [898, 316], [915, 334], [913, 362], [889, 381], [856, 380], [833, 362], [823, 336]
      ],
      [
        [928, 382], [941, 391], [938, 410], [926, 418], [919, 400]
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

  primeDigitalAdoptionMask()
    .then(() => updateDigitalAdoption(adoptionData))
    .catch(() => updateDigitalAdoption(adoptionData));

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
            class="adoption-region-hit"
            points="${polygon.map((point) => point.join(",")).join(" ")}"
          ></polygon>
        `
      )
      .join("");

    return `
      <g class="adoption-region-group">
        ${polygons}
        <g class="adoption-dots-group">${dots}</g>
        ${digitalAdoptionLabelMarkup(region, value)}
      </g>
    `;
  });

  return `
      <svg
        class="adoption-map"
        viewBox="0 0 ${DIGITAL_ADOPTION_IMAGE.width} ${DIGITAL_ADOPTION_IMAGE.height}"
        role="img"
        aria-label="Regional internet adoption map for ${year}"
      >
        <image
          href="${DIGITAL_ADOPTION_IMAGE.href}"
          x="0"
          y="0"
          width="${DIGITAL_ADOPTION_IMAGE.width}"
          height="${DIGITAL_ADOPTION_IMAGE.height}"
          preserveAspectRatio="xMidYMid meet"
        ></image>
        <g
          class="adoption-overlay"
          transform="scale(${DIGITAL_ADOPTION_IMAGE.overlayScaleX} ${DIGITAL_ADOPTION_IMAGE.overlayScaleY})"
        >
          ${regions.join("")}
        </g>
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

function digitalAdoptionLabelMarkup(region, value) {
  const labelLines = region.labelLines ?? [region.label];
  const anchor = region.labelAnchor ?? "middle";
  const lineHeight = 11;
  const topPadding = 8;
  const bottomPadding = 7;
  const horizontalPadding = 9;
  const valueGap = 14;
  const valueText = formatAdoptionValue(value);
  const longestLineLength = Math.max(
    ...labelLines.map((line) => line.length),
    valueText.length
  );
  const boxWidth = Math.max(80, longestLineLength * 5.6 + horizontalPadding * 2);
  const boxHeight = topPadding + bottomPadding + labelLines.length * lineHeight + valueGap + 11;
  const boxX = adoptionLabelBoxX(region.labelPosition.x, boxWidth, anchor);
  const boxY = region.labelPosition.y - topPadding;
  const textX = adoptionLabelTextX(boxX, boxWidth, anchor, horizontalPadding);
  const titleMarkup = labelLines
    .map(
      (line, index) => `
        <tspan x="${textX}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>
      `
    )
    .join("");
  const valueY = region.labelPosition.y + valueGap + (labelLines.length - 1) * lineHeight;
  const leaderMarkup = region.leaderTo
    ? `
        <line
          class="adoption-label-leader"
          x1="${region.leaderTo.x}"
          y1="${region.leaderTo.y}"
          x2="${adoptionLeaderTargetX(boxX, boxWidth, anchor)}"
          y2="${boxY + boxHeight / 2}"
        ></line>
      `
    : "";

  return `
    <g class="adoption-label-group">
      ${leaderMarkup}
      <rect
        class="adoption-label-box"
        x="${boxX}"
        y="${boxY}"
        width="${boxWidth}"
        height="${boxHeight}"
        rx="9"
        ry="9"
      ></rect>
      <text x="${textX}" y="${region.labelPosition.y}" text-anchor="${anchor}" class="adoption-label-title">
        ${titleMarkup}
      </text>
      <text x="${textX}" y="${valueY}" text-anchor="${anchor}" class="adoption-label-value">
        ${valueText}
      </text>
    </g>
  `;
}

function digitalAdoptionNote(adoptionData, year) {
  const context = `Pre-adoption years from ${adoptionData.minYear} to ${adoptionData.seriesStartYear - 1} are included for context because comparable regional internet-use data begins in ${adoptionData.seriesStartYear}.`;
  if (year < adoptionData.seriesStartYear) {
    return context;
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

  if (!DIGITAL_ADOPTION_MASK.ready && !DIGITAL_ADOPTION_MASK.failed) {
    return [];
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
    const polygonDots = [];
    let attempts = 0;
    const maxAttempts = Math.max(8000, count * 1600);

    while (polygonDots.length < count && attempts < maxAttempts) {
      const x = bounds.minX + random() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + random() * (bounds.maxY - bounds.minY);
      attempts += 1;
      if (pointInPolygon([x, y], polygon) && isDigitalAdoptionLandPoint(x, y)) {
        polygonDots.push([Number(x.toFixed(1)), Number(y.toFixed(1))]);
      }
    }

    dots.push(...polygonDots);
  });

  DIGITAL_ADOPTION_DOT_CACHE.set(region.code, dots.slice(0, totalDots));
  return DIGITAL_ADOPTION_DOT_CACHE.get(region.code);
}

function primeDigitalAdoptionMask() {
  if (DIGITAL_ADOPTION_MASK.ready || DIGITAL_ADOPTION_MASK.failed) {
    return Promise.resolve();
  }

  if (DIGITAL_ADOPTION_MASK.promise) {
    return DIGITAL_ADOPTION_MASK.promise;
  }

  DIGITAL_ADOPTION_MASK.promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = DIGITAL_ADOPTION_MASK.width;
      canvas.height = DIGITAL_ADOPTION_MASK.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        DIGITAL_ADOPTION_MASK.failed = true;
        reject(new Error("Failed to create a canvas context for the adoption map."));
        return;
      }
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      DIGITAL_ADOPTION_MASK.context = context;
      DIGITAL_ADOPTION_MASK.ready = true;
      DIGITAL_ADOPTION_DOT_CACHE.clear();
      resolve();
    };
    image.onerror = () => {
      DIGITAL_ADOPTION_MASK.failed = true;
      reject(new Error("Failed to load the digital adoption map image."));
    };
    image.src = DIGITAL_ADOPTION_IMAGE.href;
  });

  return DIGITAL_ADOPTION_MASK.promise;
}

function isDigitalAdoptionLandPoint(x, y) {
  if (DIGITAL_ADOPTION_MASK.failed || !DIGITAL_ADOPTION_MASK.ready || !DIGITAL_ADOPTION_MASK.context) {
    return true;
  }

  const context = DIGITAL_ADOPTION_MASK.context;
  const maskX = x * DIGITAL_ADOPTION_IMAGE.overlayScaleX;
  const maskY = y * DIGITAL_ADOPTION_IMAGE.overlayScaleY;
  const centerX = clamp(Math.round(maskX), 0, DIGITAL_ADOPTION_MASK.width - 1);
  const centerY = clamp(Math.round(maskY), 0, DIGITAL_ADOPTION_MASK.height - 1);
  const centerPixel = context.getImageData(centerX, centerY, 1, 1).data;
  if (!isDigitalAdoptionLandColor(centerPixel[0], centerPixel[1], centerPixel[2], centerPixel[3])) {
    return false;
  }

  const sampleRadius = 3;
  const sampleX = clamp(centerX - sampleRadius, 0, DIGITAL_ADOPTION_MASK.width - 1);
  const sampleY = clamp(centerY - sampleRadius, 0, DIGITAL_ADOPTION_MASK.height - 1);
  const sampleWidth = Math.min(sampleRadius * 2 + 1, DIGITAL_ADOPTION_MASK.width - sampleX);
  const sampleHeight = Math.min(sampleRadius * 2 + 1, DIGITAL_ADOPTION_MASK.height - sampleY);
  const pixels = context.getImageData(sampleX, sampleY, sampleWidth, sampleHeight).data;
  let landHits = 0;
  let totalSamples = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    totalSamples += 1;
    if (isDigitalAdoptionLandColor(pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3])) {
      landHits += 1;
    }
  }

  return totalSamples > 0 && landHits / totalSamples >= 0.42;
}

function isDigitalAdoptionLandColor(red, green, blue, alpha) {
  if (alpha < 16) {
    return false;
  }

  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const saturation = maxChannel - minChannel;
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  // The source image uses a muted blue for land and neutral grays for shadows.
  // Match the land hue family so ocean shadows do not accept dots.
  return (
    saturation >= 22 &&
    blue > green &&
    green > red &&
    blue - red >= 20 &&
    brightness <= 170
  );
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function adoptionLabelBoxX(x, width, anchor) {
  if (anchor === "start") {
    return x;
  }
  if (anchor === "end") {
    return x - width;
  }
  return x - width / 2;
}

function adoptionLabelTextX(boxX, width, anchor, padding) {
  if (anchor === "start") {
    return boxX + padding;
  }
  if (anchor === "end") {
    return boxX + width - padding;
  }
  return boxX + width / 2;
}

function adoptionLeaderTargetX(boxX, width, anchor) {
  if (anchor === "start") {
    return boxX;
  }
  if (anchor === "end") {
    return boxX + width;
  }
  return boxX + width / 2;
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

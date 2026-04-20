const state = {
  data: null,
  dashboardPeriod: "monthly",
  adoptionYear: 2025,
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
    labelPosition: { x: 208, y: 126 },
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
    short: "LAC",
    accent: "orange",
    seed: 27,
    labelPosition: { x: 311, y: 314 },
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
    short: "ECA",
    accent: "blue",
    seed: 39,
    labelPosition: { x: 625, y: 98 },
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
    short: "MENA",
    accent: "orange",
    seed: 53,
    labelPosition: { x: 582, y: 190 },
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
    short: "SSA",
    accent: "blue",
    seed: 67,
    labelPosition: { x: 530, y: 326 },
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
    short: "SA",
    accent: "orange",
    seed: 79,
    labelPosition: { x: 729, y: 223 },
    polygons: [
      [
        [679, 219], [701, 203], [727, 195], [749, 196], [768, 208], [775, 228], [766, 248], [744, 259], [719, 257], [696, 247], [682, 232]
      ]
    ]
  },
  {
    code: "EAS",
    label: "East Asia & Pacific",
    short: "EAP",
    accent: "blue",
    seed: 97,
    labelPosition: { x: 849, y: 159 },
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

const DIGITAL_ADOPTION_SILHOUETTES = [
  "M56 143 C69 116 92 95 121 82 C149 67 183 61 218 63 C245 65 274 74 301 89 C322 101 339 120 347 142 C352 160 347 178 334 193 C321 207 303 213 283 213 C264 213 246 216 230 226 C213 238 195 245 178 242 C161 239 146 231 133 218 C119 203 107 190 94 177 C80 165 68 154 56 143 Z",
  "M298 214 C314 216 329 225 339 238 C346 248 345 258 338 266 C330 275 319 279 306 278 C297 268 294 255 295 243 C296 232 296 221 298 214 Z",
  "M286 50 C309 37 338 30 363 36 C374 39 376 49 369 60 C360 74 343 83 324 85 C307 87 292 79 286 66 Z",
  "M311 249 C327 258 341 273 350 290 C359 308 363 328 362 352 C361 378 355 401 346 422 C337 444 323 466 304 486 C292 498 278 500 269 486 C260 469 255 447 252 424 C250 401 250 379 253 357 C256 335 262 314 270 294 C279 274 292 258 311 249 Z",
  "M436 110 C454 92 480 78 512 72 C544 66 580 67 618 72 C654 76 690 78 728 80 C765 81 801 89 832 106 C846 114 853 126 852 139 C850 152 839 161 822 167 C800 174 779 172 760 168 C741 164 721 161 700 164 C679 167 659 168 640 165 C619 162 598 158 579 153 C561 148 542 146 522 147 C503 148 484 145 466 138 C450 132 440 123 436 110 Z",
  "M695 201 C709 195 724 194 739 199 C749 202 757 210 760 220 C759 232 751 240 740 247 C726 255 713 256 700 250 C691 243 687 232 688 220 C689 212 693 205 695 201 Z",
  "M474 196 C492 194 511 199 529 207 C547 215 562 229 573 249 C582 268 587 292 589 318 C590 344 586 370 576 394 C566 418 551 440 533 456 C516 471 498 472 485 459 C473 447 464 430 459 409 C454 389 451 368 449 346 C447 323 448 300 451 278 C454 255 460 233 474 196 Z",
  "M584 390 C592 401 597 414 594 430 C591 440 584 448 574 451 C570 437 572 421 576 405 Z",
  "M742 114 C760 105 784 101 809 105 C828 108 845 117 853 132 C857 145 854 158 844 170 C831 184 812 189 790 187 C771 185 753 177 742 164 C735 152 735 128 742 114 Z",
  "M861 136 C870 140 875 148 874 159 C872 169 865 175 856 176 C853 164 855 149 861 136 Z",
  "M792 205 C809 208 825 216 838 228 C847 237 848 247 841 255 C828 262 813 262 798 257 C788 249 784 238 784 226 C785 217 788 210 792 205 Z",
  "M832 318 C852 311 874 309 896 313 C914 316 929 325 935 340 C939 356 934 370 921 380 C905 392 885 396 863 394 C845 391 829 381 821 366 C818 350 821 332 832 318 Z",
  "M926 389 C934 393 939 401 938 411 C936 420 930 426 923 427 C920 417 920 402 926 389 Z"
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
  const silhouettes = DIGITAL_ADOPTION_SILHOUETTES
    .map((path) => `<path class="adoption-silhouette" d="${path}"></path>`)
    .join("");

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
        <defs>
          <filter id="adoption-shadow" x="-20%" y="-20%" width="150%" height="170%">
            <feDropShadow dx="18" dy="22" stdDeviation="12" flood-color="#9aa9ba" flood-opacity="0.22"></feDropShadow>
          </filter>
        </defs>
        <rect x="0" y="0" width="1000" height="540" rx="26" class="adoption-map-background"></rect>
        <g class="adoption-silhouette-group" filter="url(#adoption-shadow)">
          ${silhouettes}
        </g>
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
  const context = `Pre-adoption years from ${adoptionData.minYear} to ${adoptionData.seriesStartYear - 1} are included for context because comparable regional internet-use data begins in ${adoptionData.seriesStartYear}.`;
  if (year < adoptionData.seriesStartYear) {
    return context;
  }
  return `${context} Dots become denser as a larger share of each region's population uses the Internet.`;
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

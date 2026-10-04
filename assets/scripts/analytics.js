(() => {
  "use strict";

  if (window.location.hostname !== "mini34.github.io") return;
  // The worksheet never loads third-party scripts beside private answers.
  if (window.location.pathname?.endsWith('/pages/digital-citizen-reflection.html')) return;

  const beacon = document.createElement("script");
  beacon.type = "module";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({
    token: "6fc972b84b034bb681e0831799e3fbb7",
  });
  document.head.append(beacon);
})();

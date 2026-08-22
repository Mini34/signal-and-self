(() => {
  "use strict";

  if (window.location.hostname !== "mini34.github.io") return;

  const beacon = document.createElement("script");
  beacon.type = "module";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({
    token: "6fc972b84b034bb681e0831799e3fbb7",
  });
  document.head.append(beacon);
})();

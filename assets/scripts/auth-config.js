(() => {
  "use strict";

  // OAuth client IDs are public web configuration, not secrets. Keep this value
  // empty in forks and local previews until the site's authorized Google web
  // client has been created for https://mini34.github.io.
  window.SIGNAL_AND_SELF_AUTH = Object.freeze({
    googleClientId: "1009093933510-7cs1dng3bp5vrsodhfjcclgmohfumki1.apps.googleusercontent.com"
  });
})();

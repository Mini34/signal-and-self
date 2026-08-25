(() => {
  "use strict";

  const sessionKey = "signal-and-self-google-viewer";
  const authChangeEvent = "signal-and-self-auth-change";
  const authOpenEvent = "signal-and-self-auth-open";
  const googleScriptId = "google-identity-services";
  const trustedIssuers = new Set(["accounts.google.com", "https://accounts.google.com"]);

  let viewer = loadViewer();
  let googleReady = false;
  let googleLoader = null;

  function query(selector, context = document) {
    return context.querySelector(selector);
  }

  function queryAll(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  }

  function clientId() {
    return String(window.SIGNAL_AND_SELF_AUTH?.googleClientId || "").trim();
  }

  function loadViewer() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
      if (!saved?.expiresAt || saved.expiresAt <= Date.now()) {
        sessionStorage.removeItem(sessionKey);
        return null;
      }
      return saved;
    } catch {
      sessionStorage.removeItem(sessionKey);
      return null;
    }
  }

  function decodeCredential(credential) {
    try {
      const encoded = credential.split(".")[1];
      const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function validClaims(claims) {
    return Boolean(
      claims &&
      claims.aud === clientId() &&
      trustedIssuers.has(claims.iss) &&
      Number(claims.exp) * 1000 > Date.now() &&
      claims.sub
    );
  }

  function emitViewer() {
    window.dispatchEvent(new CustomEvent(authChangeEvent, {
      detail: { viewer: viewer ? { ...viewer } : null }
    }));
  }

  function setStatus(message, tone = "neutral") {
    const status = query("#auth-status");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function syncUI() {
    const signedIn = Boolean(viewer);
    queryAll("[data-auth-signed-out]").forEach((element) => { element.hidden = signedIn; });
    queryAll("[data-auth-signed-in]").forEach((element) => { element.hidden = !signedIn; });
    queryAll("[data-account-control]").forEach((button) => {
      button.classList.toggle("is-signed-in", signedIn);
      button.setAttribute("aria-label", signedIn ? `Open account for ${viewer.fullName}` : "Sign in with Google");
    });
    queryAll("[data-account-label]").forEach((element) => {
      element.textContent = signedIn ? viewer.givenName : "Sign in";
    });
    queryAll("[data-account-name]").forEach((element) => {
      element.textContent = signedIn ? viewer.fullName : "";
    });
    queryAll("[data-account-avatar]").forEach((element) => {
      if (signedIn && viewer.picture) {
        element.src = viewer.picture;
        element.alt = "";
        element.hidden = false;
      } else {
        element.removeAttribute("src");
        element.alt = "";
        element.hidden = true;
      }
    });
    queryAll("[data-account-glyph]").forEach((element) => { element.hidden = signedIn; });
  }

  function handleCredential(response) {
    const claims = decodeCredential(response?.credential || "");
    if (!validClaims(claims)) {
      setStatus("Google returned a sign-in response that could not be used. Please try again.", "error");
      return;
    }

    viewer = {
      givenName: String(claims.given_name || claims.name || "Visitor").split(" ")[0],
      fullName: String(claims.name || claims.given_name || "Google visitor"),
      picture: /^https:\/\//.test(claims.picture || "") ? claims.picture : "",
      expiresAt: Number(claims.exp) * 1000
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(viewer));
    syncUI();
    emitViewer();
    setStatus("Signed in for this browser session. Your Google token was not stored.", "success");
  }

  function loadGoogleLibrary() {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (googleLoader) return googleLoader;

    googleLoader = new Promise((resolve, reject) => {
      const existing = document.getElementById(googleScriptId);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = googleScriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    return googleLoader;
  }

  async function initializeGoogle() {
    if (viewer || googleReady) return;
    const configuredClientId = clientId();
    const host = query("#google-signin-host");
    if (!host) return;

    if (!configuredClientId) {
      setStatus("Google sign-in needs the site's OAuth client ID before it can be enabled.", "setup");
      return;
    }

    setStatus("Loading Google's secure sign-in control…");
    try {
      await loadGoogleLibrary();
      window.google.accounts.id.initialize({
        client_id: configuredClientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup",
        use_fedcm_for_button: true
      });
      host.replaceChildren();
      window.google.accounts.id.renderButton(host, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: Math.min(340, Math.max(220, host.clientWidth))
      });
      googleReady = true;
      setStatus("Google provides standard profile claims after you choose an account; this site keeps only your name and profile image.");
    } catch {
      setStatus("Google sign-in could not load. Check your connection and try again.", "error");
    }
  }

  function signOut() {
    window.google?.accounts?.id?.disableAutoSelect();
    viewer = null;
    sessionStorage.removeItem(sessionKey);
    syncUI();
    emitViewer();
    setStatus("Signed out on this device.", "success");
  }

  function boot() {
    syncUI();
    emitViewer();
    window.addEventListener(authOpenEvent, initializeGoogle);
    query("[data-sign-out]")?.addEventListener("click", signOut);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

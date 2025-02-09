(() => {
  // src/interfaces/sw.ts
  var SW = typeof self !== "undefined" ? self : {};

  // src/interfaces/config.ts
  var CONFIG = {
    debug: false
  };

  // src/__temp_merged.ts
  CONFIG.debug = false;
  function registerEvent(eventName, fn) {
    if (typeof fn !== "function") {
      return;
    }
    SW.addEventListener(eventName, (event) => {
      fn(event);
    });
  }
  var onInstall = (event) => {
    console.log("Service Worker installing");
    console.log("Example using config", CONFIG);
    SW.skipWaiting();
  };
  var onActivate = (event) => {
    console.log("Service Worker activating");
    event.waitUntil(SW.clients.claim());
  };
  var onFetch = (event) => {
    console.log("Handling fetch event");
  };
  registerEvent("install", onInstall);
  registerEvent("activate", onActivate);
  registerEvent("fetch", onFetch);
})();
//# sourceMappingURL=service-worker.js.map

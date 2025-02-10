(() => {
  const SW = self;
  const CONFIG = {
    debug: false
  };
  CONFIG.debug = true;
  function registerEvent(eventName, fn) {
    if (typeof fn !== "function") {
      return;
    }
    console.log("Registering event successfully: ", eventName);
    SW.addEventListener(eventName, (event) => {
      console.log("Event triggered: ", eventName, event);
      fn(event);
    });
  }
  const onInstall = (event) => {
    console.log("Service Worker installing");
    console.log("Example using config", CONFIG);
    SW.skipWaiting();
  };
  const onActivate = (event) => {
    console.log("Service Worker activating");
    event.waitUntil(SW.clients.claim());
  };
  const onFetch = (event) => {
    console.log("Handling fetch event");
  };
  registerEvent("install", onInstall);
  registerEvent("activate", onActivate);
  registerEvent("fetch", onFetch);
})();

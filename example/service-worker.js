// src/__temp_merged.ts
function registerEvent(eventName, fn) {
  if (typeof fn !== "function") {
    return;
  }
  fn({ event: eventName });
}
var onInstall = (event) => {
  console.log("Service Worker installing");
};
var onActivate = (event) => {
  console.log("Service Worker activating");
};
var onFetch = (event) => {
  console.log("Handling fetch event");
};
registerEvent("install", onInstall);
registerEvent("activate", onActivate);
registerEvent("fetch", onFetch);

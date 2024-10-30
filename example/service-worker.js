// dist/__injectedConfig.js
var CONFIG = { "debug": true };
var EVENTS = { install: [(event) => console.log("Custom install function")], fetch: [(event) => {
  console.log("Custom fetch handling from .ts");
  event.respondWith(fetch(event.request));
}] };

// builder/src/events/index.ts
var DEFAULT_EVENTS = {
  install: null,
  // installHandler,
  activate: null,
  // activateHandler,
  fetch: null,
  // fetchHandler,
  message: null,
  // messageHandler,
  push: null,
  // pushHandler,
  sync: null,
  // syncHandler,
  notificationclick: null,
  // notificationClickHandler,
  notificationclose: null,
  // notificationCloseHandler,
  backgroundfetchsuccess: null,
  // backgroundFetchSuccessHandler,
  backgroundfetchfail: null,
  // backgroundFetchFailHandler,
  backgroundfetchabort: null
  // backgroundFetchAbortHandler,
};

// builder/src/utils/function.ts
function fnRollup(fn, ...args) {
  if (typeof fn === "function") {
    fn(...args);
  }
  if (Array.isArray(fn)) {
    for (const f of fn) {
      fnRollup(f, ...args);
    }
  }
}

// builder/src/index.ts
for (const eventName in DEFAULT_EVENTS) {
  if (DEFAULT_EVENTS[eventName] || EVENTS[eventName]) {
    self.addEventListener(eventName, (event) => {
      if (DEFAULT_EVENTS[eventName]) {
        DEFAULT_EVENTS[eventName](event, CONFIG);
      }
      if (EVENTS[eventName]) {
        fnRollup(EVENTS[eventName], event);
      }
    });
  }
}

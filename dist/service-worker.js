// __injectedConfig.js
var EVENTS = { install: [(event) => console.log("Custom install function")], fetch: [(event) => {
  console.log("Custom fetch handling");
  event.respondWith(fetch(event.request));
}] };

// src/utils/function.ts
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

// src/index.ts
for (const eventName in EVENTS) {
  self.addEventListener(eventName, (event) => {
    fnRollup(EVENTS[eventName], event);
  });
}

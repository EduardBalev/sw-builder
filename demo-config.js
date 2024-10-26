module.exports = {
  target: "dist/service-worker.js",
  events: {
    install: [(event) => console.log("Custom install function")],
    fetch: [
      (event) => {
        console.log("Custom fetch handling");
        event.respondWith(fetch(event.request));
      },
    ],
  },
};

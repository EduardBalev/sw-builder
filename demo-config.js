module.exports = {
  target: "example/service-worker.js",
  minify: false,
  sourcemap: false,
  debug: true,
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

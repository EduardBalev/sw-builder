/// <reference lib="webworker" />

export default {
  target: "dist/service-worker.js",
  minify: false,
  sourcemap: false,
  debug: true,
  events: {
    install: [(event: any) => console.log("Custom install function")],
    fetch: [
      (event: FetchEvent) => {
        console.log("Custom fetch handling from .ts");
        event.respondWith(fetch(event.request));
      },
    ],
  },
};

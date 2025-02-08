// Example source file (sw-source.ts)
export const onInstall = (event: Event) => {
  console.log('Service Worker installing');
  // Installation logic
};

export const onActivate = (event: Event) => {
  console.log('Service Worker activating');
  // Activation logic
};

export const onFetch = (event: FetchEvent) => {
  console.log('Handling fetch event');
  // Fetch handling logic
};

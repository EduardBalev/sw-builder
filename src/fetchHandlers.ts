import { handleAPICache, handleStaticCache } from "./cache";
import { STATE } from "./consts";
import { getRequestHeader, catchCashableRequests } from "./utils";

export function handleFetchEvent(event: FetchEvent) {
  const requestUrl = new URL(event.request.url);
  const ignore = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_IGNORE_NAME,
  );
  const cacheName = getRequestHeader(
    event.request,
    STATE.CONFIG.CACHE_HEADER_NAME,
  );

  if (ignore) {
    return;
  }

  const isHtmlRequest =
    event.request.headers.get("Accept")?.includes("text/html") ||
    requestUrl.pathname.endsWith(".html");

  if (
    isHtmlRequest ||
    /^chrome-extension\:|^ws\:|\/runtime\./.test(event.request.url)
  ) {
    return;
  }

  if (
    requestUrl.pathname.includes("/api/") &&
    !STATE.CONFIG.DISABLE_DYNAMIC_CACHE
  ) {
    catchCashableRequests(event.request, STATE.CACHE_LIST, STATE.CONFIG).then(
      () => {
        if (STATE.CACHE_LIST.has(cacheName)) {
          event.respondWith(handleAPICache(event.request, cacheName));
        }
      },
    );
    return;
  }

  if (
    staticResourcesPattern.test(event.request.url) &&
    event.request.method === "GET" &&
    !STATE.CONFIG.DISABLE_STATIC_CACHE
  ) {
    event.respondWith(handleStaticCache(event.request));
    return;
  }
}

let staticResourcesPattern = new RegExp("");

export function addStaticPatterns(sources: RegExp[]) {
  staticResourcesPattern = new RegExp(
    sources.map((regex) => regex.source).join("|"),
  );
}

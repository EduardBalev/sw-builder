import { updateConfig } from "./config";
import { activateHandler } from "./events/activate";
import {
  backgroundFetchAbortHandler,
  backgroundFetchFailHandler,
  backgroundFetchSuccessHandler,
} from "./events/backgroundfetch";
import { fetchHandler } from "./events/fetch";
import { installHandler } from "./events/install";
import { messageHandler } from "./events/message";
import { notificationClickHandler } from "./events/notificationclick";
import { notificationCloseHandler } from "./events/notificationclose";
import { pushHandler } from "./events/push";
import { syncHandler } from "./events/sync";
import { SWConfig } from "./interfaces/config";
import {
  BackgroundFetchAbortEvent,
  BackgroundFetchFailEvent,
  BackgroundFetchSuccessEvent,
  SyncEvent,
} from "./interfaces/events";
import { swScope } from "./utils/swScope";

// Initialization function
export function initServiceWorker(customConfig: Partial<SWConfig>) {
  const config = updateConfig(customConfig);

  // Install Event
  swScope.addEventListener("install", (event: ExtendableEvent) => {
    installHandler(event, config);
  });

  // Activate Event
  swScope.addEventListener("activate", (event: ExtendableEvent) => {
    activateHandler(event, config);
  });

  // Fetch Event
  swScope.addEventListener("fetch", (event: FetchEvent) => {
    fetchHandler(event, config);
  });

  // Push Event
  swScope.addEventListener("push", (event: PushEvent) => {
    pushHandler(event, config);
  });

  // Sync Event
  swScope.addEventListener("sync", (event: SyncEvent) => {
    syncHandler(event, config);
  });

  // Notification Click Event
  swScope.addEventListener("notificationclick", (event: NotificationEvent) => {
    notificationClickHandler(event, config);
  });

  // Notification Close Event
  swScope.addEventListener("notificationclose", (event: NotificationEvent) => {
    notificationCloseHandler(event, config);
  });

  // Message Event
  swScope.addEventListener("message", (event: MessageEvent) => {
    messageHandler(event, config);
  });

  // Background Fetch Success Event
  swScope.addEventListener(
    "backgroundfetchsuccess",
    (event: BackgroundFetchSuccessEvent) => {
      backgroundFetchSuccessHandler(event, config);
    },
  );

  // Background Fetch Fail Event
  swScope.addEventListener(
    "backgroundfetchfail",
    (event: BackgroundFetchFailEvent) => {
      backgroundFetchFailHandler(event, config);
    },
  );

  // Background Fetch Abort Event
  swScope.addEventListener(
    "backgroundfetchabort",
    (event: BackgroundFetchAbortEvent) => {
      backgroundFetchAbortHandler(event, config);
    },
  );
}

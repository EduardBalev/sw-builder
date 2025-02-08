import { CachePolicy } from "./cache-policies";
import {
  InstallHandler,
  ActivateHandler,
  FetchHandler,
  PushHandler,
  SyncHandler,
  NotificationClickHandler,
  NotificationCloseHandler,
  MessageHandler,
  BackgroundFetchAbortHandler,
  BackgroundFetchFailHandler,
  BackgroundFetchSuccessHandler,
} from "./events";

export declare interface SWConfig {
  /** Flag to enable or disable debug mode in the service worker. */
  debug?: boolean;
  cachePolicies: {
    staticResources: CachePolicy;
    apiResponses: CachePolicy;
  };
}

export declare interface SWEvents {
  install?: InstallHandler | InstallHandler[];
  activate?: ActivateHandler | ActivateHandler[];
  fetch?: FetchHandler | FetchHandler[];
  push?: PushHandler | PushHandler[];
  sync?: SyncHandler | SyncHandler[];
  notificationclick?: NotificationClickHandler | NotificationClickHandler[];
  notificationclose?: NotificationCloseHandler | NotificationCloseHandler[];
  message?: MessageHandler | MessageHandler[];
  backgroundfetchsuccess?:
    | BackgroundFetchSuccessHandler
    | BackgroundFetchSuccessHandler[];
  backgroundfetchfail?:
    | BackgroundFetchFailHandler
    | BackgroundFetchFailHandler[];
  backgroundfetchabort?:
    | BackgroundFetchAbortHandler
    | BackgroundFetchAbortHandler[];
}

// Declare `CONFIG` as a global constant of type `SWConfig`
export declare const CONFIG: SWConfig;
export declare const EVENTS: SWEvents;

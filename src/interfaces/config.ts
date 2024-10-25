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

export interface SWConfig {
  /** Flag to enable or disable debug mode in the service worker. */
  debug?: boolean;

  events?: {
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
  };
}

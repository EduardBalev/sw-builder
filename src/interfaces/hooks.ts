import {
  ActivateHandler,
  BackgroundFetchAbortHandler,
  BackgroundFetchFailHandler,
  BackgroundFetchSuccessHandler,
  FetchHandler,
  InstallHandler,
  MessageHandler,
  NotificationClickHandler,
  NotificationCloseHandler,
  PushHandler,
  SyncHandler,
} from './events';

export interface SwHooks {
  onInstall?: InstallHandler;
  onActivate?: ActivateHandler;
  onFetch?: FetchHandler;
  onMessage?: MessageHandler;
  onPush?: PushHandler;
  onSync?: SyncHandler;
  onNotificationClick?: NotificationClickHandler;
  onNotificationClose?: NotificationCloseHandler;
  onBackgroundFetchSuccess?: BackgroundFetchSuccessHandler;
  onBackgroundFetchFail?: BackgroundFetchFailHandler;
  onBackgroundFetchAbort?: BackgroundFetchAbortHandler;
}

/**
 * Mapping between service worker event names and their corresponding hook function names.
 * This defines all supported service worker events and their expected handler names in the source file.
 *
 * For example: 'install' event expects an 'onInstall' function in the source file.
 */
export const hooksMap = {
  install: 'onInstall',
  activate: 'onActivate',
  fetch: 'onFetch',
  message: 'onMessage',
  push: 'onPush',
  sync: 'onSync',
  notificationclick: 'onNotificationClick',
  notificationclose: 'onNotificationClose',
  backgroundfetchsuccess: 'onBackgroundFetchSuccess',
  backgroundfetchfail: 'onBackgroundFetchFail',
  backgroundfetchabort: 'onBackgroundFetchAbort',
} as const;

/**
 * Type representing all possible hook function names.
 * This is used to ensure type safety when working with hook names.
 *
 * @example
 * type HookName = 'onInstall' | 'onActivate' | ... // all possible hook names
 */
export type HookName = (typeof hooksMap)[keyof typeof hooksMap];

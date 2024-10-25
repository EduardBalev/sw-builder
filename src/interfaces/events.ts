type HandlerFn<T extends Event = ExtendableEvent> = (event: T) => void;

export type InstallHandler = HandlerFn;
export type ActivateHandler = HandlerFn;
export type FetchHandler = HandlerFn<FetchEvent>;
export type PushHandler = HandlerFn<PushEvent>;
export type SyncHandler = HandlerFn<SyncEvent>;
export type NotificationClickHandler = HandlerFn<NotificationEvent>;
export type NotificationCloseHandler = HandlerFn<NotificationEvent>;
export type MessageHandler = HandlerFn<MessageEvent>;
export type BackgroundFetchSuccessHandler =
  HandlerFn<BackgroundFetchSuccessEvent>;
export type BackgroundFetchFailHandler = HandlerFn<BackgroundFetchFailEvent>;
export type BackgroundFetchAbortHandler = HandlerFn<BackgroundFetchAbortEvent>;

export interface SyncEvent extends ExtendableEvent {
  /**
   * A string identifier for the sync event.
   * Used to determine the specific synchronization task.
   */
  readonly tag: string;

  /**
   * Indicates if the sync event was registered with a "user-visible" requirement.
   */
  readonly lastChance: boolean;
}

interface BackgroundFetchRegistration {
  readonly id: string;
  readonly title: string;
  readonly totalDownloadSize: number;
  readonly downloaded: number;
  readonly uploadTotal: number;
  readonly uploaded: number;
  readonly result: "success" | "failure" | "abort";
}

export interface BackgroundFetchSuccessEvent extends ExtendableEvent {
  /**
   * The registration associated with the background fetch, providing access
   * to metadata such as the ID and progress of the fetch.
   */
  readonly registration: BackgroundFetchRegistration;
}

export interface BackgroundFetchFailEvent extends ExtendableEvent {
  /**
   * The registration associated with the background fetch, providing access
   * to metadata and details about the failed fetch.
   */
  readonly registration: BackgroundFetchRegistration;
}

export interface BackgroundFetchAbortEvent extends ExtendableEvent {
  /**
   * The registration associated with the background fetch, providing access
   * to metadata about the fetch that was aborted.
   */
  readonly registration: BackgroundFetchRegistration;
}

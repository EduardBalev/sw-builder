/**
 * Represents the structure of a notification data object that can be sent
 * from the service worker to all clients or specific clients.
 *
 * This interface is used to define the data format of notifications being passed
 * between the service worker and its controlled clients (e.g., browser windows or tabs).
 * The action field specifies the type of notification, and the data field contains
 * the actual payload of the notification.
 */
export interface NotifyData {
  /** The action or type of the notification being sent. */
  action: string;

  /** The actual data or payload associated with the notification. */
  data: unknown;
}

/**
 * Represents the data sent to the service worker to trigger a notification event
 * for all connected clients.
 *
 * This event is used to notify all controlled clients (e.g., browser tabs or windows)
 * from the service worker. The event field contains the notification details in the form
 * of a `NotifyData` object, which carries the action and data of the notification.
 */
export interface NotifyAllEventData {
  /** The action identifier for the notify all event. */
  action: "notifyAll";

  /** The notification data to be sent to all clients. */
  event: NotifyData;
}

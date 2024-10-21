export interface NotifyData {
  action: string;
  data: unknown;
}

export interface NotifyAllEventData {
  action: "notifyAll";
  event: NotifyData;
}

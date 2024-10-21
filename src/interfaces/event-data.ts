export interface PageLoadedEventData {
  action: "pageLoaded";
  staticPatterns: RegExp[];
  disableStaticCache: boolean;
  disableDynamicCache: boolean;
  version: string;
  checkVersion: boolean;
}

export interface UpdateAllEndpointsEventData {
  action: "updateAllEndpoints";
}

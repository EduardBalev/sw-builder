import { DEFAULT_EVENTS } from "./events";
import { SWConfig, SWEvents } from "./interfaces/config";
import { fnRollup } from "./utils/function";

declare const CONFIG: SWConfig;
declare const EVENTS: SWEvents;

for (const eventName in DEFAULT_EVENTS) {
  if (DEFAULT_EVENTS[eventName] || EVENTS[eventName]) {
    self.addEventListener(eventName, (event: ExtendableEvent) => {
      if (DEFAULT_EVENTS[eventName]) {
        DEFAULT_EVENTS[eventName](event, CONFIG);
      }

      if (EVENTS[eventName]) {
        fnRollup(EVENTS[eventName], event);
      }
    });
  }
}

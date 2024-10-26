import { SWConfig, SWEvents } from "./interfaces/config";
import { fnRollup } from "./utils/function";

declare const CONFIG: SWConfig;
declare const EVENTS: SWEvents;

for (const eventName in EVENTS) {
  self.addEventListener(eventName, (event: ExtendableEvent) => {
    fnRollup(EVENTS[eventName], event);
  });
}

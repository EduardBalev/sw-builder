import { fnRollup } from "./utils/function";

for (const eventName in EVENTS) {
  self.addEventListener(eventName, (event: ExtendableEvent) => {
    fnRollup(EVENTS[eventName], event);
  });
}

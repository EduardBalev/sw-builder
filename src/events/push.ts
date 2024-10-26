import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function";

export function pushHandler(event: PushEvent, config: SWConfig) {
  fnRollup(config.events.push, event);
}

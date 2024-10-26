import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function";

export function fetchHandler(event: FetchEvent, config: SWConfig) {
  fnRollup(config.events.fetch, event);
}

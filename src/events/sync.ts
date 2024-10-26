import { SWConfig } from "../interfaces/config";
import { SyncEvent } from "../interfaces/events";
import { fnRollup } from "../utils/function";

export function syncHandler(event: SyncEvent, config: SWConfig) {
  fnRollup(config.events.sync, event);
}

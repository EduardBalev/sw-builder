import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function";

export function messageHandler(event: MessageEvent, config: SWConfig) {
  fnRollup(config.events.message, event);
}

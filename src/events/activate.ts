import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function-rullup";

export function activateHandler(event: ExtendableEvent, config: SWConfig) {
  fnRollup(config.events.activate, event);
}

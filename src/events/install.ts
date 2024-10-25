import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function-rullup";

export function installHandler(event: ExtendableEvent, config: SWConfig) {
  fnRollup(config.events.install, event);
}

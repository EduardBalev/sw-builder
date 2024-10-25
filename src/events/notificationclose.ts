import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function-rullup";

export function notificationCloseHandler(
  event: NotificationEvent,
  config: SWConfig,
) {
  fnRollup(config.events.notificationclose, event);
}

import { SWConfig } from "../interfaces/config";
import { fnRollup } from "../utils/function-rullup";

export function notificationClickHandler(
  event: NotificationEvent,
  config: SWConfig,
) {
  fnRollup(config.events.notificationclick, event);
}

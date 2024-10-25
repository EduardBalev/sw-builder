import { SWConfig } from "../interfaces/config";
import {
  BackgroundFetchAbortEvent,
  BackgroundFetchFailEvent,
  BackgroundFetchSuccessEvent,
} from "../interfaces/events";
import { fnRollup } from "../utils/function-rullup";

export function backgroundFetchSuccessHandler(
  event: BackgroundFetchSuccessEvent,
  config: SWConfig,
) {
  fnRollup(config.events.backgroundfetchsuccess, event);
}

export function backgroundFetchFailHandler(
  event: BackgroundFetchFailEvent,
  config: SWConfig,
) {
  fnRollup(config.events.backgroundfetchfail, event);
}

export function backgroundFetchAbortHandler(
  event: BackgroundFetchAbortEvent,
  config: SWConfig,
) {
  fnRollup(config.events.backgroundfetchabort, event);
}

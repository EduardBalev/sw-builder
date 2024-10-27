import { SWConfig } from "../interfaces/config";
import {
  BackgroundFetchAbortEvent,
  BackgroundFetchFailEvent,
  BackgroundFetchSuccessEvent,
} from "../interfaces/events";

export function backgroundFetchSuccessHandler(
  event: BackgroundFetchSuccessEvent,
  config: SWConfig,
) {}

export function backgroundFetchFailHandler(
  event: BackgroundFetchFailEvent,
  config: SWConfig,
) {}

export function backgroundFetchAbortHandler(
  event: BackgroundFetchAbortEvent,
  config: SWConfig,
) {}

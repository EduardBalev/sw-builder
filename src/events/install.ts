import { HandlerFn } from "../interfaces/events";

export function installHandler(
  event: ExtendableEvent,
  handlers: HandlerFn | HandlerFn[] | string | string[],
) {}

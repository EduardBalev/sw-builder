import { HandlerFn } from "../interfaces/events";
import { fnRollup } from "../utils/function";

export function registerHandlers(
  event: ExtendableEvent,
  handlers: HandlerFn | HandlerFn[] | string | string[],
) {
  fnRollup(handlers, event);
}

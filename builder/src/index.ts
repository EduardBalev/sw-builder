import { SwEventName } from './interfaces/events';

function registerEvent(eventName: SwEventName, fn: Function) {
  if (typeof fn !== 'function') {
    return;
  }

  // TODO: Uncomment this
  // self.addEventListener(eventName, (event: ExtendableEvent) => {
  //   fn(event);
  // });

  fn({ event: eventName });
}

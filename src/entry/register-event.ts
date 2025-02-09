import { addLogger } from '../utils/logger';
import { SwConfig } from '../interfaces/config';

export const registerEventListenerFn = (config: SwConfig) => `function registerEvent(eventName, fn) {
  if (typeof fn !== 'function') {
    return;
  }

  ${addLogger(config, `'Registering event successfully: ', eventName`)}
  
  SW.addEventListener(eventName, (event) => {
    ${addLogger(config, `'Event triggered: ', eventName, event`)}

    fn(event);
  });
}
`;

export function callRegisterEvent(eventName: string, functionName: string) {
  return `// Register ${eventName} event
registerEvent("${eventName}", ${functionName});`;
}

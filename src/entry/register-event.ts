export const registerEventListenerFn = `function registerEvent(eventName, fn) {
  if (typeof fn !== 'function') {
    return;
  }

  SW.addEventListener(eventName, (event) => {
    fn(event);
  });
}
`;

export function callRegisterEvent(eventName: string, functionName: string) {
  return `// Register ${eventName} event
registerEvent("${eventName}", ${functionName});`;
}

// injectedConfig.js
var EVENTS = { "install": [(event) => console.log("Custom install function")], "fetch": [(event) => {
  console.log("Custom fetch handling");
  event.respondWith(fetch(event.request));
}] };

// src/utils/function.ts
function fnRollup(fn, ...args) {
  if (typeof fn === "function") {
    fn(...args);
  }
  if (typeof fn === "string") {
    parseFunctions(fn)(...args);
  }
  if (Array.isArray(fn)) {
    for (const f of fn) {
      fnRollup(f, ...args);
    }
  }
}
function parseFunctions(funcStr) {
  if (typeof funcStr !== "string" || !funcStr.includes("=>") && !funcStr.startsWith("function")) {
    console.error("Invalid function string format.");
    return null;
  }
  try {
    if (funcStr.includes("=>")) {
      const cleanedStr = funcStr.trim().replace(/^\((.*)\)\s*=>\s*\{?(.*)\}?$/, "$1=>$2");
      const [paramStr, body] = cleanedStr.split("=>").map((part) => part.trim());
      if (!paramStr || !body) {
        console.error("Arrow function string is missing parameters or body.");
        return null;
      }
      return new Function(paramStr, body);
    }
    if (funcStr.startsWith("function")) {
      return new Function(`return (${funcStr})`)();
    }
  } catch (error) {
    console.error("Error parsing function string:", error);
    return null;
  }
}

// src/index.ts
for (const eventName in EVENTS) {
  self.addEventListener(eventName, (event) => {
    fnRollup(EVENTS[eventName], event);
  });
}

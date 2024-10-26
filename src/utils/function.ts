export function fnRollup(
  fn: Function | Function[] | string | string[],
  ...args: unknown[]
): void {
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

export function parseFunctions(funcStr: string): Function {
  // Basic validation to check if the string could be a function
  if (
    typeof funcStr !== "string" ||
    (!funcStr.includes("=>") && !funcStr.startsWith("function"))
  ) {
    console.error("Invalid function string format.");
    return null;
  }

  try {
    // Handle arrow function syntax: e.g., "(event) => console.log('Arrow function')"
    if (funcStr.includes("=>")) {
      const cleanedStr = funcStr
        .trim()
        .replace(/^\((.*)\)\s*=>\s*\{?(.*)\}?$/, "$1=>$2");
      const [paramStr, body] = cleanedStr
        .split("=>")
        .map((part) => part.trim());

      // Validate parameters and body
      if (!paramStr || !body) {
        console.error("Arrow function string is missing parameters or body.");
        return null;
      }

      return new Function(paramStr, body);
    }

    // Handle regular function syntax: e.g., "function(event) { console.log('Normal function') }"
    if (funcStr.startsWith("function")) {
      // Use the Function constructor to create a normal function
      return new Function(`return (${funcStr})`)();
    }
  } catch (error) {
    console.error("Error parsing function string:", error);
    return null;
  }
}

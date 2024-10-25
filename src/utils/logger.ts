let __loggerIsEnabled = false;

/**
 * Enables the logger, allowing logs to be printed to the console.
 */
export function enableLogger() {
  __loggerIsEnabled = true;
}

/**
 * Disables the logger, preventing logs from being printed to the console.
 */
export function disableLogger() {
  __loggerIsEnabled = false;
}

/**
 * Logs the provided data to the console if logging is enabled.
 *
 * @param {...unknown[]} data - The data to be logged.
 */
export function logger(...data: unknown[]) {
  if (__loggerIsEnabled) {
    console.log(...data);
  }
}

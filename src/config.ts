import { SWConfig } from "./interfaces/config";

export let CONFIG: SWConfig = getConfig();

export function getConfig(): SWConfig {
  return {
    debug: false,
    events: {},
  };
}

// Allows updating the configuration
export function updateConfig(newConfig: Partial<SWConfig>): SWConfig {
  CONFIG = { ...CONFIG, ...newConfig };
  return CONFIG;
}

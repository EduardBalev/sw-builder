/// <reference lib="webworker" />

import { SWConfig } from "./interfaces/config";

// Declare `CONFIG` as a global constant of type `SWConfig`
declare const CONFIG: SWConfig;

// Declare `EVENTS` as a global constant of type `SWConfig["events"]`
declare const EVENTS: SWConfig["events"];

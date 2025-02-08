/// <reference lib="webworker" />

import { SWConfig, SwHooks } from './interfaces/config';

// Declare `CONFIG` as a global constant of type `SWConfig`
declare const CONFIG: SWConfig;

// Declare `HOOKS` as a global constant of type `SwHooks`
declare const HOOKS: SwHooks;

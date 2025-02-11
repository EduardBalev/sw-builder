#!/usr/bin/env node

import { cli } from './cli';

export * from './interfaces';

// Run the main function
cli().catch(console.error);

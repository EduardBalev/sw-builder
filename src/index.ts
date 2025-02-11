#!/usr/bin/env node

import { cli } from './cli';

// Run the main function
cli().catch(console.error);

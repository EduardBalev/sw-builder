import { SwConfig } from '../interfaces/config';

export function addLogger(config: SwConfig, ...args: any[]) {
  if (config.debug) {
    return `console.log(${args.join(', ')});`;
  }
  return '';
}

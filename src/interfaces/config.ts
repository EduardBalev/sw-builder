export interface SwSetupConfig {
  target: string;
  minify: boolean;
  sourcemap: boolean;
  debug: boolean;
  sourcePath: string; // Path to the source file containing event handlers
}

export type SwConfig = Pick<SwSetupConfig, 'debug'>;

export const CONFIG: SwConfig = {
  debug: false,
};

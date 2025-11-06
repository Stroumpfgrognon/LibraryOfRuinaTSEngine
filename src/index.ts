// Library entry point — re-export every module using the path aliases defined
// in `tsconfig.json`. This keeps imports concise and consistent across the codebase.

// @types
export * from '#results/resultlist';
export * from '#results/results';
export * from '#status/status';
export * from '#triggers/triggers';

// Characters
export * from '#characters/characters';
export * from '#characters/deck';
export * from '#characters/dice';
export * from '#characters/emotion';
export * from '#characters/health';
export * from '#characters/stats';
export * from '#characters/attacks';

// Enums
export * from '#enums/attack';
export * from '#enums/effect';
export * from '#enums/emotion';

// Pages / UI
export * from '#pages/pages';
export * from '#pages/effects';
export * from '#pages/roll';

// Reception
export * from '#reception/reception';

// Sprites
export * from '#sprites/spritesheet';

// Status (mapped in tsconfig)
export * from '#status/regular-status';

// Utils
export * from '#utils/interfaces';

export * from '#characters/exemples';

// NOTE:
// - This file relies on path mappings defined in `tsconfig.json` (the "paths"
//   compiler option). Make sure your build tooling (esbuild/rollup/webpack)
//   is configured to understand TS path aliases or that you use tsconfig-paths
//   / appropriate plugins during the build.

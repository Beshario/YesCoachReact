h$ npm run build

> yescoach@0.1.0 build
> tsc && vite build

vite v6.3.5 building for production...
✓ 85 modules transformed.

PWA v0.21.2
mode      generateSW
precache  1 entries (0.00 KiB)
files generated
  dist/sw.js.map
  dist/sw.js
  dist/workbox-b833909e.js.map
  dist/workbox-b833909e.js
warnings
  One of the glob patterns doesn't match any files. Please remove or fix the following: {
  "globDirectory": "/home/beshariamal/YesCoach/dist",
  "globPattern": "**/*.{js,css,html,ico,png,svg,webp}",
  "globIgnores": [
    "**/node_modules/**/*",
    "sw.js",
    "workbox-*.js"
  ]
}

✗ Build failed in 2.97s
error during build:
[vite-plugin-pwa:build] There was an error during the build:
  src/components/BodyMap/BodyMapViewer.tsx (5:21): "getMuscleById" is not exported by "src/components/BodyMap/MuscleData.js", imported by "src/components/BodyMap/BodyMapViewer.tsx".
Additionally, handling the error in the 'buildEnd' hook caused the following error:
  src/components/BodyMap/BodyMapViewer.tsx (5:21): "getMuscleById" is not exported by "src/components/BodyMap/MuscleData.js", imported by "src/components/BodyMap/BodyMapViewer.tsx".
file: /home/beshariamal/YesCoach/src/components/BodyMap/BodyMapViewer.tsx:5:21

3: import { FrontView } from './FrontView';
4: import { BackView } from './BackView';
5: import { MuscleInfo, getMuscleById } from './MuscleData';
                        ^
6: import styles from './BodyMapViewer.module.css';

    at getRollupError (file:///home/beshariamal/YesCoach/node_modules/rollup/dist/es/shared/parseAst.js:401:41)
    at file:///home/beshariamal/YesCoach/node_modules/rollup/dist/es/shared/node-entry.js:23196:39
    at async catchUnfinishedHookActions (file:///home/beshariamal/YesCoach/node_modules/rollup/dist/es/shared/node-entry.js:22655:16)
    at async rollupInternal (file:///home/beshariamal/YesCoach/node_modules/rollup/dist/es/shared/node-entry.js:23179:5)
    at async buildEnvironment (file:///home/beshariamal/YesCoach/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:46206:14)
    at async Object.defaultBuildApp [as buildApp] (file:///home/beshariamal/YesCoach/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:46684:5)
    at async CAC.<anonymous> (file:///home/beshariamal/YesCoach/node_modules/vite/dist/node/cli.js:863:7)
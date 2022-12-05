#!/usr/bin/env node

import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    logLevel: "info",
    entryPoints: ["./app.js"],
    bundle: true,
    outfile: "build/app.js",
    // bundle: false,
    // outdir: 'build',
    sourcemap: true,
    loader: {
      ".bin": "binary",
    }
  },
  { root: "build" }
);
